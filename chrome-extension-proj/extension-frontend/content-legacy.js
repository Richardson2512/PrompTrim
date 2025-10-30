/**
 * PrompTrim Content Script
 * Detects chat inputs, injects UI overlay, analyzes prompts, and provides compression
 */

// Global state
const DEBUG = false;
function debug() { if (DEBUG) { try { console.log.apply(console, arguments); } catch (_) {} } }

let enabled = true;
let floatingLogo = true;
let minSeverity = 'green';
let compressionMode = 'client';
let apiKey = '';
let apiEndpoint = 'http://localhost:8000/api/optimize';
let detectedInputs = new Map();
let observers = [];
let languagetoolEndpoint = 'https://api.languagetool.org/v2/check'; // Public API
let grammarCheckingEnabled = true;

// Initialize when DOM is ready (skip if running inside an iframe)
if (window.top === window) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// Expose debug mode globally for testing
window.enablePrompTrimDebug = function() {
  enableDebugMode();
  debug('🎯 PrompTrim: Debug mode activated. Call window.disablePrompTrimDebug() to disable.');
};

window.disablePrompTrimDebug = function() {
  document.body.classList.remove('promptrim-debug');
  debug('🎯 PrompTrim: Debug mode disabled.');
};

function init() {
  getSettings();
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'settingsUpdated') {
      enabled = request.enabled;
      floatingLogo = request.floatingLogo !== false;
      minSeverity = request.minSeverity || 'green';
      compressionMode = request.compressionMode || 'api';
      apiKey = request.apiKey || '';
      apiEndpoint = request.apiEndpoint || 'http://localhost:8000/api/optimize';
      
      if (!apiKey && compressionMode === 'api') enabled = false;
      
      enabled && apiKey ? startMonitoring() : stopMonitoring();
      refreshAllInputs();
      
      // Don't call updateLogoVisibility here - let new indicators be created with correct display
    }
    return true;
  });
}

/**
 * Load settings from storage
 */
function getSettings() {
  chrome.storage.local.get(['enabled', 'floatingLogo', 'minSeverity', 'compressionMode', 'apiKey', 'apiEndpoint'], (result) => {
    enabled = result.enabled !== false;
    floatingLogo = result.floatingLogo !== false; // Default to true if not set
    minSeverity = result.minSeverity || 'green';
    compressionMode = result.compressionMode || 'api';
    apiKey = result.apiKey || '';
    apiEndpoint = result.apiEndpoint || 'http://localhost:8000/api/optimize';
    
    if (!apiKey && compressionMode === 'api') {
      enabled = false;
    }
    
    if (enabled && apiKey) {
      startMonitoring();
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
  
  if (!enabled || !apiKey) {
    debug('🎯 PrompTrim: Monitoring not started - Enabled:', enabled, 'Has API Key:', !!apiKey);
    return;
  }
  
  debug('🎯 PrompTrim: Starting to monitor for chat inputs...');
  
  // Scan for existing inputs
  scanForInputs();
  
  // Watch for dynamic content
  // Debounced scan to avoid CPU bloat on heavy DOM churn
  let scanScheduled = false;
  const scheduleScan = () => {
    if (scanScheduled) return;
    scanScheduled = true;
    setTimeout(() => {
      scanScheduled = false;
      if (enabled) scanForInputs();
    }, 150);
  };

  const observer = new MutationObserver((mutations) => {
    // Filter by likely chat container nodes to reduce noise
    for (const m of mutations) {
      if (m.type === 'childList') {
        const t = (m.target && m.target.nodeName) || '';
        if (t === 'DIV' || t === 'SECTION' || t === 'MAIN') {
          scheduleScan();
          break;
        }
      } else if (m.type === 'attributes') {
        scheduleScan();
        break;
      }
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
  // Don't scan if extension is disabled
  if (!enabled) {
    console.log('🎯 PrompTrim: scanForInputs() called but extension is disabled');
    return;
  }
  
  console.log('🎯 PrompTrim: Scanning for chat inputs...');
  
  const selectors = [
    // Standard HTML inputs
    'input[type="text"]',
    'textarea',
    
    // Common chat widget selectors
    '[role="textbox"]',
    '[contenteditable="true"]',
    
    // Specific platform selectors
    // ChatGPT
    '#prompt-textarea',
    'textarea[placeholder*="Message"]',
    
    // Intercom
    '.intercom-composer-input',
    
    // Drift
    '.drift-widget--input',
    
    // Zendesk
    '.zcui-input',
    
    // Generic chat patterns
    '[class*="chat-input"]',
    '[class*="message-input"]',
    '[id*="chat-input"]',
    '[id*="message-input"]',
    '[class*="prompt"]',
    '[id*="prompt"]',
  ];
  
  const allInputs = [];
  
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (isLikelyChatInput(el)) {
          allInputs.push(el);
        }
      });
    } catch (e) {
      // Invalid selector, skip
    }
  });
  
  // Process each detected input (only log when attaching new inputs)
  // Skip if modal is currently open
  if (document.querySelector('.promptrim-modal')) {
    return;
  }
  
  allInputs.forEach(input => {
    if (!detectedInputs.has(input)) {
      console.log('🎯 PrompTrim: Found new chat input, attaching indicator');
      attachToInput(input);
      detectedInputs.set(input, true);
    }
  });
}

/**
 * Check if element is likely a chat input
 */
function isLikelyChatInput(element) {
  if (!element || !element.isConnected) return false;
  
  // Skip hidden elements (display: none)
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    console.log('🎯 PrompTrim: Skipping hidden element');
    return false;
  }
  
  // Must be visible
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    console.log('🎯 PrompTrim: Skipping zero-size element');
    return false;
  }
  
  // Check placeholder/text content for chat-like indicators
  const text = (element.textContent || element.placeholder || '').toLowerCase();
  const chatKeywords = ['message', 'type', 'chat', 'send', 'ask', 'prompt', 'question'];
  
  const hasChatKeyword = chatKeywords.some(keyword => text.includes(keyword));
  
  // Check for typical chat input patterns
  const tagName = element.tagName.toLowerCase();
  const isInputOrTextarea = tagName === 'input' || tagName === 'textarea' || tagName === 'div';
  const isContentEditable = element.contentEditable === 'true';
  const hasTextboxRole = element.getAttribute('role') === 'textbox';
  
  // For ChatGPT and similar sites, prioritize contentEditable divs
  if (isContentEditable && tagName === 'div' && rect.width > 100 && rect.height > 20) {
    return true;
  }
  
  return (isInputOrTextarea || isContentEditable || hasTextboxRole) && hasChatKeyword;
}

