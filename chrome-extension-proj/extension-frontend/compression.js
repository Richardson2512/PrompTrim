/**
 * PrompTrim Compression Module
 * Analyzes and compresses prompts using rule-based algorithms
 */

// Compression config is stored in window.PrompTrimCore
function setCompressionConfig(config) {
  // Stored in window.PrompTrimCore by content-script-core
}

function getCompressionConfig() {
  return {
    compressionMode: window.PrompTrimCore?.compressionMode ?? 'client',
    apiKey: window.PrompTrimCore?.apiKey ?? '',
    apiEndpoint: window.PrompTrimCore?.apiEndpoint ?? 'http://localhost:8000/api/optimize'
  };
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
 * Analyze prompt using API
 */
async function analyzePromptWithAPI(prompt) {
  const config = getCompressionConfig();
  
  try {
    // Check if extension is still valid - return early to avoid errors
    if (!chrome.runtime || !chrome.runtime.id) {
      return null;
    }
    
    // Wrap sendMessage in a promise to handle properly
    const response = await new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({
          action: 'compressWithAPI',
          prompt: prompt,
          apiKey: config.apiKey,
          apiEndpoint: config.apiEndpoint
        }, (response) => {
          // Check for chrome.runtime.lastError FIRST
          if (chrome.runtime?.lastError) {
            const errorMsg = chrome.runtime.lastError.message;
            // Silently handle "Extension context invalidated" - this is normal during reloads
            if (errorMsg?.includes('Extension context invalidated')) {
              resolve(null);
            } else {
              resolve(null); // Silently fail for other errors too
            }
            return;
          }
          resolve(response);
        });
      } catch (err) {
        // Catch any synchronous errors
        resolve(null);
      }
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
      // Silent fallback
    }
    
    return null;
  } catch (error) {
    // Silently return null for any errors - client-side fallback will handle it
    return null;
  }
}

// Export to window for cross-module access
window.PrompTrimCompression = {
  analyzePrompt,
  compressPrompt,
  analyzePromptWithAPI,
  setCompressionConfig,
  analyzePromptWithMode: async function(prompt) {
    // Always use client-side compression for real-time performance
    // API compression is only used when explicitly requested via modal
    return analyzePrompt(prompt);
  },
  
  analyzePromptWithAPIMode: async function(prompt) {
    // This is used for API-based analysis (e.g., in modal)
    const config = getCompressionConfig();
    if (config.compressionMode === 'api' && config.apiKey) {
      const result = await analyzePromptWithAPI(prompt);
      return result || analyzePrompt(prompt);
    }
    return analyzePrompt(prompt);
  }
};

