/**
 * PrompTrim Core Content Script
 * Orchestrates scanning, monitoring, and integrating all modules
 */

// Global state
const DEBUG = false;
function debug() { if (DEBUG) { try { console.log.apply(console, arguments); } catch (_) {} } }

// Start with null values to prevent any actions until settings are loaded
let enabled = null;
let showFloatingLogo = null;
let minSeverity = null;
let compressionMode = null;
let apiKey = null;
let apiEndpoint = null;
let detectedInputs = new Map();
let observers = [];
let settingsLoaded = false;

// Initialize when DOM is ready (skip if running inside an iframe)
if (window.top === window) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// Expose debug mode globally
window.enablePrompTrimDebug = function() {
  enableDebugMode();
  debug('🎯 PrompTrim: Debug mode activated');
};

window.disablePrompTrimDebug = function() {
  document.body.classList.remove('promptrim-debug');
  debug('🎯 PrompTrim: Debug mode disabled');
};

function init() {
  console.log("🎯 PrompTrim: init() called - content script starting up");
  getSettings();
  
  // Listen for messages from background script
  console.log("🎯 PrompTrim: Setting up message listener");
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("🎯 PrompTrim: Message received:", request.action);
    
    if (request.action === 'settingsUpdated') {
      console.log("🎯 PrompTrim: Processing settings update");
      const wasEnabled = enabled;
      enabled = request.enabled;
      showFloatingLogo = request.showFloatingLogo !== false; // Default to true
      minSeverity = request.minSeverity || 'green';
      compressionMode = request.compressionMode || 'api';
      apiKey = request.apiKey || '';
      apiEndpoint = request.apiEndpoint || 'http://localhost:8000/api/optimize';
      
      console.log("🎯 PrompTrim: Settings extracted - enabled:", enabled, "showFloatingLogo:", showFloatingLogo, "hasApiKey:", !!apiKey);
      
      // Show auto-toggle notification if this was an automatic change
      if (request.autoToggled) {
        const hostname = window.location.hostname;
        console.log(`🤖 PrompTrim: Auto-toggle ${enabled ? 'ENABLED' : 'DISABLED'} extension on ${hostname}`);
      }
      
      if (!apiKey && compressionMode === 'api') enabled = false;
      
      // Update module configs
      window.PrompTrimCompression?.setCompressionConfig({ compressionMode, apiKey, apiEndpoint });
      
      console.log("🎯 PrompTrim: Module configs updated");
      
      // Handle toggle ON: Reinitialize everything
      if (enabled && apiKey) {
        console.log("🎯 PrompTrim: Re-enabling extension after toggle ON. Enabled:", enabled, "API Key:", !!apiKey);
        
        try {
          startMonitoring();
          console.log("🎯 PrompTrim: startMonitoring() completed");
        } catch (e) {
          console.error("🎯 PrompTrim: Error in startMonitoring():", e);
        }
        try {
          console.log("🎯 PrompTrim: Calling refreshAllInputs() to recreate indicators");
          refreshAllInputs();
          console.log("🎯 PrompTrim: refreshAllInputs() completed");
          
          // ✅ Wait a tick to ensure DOM is ready, then update logo visibility
          setTimeout(() => {
            console.log("🎯 PrompTrim: Post-refresh check. Number of indicators:", document.querySelectorAll('.promptrim-indicator-container').length);
            updateAllLogoVisibility();
            console.log("🎯 PrompTrim: Logo visibility updated after refresh");
          }, 200);
        } catch (e) {
          console.error("🎯 PrompTrim: Error in refreshAllInputs:", e);
        }
      } else {
        console.log("🎯 PrompTrim: Disabling extension after toggle OFF. Enabled:", enabled, "API Key:", !!apiKey);
        try {
          stopMonitoring();
          console.log("🎯 PrompTrim: stopMonitoring() completed");
        } catch (e) {
          console.error("🎯 PrompTrim: Error in stopMonitoring():", e);
        }
      }
      
      // Always update logo visibility for existing indicators (for logo toggle changes)
      try {
        updateAllLogoVisibility();
        console.log("🎯 PrompTrim: Logo visibility updated for setting change");
      } catch (e) {
        console.error("🎯 PrompTrim: Error updating logo visibility:", e);
      }
    }
    // Don't return true - all operations are synchronous, no need for async response
  });
}

/**
 * Load settings from storage
 */
function getSettings() {
  chrome.storage.local.get(['enabled', 'showFloatingLogo', 'minSeverity', 'compressionMode', 'apiKey', 'apiEndpoint'], (result) => {
    console.log('🎯 PrompTrim: Loading settings from storage:', result);
    
    enabled = result.enabled !== false;
    showFloatingLogo = result.showFloatingLogo !== false; // Default to true
    minSeverity = result.minSeverity || 'green';
    compressionMode = result.compressionMode || 'api';
    apiKey = result.apiKey || '';
    apiEndpoint = result.apiEndpoint || 'http://localhost:8000/api/optimize';
    
    if (!apiKey && compressionMode === 'api') {
      enabled = false;
    }
    
    // Mark settings as loaded BEFORE doing anything else
    settingsLoaded = true;
    
    console.log('🎯 PrompTrim: Settings loaded - enabled:', enabled, 'showFloatingLogo:', showFloatingLogo);
    
    // Update module configs
    window.PrompTrimCompression?.setCompressionConfig({ compressionMode, apiKey, apiEndpoint });
    
    if (enabled && apiKey) {
      startMonitoring();
      
      // Update logo visibility for any existing indicators after initial settings load
      setTimeout(() => {
        updateAllLogoVisibility();
        console.log('🎯 PrompTrim: Logo visibility updated after initial settings load');
      }, 100);
    } else {
      stopMonitoring();
    }
  });
}