/**
 * Attach PrompTrim overlay to an input field
 */
function attachToInput(input) {
  // Skip if already processed
  if (input.dataset.prompttrimAttached === 'true') return;
  input.dataset.prompttrimAttached = 'true';
  
  // Create floating indicator
  const indicator = createSeverityIndicator(input);
  
  // If indicator creation failed (null), don't attach handlers
  if (!indicator) return;
  
  // Track input events
  const inputHandler = () => handleInputChange(input, indicator);
  
  if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
    input.addEventListener('input', inputHandler);
    input.addEventListener('focus', inputHandler);
  } else if (input.contentEditable === 'true') {
    input.addEventListener('input', inputHandler);
    input.addEventListener('focus', inputHandler);
  }
  
  // Initial check
  handleInputChange(input, indicator);
}

/**
 * Handle input changes
 */
async function handleInputChange(input, indicator) {
  // Return early if extension is disabled
  if (!enabled) return;
  
  const text = getInputValue(input);
  
  // Always show the indicator (like Grammarly/Quillbot)
  indicator.style.display = 'flex';
  
  if (!text || text.length < 10) {
    // Too short to analyze - show neutral state
    indicator.dataset.severity = 'neutral';
    const dot = indicator.querySelector('.promptrim-dot');
    if (dot) dot.className = 'promptrim-dot severity-neutral';
    indicator.setAttribute('title', 'PrompTrim: Start typing to analyze');
    indicator.setAttribute('aria-label', 'PrompTrim ready');
    indicator.dataset.analysis = JSON.stringify({ severity: 'neutral', compressed: text || '' });
    return;
  }
  
  // Analyze prompt - use API if configured, otherwise client-side
  let analysis;
  if (compressionMode === 'api' && apiKey) {
    // Use API for compression
    analysis = await analyzePromptWithAPI(text);
    if (!analysis) {
      // Fallback to client-side if API fails
      analysis = analyzePrompt(text);
    }
  } else {
    // Use client-side compression
    analysis = analyzePrompt(text);
  }
  
  // Check grammar using LanguageTool and apply corrections to compressed text
  const grammarCheck = await checkGrammarWithLanguageTool(analysis.compressed);
  if (grammarCheck && grammarCheck.hasErrors) {
    // Apply grammar corrections to the compressed text and verify
    const correctedText = await applyAndVerifyGrammarCorrections(analysis.compressed, grammarCheck.errors);
    
    // Update the compressed text with grammar corrections
    analysis.compressed = correctedText;
    analysis.grammarErrorCount = grammarCheck.errorCount;
    
    // Update severity based on grammar errors
    if (analysis.severity === 'green' && grammarCheck.errorCount > 2) {
      analysis.severity = 'yellow';
    } else if (grammarCheck.errorCount > 5) {
      analysis.severity = 'orange';
    }
  }
  
  // Always show indicator but update severity
  showSeverityIndicator(indicator, analysis);
  
  // Store analysis for modal
  indicator.dataset.analysis = JSON.stringify(analysis);
}

/**
 * Check grammar using LanguageTool API
 */
const grammarCache = new Map(); // key -> { ts, result }
const GRAMMAR_TTL_MS = 60_000; // 1 minute

async function checkGrammarWithLanguageTool(text) {
  if (!grammarCheckingEnabled || !text || text.length < 10) {
    return null;
  }

  // Cache by a lightweight hash of last 500 chars
  const slice = text.slice(-500);
  const hash = `${slice.length}:${slice.charCodeAt(0) || 0}:${slice.charCodeAt(slice.length-1) || 0}`;
  const cached = grammarCache.get(hash);
  const now = Date.now();
  if (cached && (now - cached.ts) < GRAMMAR_TTL_MS) {
    return cached.result;
  }
  
  try {
    const response = await fetch(languagetoolEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        language: 'en-US'
      })
    });
    
    if (!response.ok) {
      console.warn('LanguageTool API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    // Process grammar errors
    if (data.matches && data.matches.length > 0) {
      const result = {
        hasErrors: true,
        errors: data.matches.map(match => ({
          message: match.message,
          shortMessage: match.shortMessage,
          replacements: match.replacements.slice(0, 3), // Top 3 suggestions
          offset: match.offset,
          length: match.length,
          context: match.context || {},
          rule: match.rule
        })),
        errorCount: data.matches.length
      };
      grammarCache.set(hash, { ts: now, result });
      return result;
    }
    const result = { hasErrors: false, errors: [] };
    grammarCache.set(hash, { ts: now, result });
    return result;
  } catch (error) {
    console.warn('LanguageTool grammar check error:', error);
    return null;
  }
}

