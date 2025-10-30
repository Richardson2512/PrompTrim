/**
 * PrompTrim Grammar Check Module
 * Handles Backend API calls with Grammarkit + spaCy
 */

const grammarEndpoint = 'http://localhost:8000/api/grammar-check';
const correctEndpoint = 'http://localhost:8000/api/grammar-correct';
const grammarCache = new Map();
const GRAMMAR_TTL_MS = 60_000; // 1 minute

let grammarCheckingEnabled = true;

function setGrammarEnabled(enabled) {
  grammarCheckingEnabled = enabled;
}

/**
 * Check grammar using our Backend API (Grammarkit + spaCy)
 */
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
    // Use a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(grammarEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: text.slice(0, 1000), // Limit text length to avoid issues
        optimization_level: 'moderate',
        language: 'en'
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('Grammar API error:', response.status);
      // Cache "no errors" result to avoid repeated API calls
      const result = { hasErrors: false, errors: [] };
      grammarCache.set(hash, { ts: now, result });
      return result;
    }
    
    const data = await response.json();
    
    // Process grammar errors
    if (data.hasErrors && data.errors && data.errors.length > 0) {
      const result = {
        hasErrors: true,
        errors: data.errors.map(error => ({
          message: error.message || '',
          shortMessage: error.shortMessage || '',
          replacements: error.replacements || [],
          offset: error.offset || 0,
          length: error.length || 0,
          context: error.context || {},
          rule: error.rule || ''
        })),
        errorCount: data.errorCount || data.errors.length
      };
      grammarCache.set(hash, { ts: now, result });
      return result;
    }
    
    const result = { hasErrors: false, errors: [] };
    grammarCache.set(hash, { ts: now, result });
    return result;
  } catch (error) {
    // Silently fail and return "no errors" result
    console.warn('Grammar check error:', error);
    const result = { hasErrors: false, errors: [] };
    grammarCache.set(hash, { ts: now, result });
    return result;
  }
}

/**
 * Apply and verify grammar corrections iteratively
 */
async function applyAndVerifyGrammarCorrections(text, errors) {
  if (!errors || errors.length === 0) {
    return text;
  }
  
  try {
    // Try to use backend for automatic correction
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(correctEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: text,
        optimization_level: 'moderate',
        language: 'en'
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.correctedText) {
        return data.correctedText;
      }
    }
  } catch (error) {
    console.warn('Grammar correction API error:', error);
  }
  
  // Fallback to client-side correction
  let correctedText = applyGrammarCorrections(text, errors);
  
  // Re-check the corrected text up to 3 times
  let maxIterations = 3;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    const recheck = await checkGrammarWithLanguageTool(correctedText);
    
    if (!recheck || !recheck.hasErrors || recheck.errorCount === 0) {
      break;
    }
    
    if (recheck.errorCount < errors.length) {
      correctedText = applyGrammarCorrections(correctedText, recheck.errors);
      errors = recheck.errors;
    } else {
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
  
  const sortedErrors = [...errors].sort((a, b) => b.offset - a.offset);
  let correctedText = text;
  
  for (const error of sortedErrors) {
    const start = error.offset;
    const end = error.offset + error.length;
    
    const replacement = error.replacements && error.replacements.length > 0
      ? error.replacements[0].value
      : text.substring(start, end);
    
    correctedText = correctedText.substring(0, start) + replacement + correctedText.substring(end);
  }
  
  return correctedText;
}

/**
 * Apply grammar corrections with alternatives
 */
function applyGrammarCorrectionsWithAlternatives(text, errors) {
  if (!errors || errors.length === 0) {
    return text;
  }
  
  const sortedErrors = [...errors].sort((a, b) => b.offset - a.offset);
  let correctedText = text;
  
  for (const error of sortedErrors) {
    const start = error.offset;
    const end = error.offset + error.length;
    
    let replacement = null;
    
    if (error.replacements && error.replacements.length > 0) {
      for (const rep of error.replacements) {
        if (rep.value && rep.value.length > 0) {
          replacement = rep.value;
          break;
        }
      }
    }
    
    if (!replacement) {
      replacement = text.substring(start, end);
    }
    
    correctedText = correctedText.substring(0, start) + replacement + correctedText.substring(end);
  }
  
  return correctedText;
}

// Export to window
window.PrompTrimGrammar = {
  checkGrammarWithLanguageTool,
  applyAndVerifyGrammarCorrections,
  setGrammarEnabled
};