/**
 * Start monitoring page for chat inputs
 */
function startMonitoring() {
  debug('🎯 PrompTrim: startMonitoring() called. Enabled:', enabled, 'API Key:', !!apiKey);
  
  // Prevent monitoring until settings are loaded
  if (!settingsLoaded) {
    debug('🎯 PrompTrim: Monitoring not started - settings not loaded yet');
    return;
  }
  
  if (!enabled || !apiKey) {
    debug('🎯 PrompTrim: Monitoring not started - Enabled:', enabled, 'Has API Key:', !!apiKey);
    return;
  }
  
  debug('🎯 PrompTrim: Starting to monitor for chat inputs...');
  
  scanForInputs();
  
  // Debounced scan to avoid CPU bloat on heavy DOM churn
  let scanScheduled = false;
  let lastScanTime = 0;
  const SCAN_COOLDOWN = 1000; // Only scan once per second
  
  const scheduleScan = () => {
    const now = Date.now();
    if (scanScheduled || (now - lastScanTime < SCAN_COOLDOWN)) return;
    
    scanScheduled = true;
    setTimeout(() => {
      lastScanTime = Date.now();
      scanScheduled = false;
      if (enabled) scanForInputs();
    }, 200);
  };

  const observer = new MutationObserver((mutations) => {
    // Filter by likely chat container nodes to reduce noise
    let hasRelevantMutation = false;
    
    for (const m of mutations) {
      if (m.type === 'childList') {
        const t = (m.target && m.target.nodeName) || '';
        // Only trigger on meaningful container changes
        if ((t === 'DIV' || t === 'SECTION' || t === 'MAIN') && m.addedNodes.length > 0) {
          hasRelevantMutation = true;
          break;
        }
      } else if (m.type === 'attributes') {
        const attrName = m.attributeName;
        // Only trigger on relevant attribute changes
        if (attrName === 'id' || attrName === 'placeholder') {
          hasRelevantMutation = true;
          break;
        }
      }
    }
    
    if (hasRelevantMutation) {
      scheduleScan();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'placeholder']
  });
  
  observers.push(observer);
}

/**
 * Stop monitoring
 */
function stopMonitoring() {
  observers.forEach(obs => obs.disconnect());
  observers = [];
  removeAllOverlays();
}

/**
 * Scan page for potential chat inputs
 */