/**
 * Apply and verify grammar corrections iteratively until text is grammatically correct
 */
async function applyAndVerifyGrammarCorrections(text, errors) {
  if (!errors || errors.length === 0) {
    return text;
  }
  
  // Apply initial corrections
  let correctedText = applyGrammarCorrections(text, errors);
  
  // Re-check the corrected text up to 3 times to ensure it makes sense
  let maxIterations = 3;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    const recheck = await checkGrammarWithLanguageTool(correctedText);
    
    if (!recheck || !recheck.hasErrors || recheck.errorCount === 0) {
      // Text is grammatically correct
      break;
    }
    
    // If there are fewer errors than before, we're improving
    // Otherwise, try alternative corrections
    if (recheck.errorCount < errors.length) {
      // Apply the new corrections
      correctedText = applyGrammarCorrections(correctedText, recheck.errors);
      errors = recheck.errors;
    } else {
      // Try alternative corrections if the first didn't work well
      correctedText = applyGrammarCorrectionsWithAlternatives(correctedText, recheck.errors);
      errors = recheck.errors;
    }
    
    iteration++;
  }
  
  return correctedText;
}

/**
 * Apply grammar corrections to text
 */
function applyGrammarCorrections(text, errors) {
  if (!errors || errors.length === 0) {
    return text;
  }
  
  // Sort errors by offset in reverse order to apply corrections from end to start
  // This prevents offset changes when applying corrections
  const sortedErrors = [...errors].sort((a, b) => b.offset - a.offset);
  
  let correctedText = text;
  
  for (const error of sortedErrors) {
    const start = error.offset;
    const end = error.offset + error.length;
    
    // Get the best replacement (first suggestion)
    const replacement = error.replacements && error.replacements.length > 0
      ? error.replacements[0].value
      : text.substring(start, end); // Keep original if no replacement
    
    // Replace the error with the correction
    correctedText = correctedText.substring(0, start) + replacement + correctedText.substring(end);
  }
  
  return correctedText;
}

/**
 * Apply grammar corrections with alternative suggestions when first doesn't work
 */
function applyGrammarCorrectionsWithAlternatives(text, errors) {
  if (!errors || errors.length === 0) {
    return text;
  }
  
  // Sort errors by offset in reverse order
  const sortedErrors = [...errors].sort((a, b) => b.offset - a.offset);
  
  let correctedText = text;
  
  for (const error of sortedErrors) {
    const start = error.offset;
    const end = error.offset + error.length;
    
    // Try to get a replacement, preferring alternatives if first didn't work
    let replacement = null;
    
    if (error.replacements && error.replacements.length > 0) {
      // Prefer short, sensible replacements
      for (const rep of error.replacements) {
        if (rep.value && rep.value.length > 0) {
          replacement = rep.value;
          break;
        }
      }
    }
    
    // If no good replacement found, keep original
    if (!replacement) {
      replacement = text.substring(start, end);
    }
    
    // Replace the error with the correction
    correctedText = correctedText.substring(0, start) + replacement + correctedText.substring(end);
  }
  
  return correctedText;
}

/**
 * Analyze prompt using API
 */
async function analyzePromptWithAPI(prompt) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'compressWithAPI',
      prompt: prompt
    });
    
    if (response && response.success && response.compressed) {
      // Get severity using client-side analysis
      const baseAnalysis = analyzePrompt(prompt);
      
      // Replace compressed text with API result
      return {
        ...baseAnalysis,
        compressed: response.compressed,
        savings: response.savings || Math.round((1 - response.compressed.length / prompt.length) * 100)
      };
    }
    
    // If API returns an error, silently fall back to client-side compression
    if (response && response.error) {
      console.warn('PrompTrim: API compression failed, using client-side:', response.error);
    }
    
    return null;
  } catch (error) {
    console.warn('PrompTrim: API compression error, falling back to client-side:', error);
    return null;
  }
}

/**
 * Analyze prompt and return severity + suggestions
 */
