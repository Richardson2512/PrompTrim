/**
 * PrompTrim Content Script
 * Detects chat inputs, injects UI overlay, analyzes prompts, and provides compression
 */

// Global state
let enabled = true;
let minSeverity = 'green';
let detectedInputs = new Map();
let observers = [];

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/**
 * Initialize extension
 */
function init() {
  // Load settings
  getSettings();
  
  // Start monitoring for chat inputs
  startMonitoring();
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'settingsUpdated') {
      enabled = request.enabled;
      minSeverity = request.minSeverity;
      refreshAllInputs();
    }
  });
}

/**
 * Load settings from storage
 */
function getSettings() {
  chrome.storage.local.get(['enabled', 'minSeverity'], (result) => {
    enabled = result.enabled !== false;
    minSeverity = result.minSeverity || 'green';
    
    if (enabled) {
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
  if (!enabled) return;
  
  // Scan for existing inputs
  scanForInputs();
  
  // Watch for dynamic content
  const observer = new MutationObserver(() => {
    if (enabled) {
      scanForInputs();
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
  
  // Process each detected input
  allInputs.forEach(input => {
    if (!detectedInputs.has(input)) {
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
  
  // Must be visible
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  
  // Check placeholder/text content for chat-like indicators
  const text = (element.textContent || element.placeholder || '').toLowerCase();
  const chatKeywords = ['message', 'type', 'chat', 'send', 'ask', 'prompt', 'question'];
  
  const hasChatKeyword = chatKeywords.some(keyword => text.includes(keyword));
  
  // Check for typical chat input patterns
  const tagName = element.tagName.toLowerCase();
  const isInputOrTextarea = tagName === 'input' || tagName === 'textarea' || tagName === 'div';
  const isContentEditable = element.contentEditable === 'true';
  const hasTextboxRole = element.getAttribute('role') === 'textbox';
  
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
function handleInputChange(input, indicator) {
  const text = getInputValue(input);
  
  // Always show the indicator (like Grammarly/Quillbot)
  indicator.style.display = 'flex';
  
  if (!text || text.length < 10) {
    // Too short to analyze - show neutral state
    indicator.className = 'promptrim-indicator severity-neutral';
    indicator.setAttribute('title', 'PrompTrim: Start typing to analyze');
    indicator.setAttribute('aria-label', 'PrompTrim ready');
    indicator.dataset.analysis = JSON.stringify({ severity: 'neutral', compressed: text || '' });
    return;
  }
  
  // Analyze prompt
  const analysis = analyzePrompt(text);
  
  // Always show indicator but update severity
  showSeverityIndicator(indicator, analysis);
  
  // Store analysis for modal
  indicator.dataset.analysis = JSON.stringify(analysis);
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

/**
 * Create severity indicator element
 */
function createSeverityIndicator(input) {
  const indicator = document.createElement('div');
  indicator.className = 'promptrim-indicator severity-neutral';
  indicator.setAttribute('role', 'button');
  indicator.setAttribute('aria-label', 'PrompTrim ready');
  indicator.setAttribute('title', 'PrompTrim: Click to optimize your prompt');
  
  // Position inside the input area (like Grammarly/Quillbot)
  const rect = input.getBoundingClientRect();
  indicator.style.position = 'fixed';
  indicator.style.top = `${rect.top + 4}px`;
  indicator.style.left = `${rect.right - 40}px`; // Position from right edge
  indicator.style.zIndex = '999999';
  
  // Add click handler
  indicator.addEventListener('click', () => {
    const analysis = JSON.parse(indicator.dataset.analysis || '{}');
    
    // Don't show modal if in neutral state (no text or too short)
    if (analysis.severity === 'neutral' || !analysis.original || analysis.original.length < 10) {
      return;
    }
    
    showCompressionModal(input, analysis);
  });
  
  // Show indicator immediately
  indicator.style.display = 'flex';
  
  document.body.appendChild(indicator);
  
  // Update position on scroll/resize to stay with input
  const updatePosition = () => {
    const rect = input.getBoundingClientRect();
    indicator.style.top = `${rect.top + 4}px`;
    indicator.style.left = `${rect.right - 40}px`;
  };
  
  const resizeObserver = new ResizeObserver(updatePosition);
  resizeObserver.observe(input);
  
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
  
  return indicator;
}

/**
 * Show severity indicator
 */
function showSeverityIndicator(indicator, analysis) {
  indicator.style.display = 'flex';
  indicator.className = `promptrim-indicator severity-${analysis.severity}`;
  
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
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'promptrim-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Prompt compression options');
  
  const compressedLength = Math.round(analysis.compressed.length);
  const originalLength = Math.round(analysis.original.length);
  const savings = Math.round((1 - compressedLength / originalLength) * 100);
  
  modal.innerHTML = `
    <div class="promptrim-modal-content">
      <div class="promptrim-modal-header">
        <h3>🎯 PrompTrim Optimization</h3>
        <button class="promptrim-close" aria-label="Close modal">×</button>
      </div>
      
      <div class="promptrim-modal-body">
        <div class="promptrim-original">
          <h4>Original Prompt (${originalLength} chars)</h4>
          <p class="promptrim-text">${escapeHtml(analysis.original)}</p>
        </div>
        
        <div class="promptrim-compressed">
          <h4>Compressed Prompt (${compressedLength} chars) 
            <span class="promptrim-savings">${savings}% smaller</span>
          </h4>
          <p class="promptrim-text">${escapeHtml(analysis.compressed)}</p>
        </div>
      </div>
      
      <div class="promptrim-modal-footer">
        <button class="promptrim-btn promptrim-reject" aria-label="Keep original prompt">
          ❌ Keep Original
        </button>
        <button class="promptrim-btn promptrim-accept" aria-label="Accept compressed prompt">
          ✔️ Use Compressed
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners
  const closeBtn = modal.querySelector('.promptrim-close');
  const acceptBtn = modal.querySelector('.promptrim-accept');
  const rejectBtn = modal.querySelector('.promptrim-reject');
  
  closeBtn.addEventListener('click', () => modal.remove());
  rejectBtn.addEventListener('click', () => modal.remove());
  
  acceptBtn.addEventListener('click', () => {
    setInputValue(input, analysis.compressed);
    modal.remove();
  });
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      modal.remove();
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