function scanForInputs() {
  // Prevent scanning until settings are loaded
  if (!settingsLoaded) {
    console.log('🎯 PrompTrim: scanForInputs() called but settings not loaded yet');
    return;
  }
  
  if (!enabled) {
    console.log('🎯 PrompTrim: scanForInputs() called but extension is disabled');
    return;
  }
  
  console.log(`🎯 PrompTrim: Scanning for inputs on ${window.location.hostname}${window.location.pathname}`);
  
  // More specific selectors focused on actual chat inputs
  const selectors = [
    // Specific known chat input IDs
    '#prompt-textarea',
    '#user-input', 
    '#chat-input',
    '#message-input',
    
    // Textareas with chat-like placeholders
    'textarea[placeholder*="message" i]',
    'textarea[placeholder*="chat" i]', 
    'textarea[placeholder*="ask" i]',
    'textarea[placeholder*="type" i]',
    'textarea[placeholder*="send" i]',
    
    // Known chat widget classes
    '.intercom-composer-input',
    '.drift-widget--input',
    '.zcui-input',
    
    // Generic textareas (will be filtered more strictly)
    'textarea',
    
    // Specific input types with chat context
    'input[type="text"][placeholder*="message" i]',
    'input[type="text"][placeholder*="chat" i]',
    'input[type="text"][placeholder*="ask" i]',
    
    // Contenteditable with specific chat classes only
    '[contenteditable="true"][class*="chat"]',
    '[contenteditable="true"][class*="message"]', 
    '[contenteditable="true"][class*="composer"]',
    
    // Role textbox but only with chat context
    '[role="textbox"][class*="chat"]',
    '[role="textbox"][class*="message"]',
    '[role="textbox"][class*="input"]',
  ];
  
  const allInputsSet = new Set();
  let totalFound = 0;
  let passedFilter = 0;
  
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      totalFound += elements.length;
      
      console.log(`🎯 PrompTrim: Selector "${selector}" found ${elements.length} elements`);
      
      elements.forEach(el => {
        const isValid = isLikelyChatInput(el);
        
        // Only log when element is accepted (to reduce noise)
        if (isValid) {
          console.log(`🎯 PrompTrim: ✅ ACCEPTED element:`, {
            tagName: el.tagName,
            id: el.id || '(no id)',
            className: el.className || '(no class)',
            placeholder: el.getAttribute('placeholder') || '(no placeholder)',
            role: el.getAttribute('role') || '(no role)',
            contentEditable: el.contentEditable,
            selector: selector,
            rect: el.getBoundingClientRect()
          });
          
          allInputsSet.add(el);
          passedFilter++;
        }
      });
    } catch (e) {
      console.warn(`🎯 PrompTrim: Invalid selector "${selector}":`, e);
    }
  });
  
  const allInputs = Array.from(allInputsSet);
  console.log(`🎯 PrompTrim: Found ${totalFound} potential inputs, ${passedFilter} passed filter, ${allInputs.length} unique`);
  
  if (document.querySelector('.promptrim-modal')) {
    return;
  }
  
  // PREVENT MULTIPLE LOGOS: Limit to maximum 3 indicators per page
  const MAX_INDICATORS = 3;
  const existingIndicators = document.querySelectorAll('.promptrim-indicator-container').length;
  
  if (existingIndicators >= MAX_INDICATORS) {
    console.log(`🎯 PrompTrim: Already have ${existingIndicators} indicators, skipping new attachments to prevent multiple logos`);
    return;
  }
  
  let attachedCount = 0;
  let allowedAttachments = MAX_INDICATORS - existingIndicators;
  
  // Sort inputs by size (larger inputs are more likely to be primary chat inputs)
  const sortedInputs = allInputs.sort((a, b) => {
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();
    return (rectB.width * rectB.height) - (rectA.width * rectA.height);
  });
  
  sortedInputs.forEach(input => {
    if (!detectedInputs.has(input) && attachedCount < allowedAttachments) {
      console.log(`🎯 PrompTrim: Attaching to input:`, {
        tagName: input.tagName,
        id: input.id || '(no id)', 
        className: input.className || '(no class)',
        size: input.getBoundingClientRect()
      });
      
      attachToInput(input);
      detectedInputs.set(input, true);
      attachedCount++;
    }
  });
  
  if (attachedCount > 0) {
    console.log(`🎯 PrompTrim: Attached indicators to ${attachedCount} new inputs (${existingIndicators + attachedCount} total on page)`);
  }
}

/**
 * Check if element is likely a chat input - STRICT validation
 */
function isLikelyChatInput(element) {
  // Basic validity checks
  if (!element || !element.isConnected) return false;
  
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  
  // STRICT: Must be reasonably sized for actual chat input
  if (rect.width < 150 || rect.height < 25) return false;
  
  // STRICT: Exclude elements in navigation, headers, footers
  const excludeContainers = element.closest('nav, header, footer, aside, .nav, .navbar, .header, .footer, .sidebar');
  if (excludeContainers) return false;
  
  // STRICT: Exclude table elements
  const isInTable = element.closest('table, thead, tbody, tfoot, tr, td, th') !== null;
  if (isInTable) return false;
  
  // STRICT: Exclude non-interactive roles
  const role = element.getAttribute('role');
  const nonInteractiveRoles = ['columnheader', 'rowheader', 'presentation', 'none', 'heading', 'banner', 'navigation', 'complementary'];
  if (role && nonInteractiveRoles.includes(role)) return false;
  
  const tagName = element.tagName.toLowerCase();
  const isContentEditable = element.contentEditable === 'true';
  const hasTextboxRole = element.getAttribute('role') === 'textbox';
  const placeholder = (element.getAttribute('placeholder') || '').toLowerCase();
  const className = (element.className || '').toLowerCase();
  const id = (element.id || '').toLowerCase();
  
  // STRICT: For textarea - must have chat context
  if (tagName === 'textarea') {
    const hasChatContext = 
      placeholder.includes('message') || placeholder.includes('chat') || placeholder.includes('ask') || placeholder.includes('type') ||
      className.includes('chat') || className.includes('message') || className.includes('composer') || className.includes('input') ||
      id.includes('chat') || id.includes('message') || id.includes('prompt') || id.includes('input');
    
    return hasChatContext;
  }
  
  // STRICT: For input[type="text"] - must have strong chat indicators
  if (tagName === 'input') {
    const inputType = element.type.toLowerCase();
    if (['text', 'search'].includes(inputType)) {
      const hasChatPlaceholder = placeholder.includes('message') || placeholder.includes('chat') || placeholder.includes('ask') || placeholder.includes('type');
      return hasChatPlaceholder && !element.disabled && !element.readOnly && rect.width >= 200;
    }
    return false;
  }
  
  // STRICT: For contenteditable - must have strong chat indicators
  if (isContentEditable) {
    if (!['div', 'span', 'p'].includes(tagName)) return false;
    if (element.hasAttribute('readonly') || element.getAttribute('contenteditable') === 'false') return false;
    
    const hasStrongChatClass = className.includes('chat') || className.includes('message') || className.includes('composer');
    return hasStrongChatClass;
  }
  
  // STRICT: For textbox role - must have strong context
  if (hasTextboxRole) {
    if (element.getAttribute('aria-readonly') === 'true') return false;
    
    const hasStrongContext = 
      className.includes('chat') || className.includes('message') || className.includes('input') ||
      id.includes('chat') || id.includes('message') || id.includes('input');
    
    return hasStrongContext;
  }
  
  return false;
}