function analyzePrompt(prompt) {
  const wordCount = prompt.split(/\s+/).length;
  const charCount = prompt.length;
  const avgWordLength = charCount / wordCount;
  
  // Redundant phrases to detect
  const redundantPhrases = [
    /\bplease\b/gi,
    /\bcan you\b/gi,
    /\bcould you\b/gi,
    /\bwould you\b/gi,
    /\bI want you to\b/gi,
    /\bI need you to\b/gi,
    /\bI would like you to\b/gi,
    /\bkindly\b/gi,
    /\bjust\b/gi,
    /\breally\b/gi,
    /\bvery\b/gi,
    /\bquite\b/gi,
    /\bextremely\b/gi,
    /\bin order to\b/gi,
    /\bfor the purpose of\b/gi,
    /\bwith regards to\b/gi,
    /\breferring to\b/gi,
  ];
  
  const redundantCount = redundantPhrases.reduce((count, pattern) => {
    const matches = prompt.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  // Check for repetition
  const words = prompt.toLowerCase().split(/\s+/);
  const wordFrequency = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  const repeatedWords = Object.values(wordFrequency).filter(count => count > 2).length;
  
  // Calculate severity score
  let score = 0;
  
  // Word count factors
  if (wordCount > 100) score += 3;
  else if (wordCount > 50) score += 2;
  else if (wordCount > 25) score += 1;
  
  // Redundant phrase factors
  if (redundantCount > 5) score += 3;
  else if (redundantCount > 2) score += 2;
  else if (redundantCount > 0) score += 1;
  
  // Repetition factors
  if (repeatedWords > 5) score += 2;
  else if (repeatedWords > 2) score += 1;
  
  // Average word length (complexity)
  if (avgWordLength > 6) score += 1;
  
  // Determine severity
  let severity;
  if (score >= 6) severity = 'red';
  else if (score >= 3) severity = 'orange';
  else severity = 'green';
  
  // Compress the prompt
  const compressed = compressPrompt(prompt);
  const tokenSavings = Math.round((1 - compressed.length / prompt.length) * 100);
  
  return {
    severity,
    score,
    original: prompt,
    compressed,
    tokenSavings,
    wordCount,
    redundantCount
  };
}

/**
 * Compress prompt using rule-based algorithm
 */
function compressPrompt(prompt) {
  let compressed = prompt;
  
  // Remove redundant phrases
  const replacements = [
    { pattern: /\bplease\b/gi, replacement: '' },
    { pattern: /\bcan you\b/gi, replacement: '' },
    { pattern: /\bcould you\b/gi, replacement: '' },
    { pattern: /\bwould you\b/gi, replacement: '' },
    { pattern: /\bI want you to\b/gi, replacement: '' },
    { pattern: /\bI need you to\b/gi, replacement: '' },
    { pattern: /\bI would like you to\b/gi, replacement: '' },
    { pattern: /\bkindly\b/gi, replacement: '' },
    { pattern: /\bjust\b/gi, replacement: '' },
    { pattern: /\breally\b/gi, replacement: '' },
    { pattern: /\bvery\b/gi, replacement: '' },
    { pattern: /\bquite\b/gi, replacement: '' },
    { pattern: /\bextremely\b/gi, replacement: '' },
    { pattern: /\bin order to\b/gi, replacement: 'to' },
    { pattern: /\bfor the purpose of\b/gi, replacement: 'for' },
    { pattern: /\bwith regards to\b/gi, replacement: 'about' },
    { pattern: /\breferring to\b/gi, replacement: 'on' },
    { pattern: /\bI think that\b/gi, replacement: '' },
    { pattern: /\bI believe that\b/gi, replacement: '' },
    { pattern: /\bas you know\b/gi, replacement: '' },
  ];
  
  replacements.forEach(({ pattern, replacement }) => {
    compressed = compressed.replace(pattern, replacement);
  });
  
  // Remove extra whitespace
  compressed = compressed.replace(/\s+/g, ' ');
  compressed = compressed.replace(/\s+([,.!?])/g, '$1');
  compressed = compressed.trim();
  
  return compressed;
}

/**
 * Check if indicator should be shown based on min severity setting
 */
function shouldShowIndicator(severity) {
  const severityOrder = { green: 1, orange: 2, red: 3 };
  return severityOrder[severity] >= severityOrder[minSeverity];
}

function updateLogoVisibility() {
  document.querySelectorAll('.promptrim-indicator-container .promptrim-logo').forEach(logoImg => {
    logoImg.style.setProperty('display', floatingLogo ? 'block' : 'none', 'important');
  });
}

/**
 * Create severity indicator element with robust collision detection
 */
function createSeverityIndicator(input) {
  // Check if this input already has an indicator
  if (document.querySelector(`[data-input-id="${input.id || 'no-id'}"]`)) {
    console.log('🎯 PrompTrim: Indicator already exists for this input, skipping');
    return null;
  }
  
  // Create container div
  const indicator = document.createElement('div');
  indicator.className = 'promptrim-indicator-container';
  indicator.id = `promptrim-indicator-${Date.now()}`;
  indicator.setAttribute('role', 'button');
  indicator.setAttribute('aria-label', 'Show compressed prompt');
  indicator.setAttribute('title', 'PrompTrim: Click to optimize your prompt');
  indicator.setAttribute('data-input-id', input.id || 'no-id');
  
  // Create the logo img element
  const logoImg = document.createElement('img');
  logoImg.src = chrome.runtime.getURL('public/favicon.png');
  logoImg.alt = 'PrompTrim';
  logoImg.className = 'promptrim-logo';
  logoImg.style.setProperty('display', floatingLogo ? 'block' : 'none', 'important');
  
  // Create severity dot
  const dot = document.createElement('div');
  dot.className = 'promptrim-dot severity-neutral';
  
  // Add them to indicator (no close button)
  indicator.appendChild(logoImg);
  indicator.appendChild(dot);
  
  // Store severity in container for easy updates
  indicator.dataset.severity = 'neutral';
  
  // Detect chat input container for better positioning
  const container = findChatInputContainer(input);
  
  // Smart positioning with robust collision detection
  const smartPosition = () => {
    try {
      // Skip positioning if a modal is open
      if (document.querySelector('.promptrim-modal')) {
        return;
      }
      
      // Skip positioning if user has manually dragged the icon
      if (indicator.dataset.isDragged === 'true') {
        return;
      }
      
      const inputRect = input.getBoundingClientRect();
      const containerRect = container ? container.getBoundingClientRect() : inputRect;
      
      // Fixed sizing: 32px default, 24px for narrow inputs
      const inputWidth = inputRect.width;
      const iconSize = inputWidth < 380 ? 24 : 32;
      indicator.dataset.iconSize = iconSize;
      
      // Detect background color for contrast enhancement (no longer needed for transparent icon)
      const bgColor = detectBackgroundColor(input);
      // Keep data attribute for reference but no visual border
      if (bgColor.isLight) {
        indicator.dataset.lightBg = 'true';
      }
      
      // Scan for ALL child elements including right-aligned icons/buttons
      const childElements = scanContainerForButtons(container || input);
      
      // Calculate safe position with 12px margin enforcement
      const position = calculateSafePosition(inputRect, containerRect, childElements, iconSize);
      
      // Verify icon won't interfere with text input (uses fixed positioning)
      // Our icon floats above, so it won't overlap text - unlike the tutorial's inline approach
      
      // Apply position
      indicator.style.top = `${position.top}px`;
      indicator.style.left = `${position.left}px`;
      indicator.style.zIndex = '2147483647';
      indicator.style.width = `${iconSize}px`;
      indicator.style.height = `${iconSize}px`;
      
      console.log(`🎯 PrompTrim: Positioned at ${position.left},${position.top}, size: ${iconSize}px (${iconSize === 32 ? 'standard' : 'narrow'})`);
    } catch (error) {
      console.error('🎯 PrompTrim: Positioning error', error);
      // Fallback: position at bottom-right of viewport
      fallbackPosition(indicator);
    }
  };
  
  // Initial positioning
  setTimeout(smartPosition, 50);
  setTimeout(smartPosition, 200);
  
  // Add click handler
  indicator.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('🎯 PrompTrim: Indicator clicked');
    const analysis = JSON.parse(indicator.dataset.analysis || '{}');
    
    // Don't show modal if in neutral state (no text or too short)
    if (analysis.severity === 'neutral' || !analysis.original || analysis.original.length < 10) {
      console.log('🎯 PrompTrim: Not enough text to show modal');
      return;
    }
    
    showCompressionModal(input, analysis);
  });
  
  // Show indicator immediately
  indicator.style.display = 'flex';
  indicator.style.visibility = 'visible';
  indicator.style.opacity = '1';
  
  document.body.appendChild(indicator);
  
  // Double-check logo visibility right after adding (to catch any issues)
  const checkLogo = () => {
    const logo = indicator.querySelector('.promptrim-logo');
    if (logo) {
      logo.style.setProperty('display', floatingLogo ? 'block' : 'none', 'important');
      logo.style.setProperty('visibility', floatingLogo ? 'visible' : 'hidden', 'important');
    }
  };
  
  // Check immediately and after frame
  checkLogo();
  requestAnimationFrame(checkLogo);
  
  // Enable drag functionality
  enableDragging(indicator);
  
  // Update position on scroll/resize to stay with input
  let updateTimeout;
  const scheduleUpdate = () => {
    clearTimeout(updateTimeout);
    // Only update if modal is not open
    if (!document.querySelector('.promptrim-modal')) {
      updateTimeout = setTimeout(smartPosition, 100);
    }
  };
  
  const resizeObserver = new ResizeObserver(scheduleUpdate);
  resizeObserver.observe(input);
  if (container && container !== input) {
    resizeObserver.observe(container);
  }
  
  const handleScroll = () => scheduleUpdate();
  const handleResize = () => scheduleUpdate();
  
  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', handleResize);
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    clearTimeout(updateTimeout);
    resizeObserver.disconnect();
    window.removeEventListener('scroll', handleScroll, true);
    window.removeEventListener('resize', handleResize);
  });
  
  return indicator;
}

