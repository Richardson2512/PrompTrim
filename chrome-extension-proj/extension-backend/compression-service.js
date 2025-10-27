/**
 * PrompTrim Compression Service
 * This file demonstrates how to integrate PrompTrim with a remote API
 * for advanced prompt compression using TinyLlama or similar models.
 */

/**
 * Compress prompt using remote API
 * This is called from content.js when API mode is enabled
 * 
 * @param {string} prompt - The original prompt
 * @param {string} apiEndpoint - The API endpoint URL
 * @returns {Promise<{compressed: string, savings: number}>}
 */
async function compressPromptAPI(prompt, apiEndpoint) {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'tinyllama' // or specify your model
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      compressed: data.compressed || prompt,
      savings: data.savings || 0,
      confidence: data.confidence || 0.5
    };
    
  } catch (error) {
    console.error('PrompTrim API compression failed:', error);
    
    // Fallback to client-side compression
    const compressed = compressPromptClientSide(prompt);
    return {
      compressed,
      savings: Math.round((1 - compressed.length / prompt.length) * 100),
      confidence: 0.3 // Lower confidence for fallback
    };
  }
}

/**
 * Enhanced client-side compression (fallback)
 * This is used when API is unavailable or client-side mode is selected
 */
function compressPromptClientSide(prompt) {
  let compressed = prompt;
  
  // More aggressive rules for fallback
  const replacements = [
    // Redundant polite phrases
    { pattern: /\bplease\b/gi, replacement: '' },
    { pattern: /\bkindly\b/gi, replacement: '' },
    { pattern: /\bcan you\b/gi, replacement: '' },
    { pattern: /\bcould you\b/gi, replacement: '' },
    { pattern: /\bwould you\b/gi, replacement: '' },
    
    // Verbose connectors
    { pattern: /\bin order to\b/gi, replacement: 'to' },
    { pattern: /\bfor the purpose of\b/gi, replacement: 'for' },
    { pattern: /\bwith regards to\b/gi, replacement: 'about' },
    { pattern: /\breferring to\b/gi, replacement: 'on' },
    
    // Hedge words
    { pattern: /\bI think that\b/gi, replacement: '' },
    { pattern: /\bI believe that\b/gi, replacement: '' },
    { pattern: /\bas you know\b/gi, replacement: '' },
    
    // Intensifiers (when excessive)
    { pattern: /\breally\s+really\s+/gi, replacement: 'very ' },
    { pattern: /\bvery\s+very\s+/gi, replacement: 'very ' },
    
    // Redundant words
    { pattern: /\bI want you to\b/gi, replacement: '' },
    { pattern: /\bI need you to\b/gi, replacement: '' },
    { pattern: /\bI would like you to\b/gi, replacement: '' },
  ];
  
  replacements.forEach(({ pattern, replacement }) => {
    compressed = compressed.replace(pattern, replacement);
  });
  
  // Remove extra whitespace
  compressed = compressed.replace(/\s+/g, ' ');
  compressed = compressed.replace(/\s+([,.!?;:])/g, '$1');
  compressed = compressed.replace(/([,.!?;:])\s+([,.!?;:])/g, '$1 ');
  compressed = compressed.trim();
  
  return compressed;
}

/**
 * Estimate token count (rough approximation)
 * OpenAI uses ~4 characters per token for English text
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate token savings
 */
function calculateSavings(original, compressed) {
  const originalTokens = estimateTokens(original);
  const compressedTokens = estimateTokens(compressed);
  const saved = originalTokens - compressedTokens;
  const percentage = Math.round((saved / originalTokens) * 100);
  
  return {
    originalTokens,
    compressedTokens,
    saved,
    percentage
  };
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    compressPromptAPI,
    compressPromptClientSide,
    estimateTokens,
    calculateSavings
  };
}