/**
 * Attach PrompTrim overlay to an input field
 */
function attachToInput(input) {
  // Prevent indicator creation until settings are loaded
  if (!settingsLoaded) {
    console.log('🎯 PrompTrim: attachToInput() called but settings not loaded yet');
    return;
  }
  
  // Check if indicator already exists in DOM
  const existingIndicator = document.querySelector(`.promptrim-indicator-container[data-input-id="${input.id || 'no-id'}"]`);
  
  if (existingIndicator) {
    return;
  }
  
  input.dataset.prompttrimAttached = 'true';
  
  const indicator = createSeverityIndicator(input);
  
  if (!indicator) {
    return;
  }
  
  // Start analysis immediately when user starts typing
  // Update continuously but finalize after 300ms of no typing
  let inputTimeout;
  let isAnalyzing = false;
  
  const startAnalysis = () => {
    if (!isAnalyzing) {
      isAnalyzing = true;
      handleInputChange(input, indicator, true); // true = immediate start
    }
  };
  
  const debouncedInputHandler = () => {
    // Clear any pending timeout
    clearTimeout(inputTimeout);
    // Update after 300ms of no typing
    inputTimeout = setTimeout(() => {
      handleInputChange(input, indicator, false); // false = final analysis
      isAnalyzing = false;
    }, 300);
  };
  
  if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
    input.addEventListener('input', (e) => {
      startAnalysis(); // Start immediately
      debouncedInputHandler(); // Final update after 300ms
    });
    input.addEventListener('focus', (e) => {
      startAnalysis();
    });
  } else if (input.contentEditable === 'true') {
    input.addEventListener('input', (e) => {
      startAnalysis();
      debouncedInputHandler();
    });
    input.addEventListener('focus', (e) => {
      startAnalysis();
    });
  }
  
  // Initial analysis
  handleInputChange(input, indicator, true);
}

/**
 * Handle input changes
 * @param {Element} input - The input element
 * @param {Element} indicator - The severity indicator element
 * @param {boolean} isImmediate - True if this is the immediate start analysis (when user starts typing)
 */
async function handleInputChange(input, indicator, isImmediate = false) {
  if (!enabled) return;
  
  const text = getInputValue(input);
  
  // Don't override display style - let CSS classes handle visibility
  
  if (!text || text.length < 10) {
    indicator.dataset.severity = 'neutral';
    const dot = indicator.querySelector('.promptrim-dot');
    if (dot) dot.className = 'promptrim-dot severity-neutral';
    indicator.setAttribute('title', 'PrompTrim: Start typing to analyze');
    indicator.setAttribute('aria-label', 'PrompTrim ready');
    indicator.dataset.analysis = JSON.stringify({ severity: 'neutral', compressed: text || '' });
    return;
  }
  
  // For immediate analysis (when user starts typing), do quick client-side only
  // For final analysis (after 300ms stop), can do more thorough check
  let analysis;
  try {
    if (isImmediate) {
      // Immediate: Quick client-side analysis only
      analysis = analyzePromptFallback(text);
    } else {
      // Final: Try compression module, fallback to client-side
      analysis = await window.PrompTrimCompression?.analyzePromptWithMode(text) || analyzePromptFallback(text);
    }
  } catch (error) {
    // Fallback to client-side if any error occurs
    analysis = analyzePromptFallback(text);
  }
  
  // Store compressed length before grammar checks
  analysis.compressionBeforeGrammar = analysis.compressed.length;
  
  // Grammar check is skipped for real-time analysis to maintain performance
  // It will be done when user opens the modal if needed
  analysis.grammarErrorCount = 0;
  
  // Show severity indicator using UI module
  window.PrompTrimUI?.showSeverityIndicator(indicator, analysis);
  
  indicator.dataset.analysis = JSON.stringify(analysis);
}