/**
 * Find chat input container element
 */
function findChatInputContainer(input) {
  let current = input.parentElement;
  const maxDepth = 5;
  let depth = 0;
  
  while (current && depth < maxDepth) {
    const computedStyle = window.getComputedStyle(current);
    const rect = current.getBoundingClientRect();
    
    // Check if this is a likely container (has relative/absolute positioning and reasonable size)
    if ((computedStyle.position === 'relative' || computedStyle.position === 'absolute') &&
        rect.width > 200 && rect.height > 30) {
      return current;
    }
    
    // Check for common container classes
    const classList = current.classList || [];
    const containerKeywords = ['container', 'input', 'textarea', 'chat', 'composer', 'toolbar'];
    if (containerKeywords.some(keyword => 
      current.className && typeof current.className === 'string' && 
      current.className.toLowerCase().includes(keyword))) {
      return current;
    }
    
    current = current.parentElement;
    depth++;
  }
  
  return null;
}

/**
 * Scan container for buttons and icons that might collide
 * Specifically targets right-aligned elements
 */
function scanContainerForButtons(container) {
  const elements = [];
  
  if (!container) return elements;
  
  // Comprehensive selectors for chat UI elements
  const selectors = [
    'button',
    '[role="button"]',
    'svg',
    'img',
    '[class*="icon"]',
    '[class*="Icon"]',
    '[class*="button"]',
    '[class*="Button"]',
    '[class*="send"]',
    '[class*="Send"]',
    '[class*="submit"]',
    '[class*="Submit"]',
    '[class*="attach"]',
    '[class*="Attach"]',
    '[class*="mic"]',
    '[class*="Mic"]',
    '[class*="voice"]',
    '[class*="Voice"]',
    '[class*="emoji"]',
    '[class*="Emoji"]',
    'input[type="submit"]',
    'input[type="button"]',
    '[aria-label*="send"]',
    '[aria-label*="Send"]',
    '[title*="Send"]',
    '[title*="Attach"]'
  ];
  
  selectors.forEach(selector => {
    try {
      const found = container.querySelectorAll(selector);
      found.forEach(el => {
        if (el !== container && isElementVisible(el)) {
          const rect = el.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(el);
          
          // Skip if element has zero size
          if (rect.width <= 0 || rect.height <= 0) return;
          
          // Check if element is right-aligned (common in chat UIs)
          const isRightAligned = 
            computedStyle.textAlign === 'right' ||
            computedStyle.float === 'right' ||
            (computedStyle.position === 'absolute' && rect.right > window.innerWidth - 50);
          
          // Calculate alignment score (0-1, higher = more right-aligned)
          const alignmentScore = calculateAlignmentScore(rect, container.getBoundingClientRect());
          
          elements.push({
            element: el,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
            isRightAligned: isRightAligned || alignmentScore > 0.7,
            alignmentScore: alignmentScore
          });
        }
      });
    } catch (e) {
      // Ignore selector errors
    }
  });
  
  // Sort by right position (rightmost first)
  elements.sort((a, b) => b.right - a.right);
  
  return elements;
}

