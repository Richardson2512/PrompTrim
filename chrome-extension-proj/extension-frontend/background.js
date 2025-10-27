/**
 * PrompTrim Background Service Worker
 * Manages extension state and settings
 */

// Initialize extension state on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    minSeverity: 'green', // 'green', 'orange', or 'red'
    compressionMode: 'client', // 'client' or 'api'
    apiEndpoint: '' // Leave empty for client-side compression
  });
  
  console.log('PrompTrim installed and enabled');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['enabled', 'minSeverity', 'compressionMode', 'apiEndpoint'], (result) => {
      sendResponse(result);
    });
    return true; // Indicates async response
  }
  
  if (request.action === 'updateSettings') {
    chrome.storage.local.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'compressPrompt') {
    // Forward compression request to content script or handle locally
    handleCompressionRequest(request, sendResponse);
    return true;
  }
});

/**
 * Handle prompt compression request
 * For client-side compression, this is handled in content script
 * For API compression, this could forward to API service
 */
function handleCompressionRequest(request, sendResponse) {
  const { prompt } = request;
  
  chrome.storage.local.get(['compressionMode', 'apiEndpoint'], (result) => {
    if (result.compressionMode === 'api' && result.apiEndpoint) {
      // TODO: Implement API call to compression service
      // For now, fall back to client-side
      sendResponse({ 
        compressed: compressPromptClientSide(prompt),
        mode: 'fallback'
      });
    } else {
      sendResponse({ 
        compressed: compressPromptClientSide(prompt),
        mode: 'client'
      });
    }
  });
}

/**
 * Basic client-side compression (fallback)
 * This is a simplified version - the main logic is in content.js
 */
function compressPromptClientSide(prompt) {
  // Basic compression rules
  let compressed = prompt
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
  
  return compressed;
}

// Handle extension icon click (optional)
chrome.action.onClicked.addListener((tab) => {
  chrome.runtime.openOptionsPage();
});