function analyzePromptFallback(prompt) {
  const wordCount = prompt.split(/\s+/).length;
  const redundantPhrases = [
    /\bplease\b/gi, /\bcan you\b/gi, /\bcould you\b/gi, /\bwould you\b/gi,
    /\bI want you to\b/gi, /\bI need you to\b/gi, /\bI would like you to\b/gi,
    /\bkindly\b/gi, /\bjust\b/gi, /\breally\b/gi, /\bvery\b/gi,
    /\bquite\b/gi, /\bextremely\b/gi, /\bin order to\b/gi, /\bfor the purpose of\b/gi,
  ];
  
  const redundantCount = redundantPhrases.reduce((count, pattern) => {
    const matches = prompt.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  let score = 0;
  if (wordCount > 100) score += 3;
  else if (wordCount > 50) score += 2;
  else if (wordCount > 25) score += 1;
  
  if (redundantCount > 5) score += 3;
  else if (redundantCount > 2) score += 2;
  else if (redundantCount > 0) score += 1;
  
  let severity;
  if (score >= 6) severity = 'red';
  else if (score >= 3) severity = 'orange';
  else severity = 'green';
  
  return { severity, original: prompt, compressed: prompt, wordCount, redundantCount };
}

/**
 * Create severity indicator element
 */
function createSeverityIndicator(input) {
  if (document.querySelector(`[data-input-id="${input.id || 'no-id'}"]`)) {
    return null;
  }
  
  const indicator = document.createElement('div');
  indicator.className = 'promptrim-indicator-container';
  indicator.id = `promptrim-indicator-${Date.now()}`;
  indicator.setAttribute('role', 'button');
  indicator.setAttribute('aria-label', 'Show compressed prompt');
  indicator.setAttribute('title', 'PrompTrim: Click to optimize your prompt');
  indicator.setAttribute('data-input-id', input.id || 'no-id');
  
  // Create logo element (always present but hidden by CSS if not enabled)
  const logo = document.createElement('div');
  logo.className = 'promptrim-logo-container';
  
  const logoImg = document.createElement('img');
  logoImg.className = 'promptrim-logo-image';
  logoImg.alt = 'PrompTrim';
  
  // Load favicon from extension
  try {
    if (chrome.runtime && chrome.runtime.getURL) {
      const faviconUrl = chrome.runtime.getURL('public/favicon.png');
      logoImg.src = faviconUrl;
      console.log('🎯 PrompTrim: Loading favicon from:', faviconUrl);
    } else {
      console.warn('🎯 PrompTrim: chrome.runtime not available, using fallback SVG');
      // Fallback SVG if chrome.runtime not available
      logoImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23f97316"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">PT</text></svg>';
    }
  } catch (e) {
    console.error('🎯 PrompTrim: Error loading favicon, using fallback SVG:', e);
    // Fallback SVG on error
    logoImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23f97316"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">PT</text></svg>';
  }
  
  // Success and error event listeners
  logoImg.addEventListener('load', () => {
    console.log('🎯 PrompTrim: Favicon loaded successfully');
  });
  
  logoImg.addEventListener('error', (e) => {
    console.error('🎯 PrompTrim: Failed to load favicon, using fallback SVG. Error:', e);
    logoImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23f97316"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">PT</text></svg>';
  });
  
  logo.appendChild(logoImg);
  
  const dot = document.createElement('div');
  dot.className = 'promptrim-dot severity-neutral';
  
  indicator.appendChild(logo);
  indicator.appendChild(dot);
  
  indicator.dataset.severity = 'neutral';
  
  const container = window.PrompTrimUI?.findChatInputContainer(input);
  
  let updateTimeout;
  
  const smartPosition = () => {
    try {
      if (document.querySelector('.promptrim-modal')) return;
      if (indicator.dataset.isDragged === 'true') return;
      
      const inputRect = input.getBoundingClientRect();
      const containerRect = container ? container.getBoundingClientRect() : inputRect;
      
      const inputWidth = inputRect.width;
      const iconSize = inputWidth < 380 ? 24 : 32;
      indicator.dataset.iconSize = iconSize;
      
      const bgColor = window.PrompTrimUI?.detectBackgroundColor(input);
      if (bgColor?.isLight) {
        indicator.dataset.lightBg = 'true';
      }
      
      const childElements = window.PrompTrimUI?.scanContainerForButtons(container || input);
      const position = window.PrompTrimUI?.calculateSafePosition(inputRect, containerRect, childElements, iconSize);
      
      indicator.style.top = `${position.top}px`;
      indicator.style.left = `${position.left}px`;
      indicator.style.zIndex = '2147483647';
      indicator.style.width = `${iconSize}px`;
      indicator.style.height = `${iconSize}px`;
      
      debug(`🎯 PrompTrim: Positioned at ${position.left},${position.top}, size: ${iconSize}px`);
    } catch (error) {
      console.error('🎯 PrompTrim: Positioning error', error);
      window.PrompTrimUI?.fallbackPosition(indicator);
    }
  };
  
  // Initial positioning - position immediately
  smartPosition();
  setTimeout(smartPosition, 50);
  setTimeout(smartPosition, 200);
  
  indicator.addEventListener('click', async (e) => {
    e.stopPropagation();
    debug('🎯 PrompTrim: Indicator clicked');
    let analysis = JSON.parse(indicator.dataset.analysis || '{}');
    
    if (analysis.severity === 'neutral' || !analysis.original || analysis.original.length < 10) {
      debug('🎯 PrompTrim: Not enough text to show modal');
      return;
    }
    
    // Reorder: Do grammar check FIRST, then API compression
    if (analysis.grammarErrorCount === undefined) {
      let textToCompress = analysis.original;
      let grammarCorrectedText = analysis.original;
      
      // Step 1: Grammar check on the ORIGINAL text
      const grammarCheck = await window.PrompTrimGrammar?.checkGrammarWithLanguageTool(analysis.original);
      if (grammarCheck && grammarCheck.hasErrors) {
        grammarCorrectedText = await window.PrompTrimGrammar?.applyAndVerifyGrammarCorrections(analysis.original, grammarCheck.errors);
        textToCompress = grammarCorrectedText; // Use grammar-corrected text for compression
        analysis.grammarErrorCount = grammarCheck.errorCount;
        
        if (analysis.severity === 'green' && grammarCheck.errorCount > 2) {
          analysis.severity = 'yellow';
        } else if (grammarCheck.errorCount > 5) {
          analysis.severity = 'orange';
        }
      } else {
        analysis.grammarErrorCount = 0;
      }
      
      // Step 2: API compression on the GRAMMAR-CORRECTED text
      const apiAnalysis = await window.PrompTrimCompression?.analyzePromptWithAPIMode(textToCompress);
      if (apiAnalysis && apiAnalysis.compressed) {
        analysis.compressed = apiAnalysis.compressed;
        analysis.compressionBeforeGrammar = grammarCorrectedText.length;
      } else {
        // Fallback to client-side compression on grammar-corrected text
        const fallbackCompression = window.PrompTrimCompression?.compressPrompt(textToCompress) || textToCompress;
        analysis.compressed = fallbackCompression;
        analysis.compressionBeforeGrammar = grammarCorrectedText.length;
      }
    }
    
    showCompressionModal(input, analysis);
  });
  
  const updateVisibility = () => {
    console.log('🎯 PrompTrim: updateVisibility called - settingsLoaded:', settingsLoaded, 'enabled:', enabled, 'showFloatingLogo:', showFloatingLogo);
    
    // Set all visibility classes ATOMICALLY to prevent flash
    if (settingsLoaded && enabled) {
      // FIRST: Set logo visibility class (before making container visible)
      if (showFloatingLogo === true) {
        indicator.classList.add('promptrim-show-logo');
        console.log('🎯 PrompTrim: Added promptrim-show-logo class');
      } else {
        indicator.classList.remove('promptrim-show-logo');
        console.log('🎯 PrompTrim: Removed promptrim-show-logo class');
      }
      
      // SECOND: Make the container visible (after logo class is set)
      indicator.classList.add('promptrim-visible');
      console.log('🎯 PrompTrim: Added promptrim-visible class');
    } else {
      // Hide everything if disabled
      indicator.classList.remove('promptrim-visible', 'promptrim-show-logo');
      console.log('🎯 PrompTrim: Removed all visibility classes (disabled)');
    }
  };

  // Use requestAnimationFrame to avoid React hydration issues and ensure proper sequencing
  requestAnimationFrame(() => {
    if (document.body) {
      document.body.appendChild(indicator);
      
      // CRITICAL: Update visibility immediately after DOM insertion in same frame
      updateVisibility();
    }
  });
  
  const scheduleUpdate = () => {
    // Don't reposition if user has dragged the indicator
    if (indicator.dataset.isDragged === 'true') {
      return;
    }
    
    // Don't reposition if a modal is open
    if (document.querySelector('.promptrim-modal')) {
      return;
    }
    
    // Simply update position - no strict checks
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(smartPosition, 100);
  };
  
  // Only observe resize changes on the input itself
  const resizeObserver = new ResizeObserver(scheduleUpdate);
  resizeObserver.observe(input);
  
  // Handle window resize only (not scroll)
  const handleResize = () => scheduleUpdate();
  window.addEventListener('resize', handleResize);
  
  window.addEventListener('beforeunload', () => {
    clearTimeout(updateTimeout);
    resizeObserver.disconnect();
    window.removeEventListener('resize', handleResize);
  });
  
  window.PrompTrimUI?.enableDragging(indicator, () => {
    // Cleanup handler: called when user finishes dragging
    clearTimeout(updateTimeout);
    resizeObserver.disconnect();
    window.removeEventListener('resize', handleResize);
  });
  
  return indicator;
}

function enableDebugMode() {
  document.body.classList.add('promptrim-debug');
  debug('🎯 PrompTrim: Debug mode enabled');
}

function getInputValue(input) {
  if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
    return input.value;
  } else if (input.contentEditable === 'true') {
    return input.textContent || input.innerText;
  }
  return '';
}

function setInputValue(input, value) {
  if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (input.contentEditable === 'true') {
    input.textContent = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function removeAllOverlays() {
  document.querySelectorAll('.promptrim-indicator-container').forEach(el => el.remove());
  document.querySelectorAll('.promptrim-indicator').forEach(el => el.remove());
  document.querySelectorAll('.promptrim-modal').forEach(el => el.remove());
}

/**
 * Track usage when user accepts a compressed prompt
 */
async function trackUsage(data) {
  try {
    console.log('🎯 PrompTrim: Tracking accepted prompt usage');
    
    // Update local stats
    chrome.storage.local.get(['statsPrompts', 'statsTokens', 'apiKey', 'apiEndpoint'], (result) => {
      const currentPrompts = result.statsPrompts || 0;
      const currentTokens = result.statsTokens || 0;
      const apiKey = result.apiKey || '';
      const endpoint = result.apiEndpoint || 'http://localhost:8000/api/optimize';
      
      chrome.storage.local.set({
        statsPrompts: currentPrompts + 1,
        statsTokens: currentTokens + (data.tokenSavings || 0)
      });
      
      console.log('🎯 PrompTrim: Updated local stats');
      
      // Also send to backend if API key exists
      if (apiKey) {
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            prompt: data.original,
            optimization_level: 'moderate',
            language: 'en'
          })
        }).then(response => {
          if (response.ok) {
            console.log('🎯 PrompTrim: Usage tracked on backend');
          } else {
            console.warn('🎯 PrompTrim: Failed to track usage on backend:', response.status);
          }
        }).catch(error => {
          console.warn('🎯 PrompTrim: Error tracking usage on backend:', error);
        });
      }
    });
  } catch (error) {
    console.error('🎯 PrompTrim: Error tracking usage:', error);
  }
}