/**
 * Calculate how right-aligned an element is (0-1 scale)
 */
function calculateAlignmentScore(elementRect, containerRect) {
  if (elementRect.right >= containerRect.right - 20) {
    // Element is on the right edge
    return 1.0;
  }
  // Calculate position within container
  const containerWidth = containerRect.right - containerRect.left;
  const elementRightFromLeft = elementRect.right - containerRect.left;
  return Math.max(0, Math.min(1, elementRightFromLeft / containerWidth));
}

/**
 * Check if element is visible
 */
function isElementVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0';
}

/**
 * Calculate safe position for icon with collision detection and 12px margin enforcement
 */
function calculateSafePosition(inputRect, containerRect, childElements, iconSize) {
  const MANDATORY_MARGIN = 12; // Always maintain 12px gap from other elements
  const EDGE_PADDING = 8; // Padding from container edge
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Default: try positioning to the right of the input, vertically centered
  let left = inputRect.right - iconSize - EDGE_PADDING;
  let top = inputRect.top + (inputRect.height / 2) - (iconSize / 2);
  
  // Find the rightmost element that might collide
  let rightmostRightAligned = inputRect.right;
  let collisionDetected = false;
  
  // Check ALL child elements for potential collisions
  childElements.forEach(child => {
    // Only check right-aligned elements or elements on the right side
    if (child.isRightAligned || child.right >= inputRect.right - 30) {
      // Calculate if our position would overlap
      const ourRight = left + iconSize;
      const ourLeft = left;
      
      // Check for overlap with 12px margin
      const wouldOverlap = !(
        ourRight + MANDATORY_MARGIN < child.left || 
        ourLeft > child.right + MANDATORY_MARGIN
      );
      
      if (wouldOverlap) {
        collisionDetected = true;
        // Track the rightmost element to position left of
        if (child.right > rightmostRightAligned) {
          rightmostRightAligned = child.right;
        }
      }
    }
  });
  
  // If collision detected, position to the left of the rightmost element
  if (collisionDetected) {
    left = rightmostRightAligned - iconSize - MANDATORY_MARGIN;
    
    // If positioning to the left would go outside the input, try alternative positions
    if (left < inputRect.left + EDGE_PADDING) {
      // Try positioning left-aligned inside the input
      const spaceInsideInput = inputRect.right - inputRect.left;
      
      if (spaceInsideInput >= iconSize + MANDATORY_MARGIN + EDGE_PADDING) {
        // Position on the left side of input
        left = inputRect.left + EDGE_PADDING;
      } else {
        // Input is too narrow, position above on the right
        if (inputRect.top >= iconSize + MANDATORY_MARGIN) {
          left = inputRect.right - iconSize - EDGE_PADDING;
          top = inputRect.top - iconSize - MANDATORY_MARGIN;
        } else {
          // Last resort: position below on the right
          left = Math.min(
            inputRect.right - iconSize - EDGE_PADDING,
            viewportWidth - iconSize - MANDATORY_MARGIN
          );
          top = inputRect.bottom + MANDATORY_MARGIN;
        }
      }
    }
  }
  
  // Ensure icon stays within viewport bounds
  left = Math.max(MANDATORY_MARGIN, Math.min(left, viewportWidth - iconSize - MANDATORY_MARGIN));
  top = Math.max(MANDATORY_MARGIN, Math.min(top, viewportHeight - iconSize - MANDATORY_MARGIN));
  
  return { left, top };
}

/**
 * Fallback positioning when all else fails
 */
function fallbackPosition(indicator) {
  indicator.style.position = 'fixed';
  indicator.style.bottom = '20px';
  indicator.style.right = '20px';
  indicator.style.top = 'auto';
  indicator.style.left = 'auto';
  indicator.style.zIndex = '2147483647';
}

/**
 * Detect background color of input element
 */
function detectBackgroundColor(element) {
  try {
    const style = window.getComputedStyle(element);
    let bgColor = style.backgroundColor;
    
    // If transparent, check parent
    if (bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
      let current = element.parentElement;
      let depth = 0;
      while (current && depth < 3) {
        const parentStyle = window.getComputedStyle(current);
        bgColor = parentStyle.backgroundColor;
        if (bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
          break;
        }
        current = current.parentElement;
        depth++;
      }
    }
    
    // Parse RGB
    const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return { isLight: brightness > 128, color: bgColor };
    }
    
    // Default to light
    return { isLight: true, color: bgColor };
  } catch (e) {
    return { isLight: true, color: '#ffffff' };
  }
}

/**
 * Enable visual testing/debug mode
 */
function enableDebugMode() {
  document.body.classList.add('promptrim-debug');
  console.log('🎯 PrompTrim: Debug mode enabled - hitboxes visible');
  
  // Draw collision boundaries for visual testing
  const indicators = document.querySelectorAll('.promptrim-indicator-container');
  indicators.forEach(indicator => {
    const input = indicator.dataset.attachedTo;
    if (input) {
      // This would show collision detection boundaries
      console.log(`🎯 PrompTrim: Debug info for indicator at ${indicator.style.left}, ${indicator.style.top}`);
    }
  });
}

/**
 * Enable dragging functionality
 */
function enableDragging(indicator) {
  // Load saved position from localStorage
  const savedPos = localStorage.getItem(`promptrim-pos-${indicator.id}`);
  if (savedPos) {
    try {
      const pos = JSON.parse(savedPos);
      indicator.style.position = 'fixed';
      indicator.style.top = `${pos.top}px`;
      indicator.style.left = `${pos.left}px`;
      indicator.dataset.isDragged = 'true';
    } catch (e) {
      // Invalid saved position
    }
  }
  
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;
  
  const dragStart = (e) => {
    if (e.button !== 0 && e.type !== 'touchstart') return; // Only left mouse button
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    initialX = clientX - xOffset;
    initialY = clientY - yOffset;
    
    if (e.target === indicator || indicator.contains(e.target)) {
      isDragging = true;
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
    }
  };
  
  const dragEnd = (e) => {
    if (isDragging) {
      // Check if this was a click vs drag (moved less than 5px)
      const clientX = e.type && e.type.includes('touch') ? 
        (e.changedTouches[0]?.clientX || 0) : e.clientX || 0;
      const clientY = e.type && e.type.includes('touch') ? 
        (e.changedTouches[0]?.clientY || 0) : e.clientY || 0;
      
      const movedX = Math.abs(clientX - initialX - xOffset);
      const movedY = Math.abs(clientY - initialY - yOffset);
      
      if (movedX < 5 && movedY < 5) {
        // It was a click, not a drag - let the click handler run
        isDragging = false;
        document.body.style.userSelect = '';
        return;
      }
      
      // Save position to localStorage
      const currentPos = indicator.style.transform;
      localStorage.setItem(`promptrim-pos-${indicator.id}`, 
        JSON.stringify({ 
          transform: currentPos,
          top: indicator.style.top, 
          left: indicator.style.left 
        }));
      indicator.dataset.isDragged = 'true';
      isDragging = false;
    }
    document.body.style.userSelect = '';
  };
  
  const drag = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    currentX = clientX - initialX;
    currentY = clientY - initialY;
    
    xOffset = currentX;
    yOffset = currentY;
    
    setTranslate(currentX, currentY, indicator);
  };
  
  const setTranslate = (xPos, yPos, el) => {
    el.style.position = 'fixed';
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    el.style.webkitTransform = `translate(${xPos}px, ${yPos}px)`;
  };
  
  indicator.addEventListener('mousedown', dragStart);
  indicator.addEventListener('touchstart', dragStart);
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('touchend', dragEnd);
  document.addEventListener('mousemove', drag);
  document.addEventListener('touchmove', drag);
}

/**
 * Show severity indicator
 */
function showSeverityIndicator(indicator, analysis) {
  indicator.style.display = 'flex';
  indicator.dataset.severity = analysis.severity;
  
  // Update the dot class
  const dot = indicator.querySelector('.promptrim-dot');
  if (dot) {
    dot.className = `promptrim-dot severity-${analysis.severity}`;
  }
  
  // Add severity label
  const severityLabels = {
    red: '⚠️ High verbosity',
    orange: '⚡ Moderate verbosity',
    green: '✓ Optimal'
  };
  
  indicator.setAttribute('title', severityLabels[analysis.severity]);
  indicator.setAttribute('aria-label', severityLabels[analysis.severity]);
}

/**
 * Hide severity indicator
 */
function hideSeverityIndicator(indicator) {
  indicator.style.display = 'none';
}

/**
 * Get current input value
 */
function getInputValue(input) {
  if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
    return input.value;
  } else if (input.contentEditable === 'true') {
    return input.textContent || input.innerText;
  }
  return '';
}

/**
 * Set input value
 */
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

/**
 * Show compression modal
 */