function refreshAllInputs() {
  console.log("🎯 PrompTrim: refreshAllInputs() called. Enabled:", enabled);
  
  // Prevent refresh until settings are loaded
  if (!settingsLoaded) {
    console.log("🎯 PrompTrim: refreshAllInputs() called but settings not loaded yet");
    return;
  }
  
  removeAllOverlays();
  detectedInputs.clear();
  if (enabled) {
    console.log("🎯 PrompTrim: Scanning for inputs after refresh...");
    scanForInputs();
  } else {
    console.log("🎯 PrompTrim: Not scanning - extension is disabled");
  }
}

function updateAllLogoVisibility() {
  if (!settingsLoaded || !enabled) return;
  
  console.log('🎯 PrompTrim: Updating logo visibility for all indicators. showFloatingLogo:', showFloatingLogo);
  
  document.querySelectorAll('.promptrim-indicator-container').forEach(indicator => {
    // Use atomic visibility update (same logic as creation)
    if (showFloatingLogo === true) {
      indicator.classList.add('promptrim-show-logo');
    } else {
      indicator.classList.remove('promptrim-show-logo');
    }
  });
}

function showCompressionModal(input, analysis) {
  const existingModal = document.querySelector('.promptrim-modal');
  if (existingModal) existingModal.remove();
  
  const allIndicators = document.querySelectorAll('.promptrim-indicator-container');
  const indicatorsToRestore = [];
  
  allIndicators.forEach(indicator => {
    const wasHidden = indicator.classList.contains('promptrim-hidden-for-modal');
    indicatorsToRestore.push({ element: indicator, wasHidden });
    indicator.classList.add('promptrim-hidden-for-modal');
  });
  
  const modal = document.createElement('div');
  modal.className = 'promptrim-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Prompt compression options');
  
  const compressedLength = Math.round(analysis.compressed.length);
  const originalLength = Math.round(analysis.original.length);
  const originalTokens = Math.round(originalLength / 4);
  const compressedTokens = Math.round(compressedLength / 4);
  
  // Check if compressed version has MORE tokens than original
  const hasTokenIncrease = compressedTokens > originalTokens;
  const tokenSavings = originalTokens - compressedTokens;
  const tokenSavingsPercent = Math.round((tokenSavings / originalTokens) * 100);
  const savings = Math.round((1 - compressedLength / originalLength) * 100);
  
  const costPer1KTokens = 0.01;
  const originalCost = (originalTokens / 1000) * costPer1KTokens;
  const compressedCost = (compressedTokens / 1000) * costPer1KTokens;
  const costSavings = originalCost - compressedCost;
  
  let grammarIndicator = '';
  let grammarWarning = '';
  
  if (analysis.grammarErrorCount && analysis.grammarErrorCount > 0) {
    grammarIndicator = `
      <div class="promptrim-grammar-info">
        <span class="promptrim-grammar-badge">
          ✓ Grammar corrected (${analysis.grammarErrorCount} ${analysis.grammarErrorCount === 1 ? 'error' : 'errors'} fixed)
        </span>
      </div>
    `;
  }
  
  // Show warning only when token count increased beyond original
  if (hasTokenIncrease) {
    const increaseAmount = compressedTokens - originalTokens;
    const increasePercent = Math.round((increaseAmount / originalTokens) * 100);
    
    grammarWarning = `
      <div class="promptrim-grammar-warning" style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px; margin: 16px 0;">
        <strong>⚠️ Token Increase Detected</strong><br>
        <p style="margin: 8px 0 0 0; color: #856404;">
          The optimized version has ${increaseAmount} more tokens (${increasePercent}% increase) than the original.
          ${analysis.grammarErrorCount > 0 ? `Grammar corrections contributed to this increase.` : ''}
          <br><strong>Recommendation: Keep the original prompt</strong> to avoid increased costs.
        </p>
      </div>
    `;
  }
  
  const statsDisplay = hasTokenIncrease ? `
    <div class="promptrim-stats">
      <div class="promptrim-stat-item" style="color: #dc3545;">
        <span class="promptrim-stat-label">Tokens:</span>
        <span class="promptrim-stat-value">${originalTokens} → ${compressedTokens}</span>
        <span class="promptrim-stat-savings" style="color: #dc3545;">↑ ${Math.abs(tokenSavings)} (${Math.abs(tokenSavingsPercent)}% increase)</span>
      </div>
      <div class="promptrim-stat-item" style="color: #dc3545;">
        <span class="promptrim-stat-label">Cost:</span>
        <span class="promptrim-stat-value">$${originalCost.toFixed(4)} → $${compressedCost.toFixed(4)}</span>
        <span class="promptrim-stat-savings" style="color: #dc3545;">↑ ${(Math.abs(costSavings) * 100).toFixed(2)}¢ increase</span>
      </div>
    </div>
  ` : `
    <div class="promptrim-stats">
      <div class="promptrim-stat-item">
        <span class="promptrim-stat-label">Tokens:</span>
        <span class="promptrim-stat-value">${originalTokens} → ${compressedTokens}</span>
        <span class="promptrim-stat-savings">↓ ${tokenSavings} (${tokenSavingsPercent}%)</span>
      </div>
      <div class="promptrim-stat-item">
        <span class="promptrim-stat-label">Cost:</span>
        <span class="promptrim-stat-value">$${originalCost.toFixed(4)} → $${compressedCost.toFixed(4)}</span>
        <span class="promptrim-stat-savings">↓ ${(costSavings * 100).toFixed(2)}¢</span>
      </div>
    </div>
  `;
  
  modal.innerHTML = `
    <div class="promptrim-modal-content">
      <div class="promptrim-modal-header">
        <h3>PrompTrim Optimization</h3>
        <button class="promptrim-close" aria-label="Close modal">×</button>
      </div>
      <div class="promptrim-modal-body">
        ${grammarWarning}
        <div class="promptrim-original">
          <h4>Original Prompt (${originalLength} chars)</h4>
          <p class="promptrim-text">${escapeHtml(analysis.original)}</p>
        </div>
        <div class="promptrim-compressed">
          <h4>Compressed & Corrected Prompt (${compressedLength} chars) 
            ${hasTokenIncrease 
              ? `<span style="color: #dc3545;">${Math.abs(savings)}% larger</span>` 
              : `<span class="promptrim-savings">${savings}% smaller</span>`
            }
          </h4>
          ${grammarIndicator}
          <p class="promptrim-text">${escapeHtml(analysis.compressed)}</p>
          ${statsDisplay}
        </div>
      </div>
      <div class="promptrim-modal-footer">
        <button class="promptrim-btn promptrim-reject" aria-label="Keep original prompt">Keep Original</button>
        <div class="promptrim-footer-actions">
          <button class="promptrim-btn promptrim-dashboard" aria-label="View dashboard and analytics">Dashboard</button>
          <button class="promptrim-btn promptrim-accept" aria-label="Accept compressed prompt" ${hasTokenIncrease ? 'style="background: #dc3545;"' : ''}>
            ${hasTokenIncrease ? 'Use Anyway (Not Recommended)' : 'Use Compressed'}
          </button>
        </div>
      </div>
    </div>
  `;
  
  const restoreIndicators = () => {
    indicatorsToRestore.forEach(({ element, wasHidden }) => {
      if (!wasHidden) element.classList.remove('promptrim-hidden-for-modal');
    });
  };
  
  const closeBtn = modal.querySelector('.promptrim-close');
  const acceptBtn = modal.querySelector('.promptrim-accept');
  const rejectBtn = modal.querySelector('.promptrim-reject');
  const dashboardBtn = modal.querySelector('.promptrim-dashboard');
  
  closeBtn.addEventListener('click', () => { modal.remove(); restoreIndicators(); });
  rejectBtn.addEventListener('click', () => { modal.remove(); restoreIndicators(); });
  
  dashboardBtn.addEventListener('click', () => {
    chrome.storage.local.get(['apiKey'], (result) => {
      const apiKey = result.apiKey || '';
      chrome.tabs.create({ url: `http://localhost:5173/dashboard?apiKey=${encodeURIComponent(apiKey)}`, active: true });
    });
    modal.remove();
    restoreIndicators();
  });
  
  acceptBtn.addEventListener('click', async () => {
    // Track usage to dashboard and update local stats
    await trackUsage({
      original: analysis.original,
      compressed: analysis.compressed,
      tokenSavings: tokenSavings,
      costSavings: costSavings,
      savingsPercent: tokenSavingsPercent
    });
    
    // Apply the compressed text to input
    setInputValue(input, analysis.compressed);
    modal.remove();
    restoreIndicators();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) { modal.remove(); restoreIndicators(); }
  });
  
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      modal.remove();
      restoreIndicators();
      document.removeEventListener('keydown', escapeHandler);
    }
  });
  
  document.body.appendChild(modal);
  setTimeout(() => acceptBtn.focus(), 100);
}

// Export core state to window for module access (only after initialization)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'PrompTrimCore', {
    get: function() {
      return {
        get enabled() { return enabled; },
        set enabled(val) { enabled = val; },
        get showFloatingLogo() { return showFloatingLogo; },
        set showFloatingLogo(val) { showFloatingLogo = val; updateAllLogoVisibility(); },
        get minSeverity() { return minSeverity; },
        get compressionMode() { return compressionMode; },
        get apiKey() { return apiKey; },
        get apiEndpoint() { return apiEndpoint; },
        refreshAllInputs,
        updateAllLogoVisibility
      };
    },
    configurable: true
  });
}

// Unused legacy functions removed to prevent chrome.runtime.getURL errors