function showCompressionModal(input, analysis) {
  // Remove existing modal if any
  const existingModal = document.querySelector('.promptrim-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Hide all indicators to prevent them from floating over the modal
  const allIndicators = document.querySelectorAll('.promptrim-indicator-container');
  const indicatorsToRestore = [];
  
  allIndicators.forEach(indicator => {
    // Store original state
    const wasHidden = indicator.classList.contains('promptrim-hidden-for-modal');
    indicatorsToRestore.push({
      element: indicator,
      wasHidden: wasHidden
    });
    // Hide the indicator using class to override !important flags
    indicator.classList.add('promptrim-hidden-for-modal');
  });
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'promptrim-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Prompt compression options');
  
  const compressedLength = Math.round(analysis.compressed.length);
  const originalLength = Math.round(analysis.original.length);
  const savings = Math.round((1 - compressedLength / originalLength) * 100);
  
  // Estimate tokens (approximate: 4 chars = 1 token)
  const originalTokens = Math.round(originalLength / 4);
  const compressedTokens = Math.round(compressedLength / 4);
  const tokenSavings = originalTokens - compressedTokens;
  const tokenSavingsPercent = Math.round((tokenSavings / originalTokens) * 100);
  
  // Estimate cost per query (using average pricing: ~$0.01 per 1K tokens for GPT-4 input)
  const costPer1KTokens = 0.01;
  const originalCost = (originalTokens / 1000) * costPer1KTokens;
  const compressedCost = (compressedTokens / 1000) * costPer1KTokens;
  const costSavings = originalCost - compressedCost;
  const costSavingsPercent = Math.round((costSavings / originalCost) * 100);
  
  // Build grammar correction indicator if corrections were applied
  let grammarIndicator = '';
  if (analysis.grammarErrorCount && analysis.grammarErrorCount > 0) {
    grammarIndicator = `
      <div class="promptrim-grammar-info">
        <span class="promptrim-grammar-badge">
          ✓ Grammar corrected (${analysis.grammarErrorCount} ${analysis.grammarErrorCount === 1 ? 'error' : 'errors'} fixed)
        </span>
      </div>
    `;
  }
  
  // Build stats display for compressed prompt
  const statsDisplay = `
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
        <div class="promptrim-original">
          <h4>Original Prompt (${originalLength} chars)</h4>
          <p class="promptrim-text">${escapeHtml(analysis.original)}</p>
        </div>
        
        <div class="promptrim-compressed">
          <h4>Compressed & Corrected Prompt (${compressedLength} chars) 
            <span class="promptrim-savings">${savings}% smaller</span>
          </h4>
          ${grammarIndicator}
          <p class="promptrim-text">${escapeHtml(analysis.compressed)}</p>
          ${statsDisplay}
        </div>
      </div>
      
      <div class="promptrim-modal-footer">
        <button class="promptrim-btn promptrim-reject" aria-label="Keep original prompt">
          Keep Original
        </button>
        <div class="promptrim-footer-actions">
          <button class="promptrim-btn promptrim-dashboard" aria-label="View dashboard and analytics">
            Dashboard
          </button>
          <button class="promptrim-btn promptrim-accept" aria-label="Accept compressed prompt">
            Use Compressed
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Function to restore indicators
  const restoreIndicators = () => {
    indicatorsToRestore.forEach(({ element, wasHidden }) => {
      if (!wasHidden) {
        element.classList.remove('promptrim-hidden-for-modal');
      }
    });
  };
  
  // Add event listeners
  const closeBtn = modal.querySelector('.promptrim-close');
  const acceptBtn = modal.querySelector('.promptrim-accept');
  const rejectBtn = modal.querySelector('.promptrim-reject');
  const dashboardBtn = modal.querySelector('.promptrim-dashboard');
  
  closeBtn.addEventListener('click', () => {
    modal.remove();
    restoreIndicators();
  });
  
  rejectBtn.addEventListener('click', () => {
    modal.remove();
    restoreIndicators();
  });
  
  dashboardBtn.addEventListener('click', () => {
    // Get API key and redirect to user's dashboard
    chrome.storage.local.get(['apiKey'], (result) => {
      const apiKey = result.apiKey || '';
      // Redirect to user's dashboard with API key
      chrome.tabs.create({
        url: `http://localhost:5173/dashboard?apiKey=${encodeURIComponent(apiKey)}`,
        active: true
      });
    });
    modal.remove();
    restoreIndicators();
  });
  
  acceptBtn.addEventListener('click', () => {
    setInputValue(input, analysis.compressed);
    modal.remove();
    restoreIndicators();
  });
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      restoreIndicators();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      modal.remove();
      restoreIndicators();
      document.removeEventListener('keydown', escapeHandler);
    }
  });
  
  document.body.appendChild(modal);
  
  // Focus first button for accessibility
  setTimeout(() => acceptBtn.focus(), 100);
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Utility: Remove all overlays
 */
function removeAllOverlays() {
  document.querySelectorAll('.promptrim-indicator-container').forEach(el => el.remove());
  document.querySelectorAll('.promptrim-indicator').forEach(el => el.remove());
  document.querySelectorAll('.promptrim-modal').forEach(el => el.remove());
}

/**
 * Refresh all input attachments
 */
function refreshAllInputs() {
  removeAllOverlays();
  detectedInputs.clear();
  if (enabled) {
    scanForInputs();
  }
}

