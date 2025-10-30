/**
 * PrompTrim Background Service Worker
 * Manages extension state and smart auto-toggle for AI chat platforms
 */

// AI Chat Platforms - Extension auto-enables on these URLs
const AI_CHAT_PLATFORMS = [
  'chat.openai.com',           // ChatGPT
  'claude.ai',                 // Claude.ai
  'gemini.google.com',         // Gemini
  'www.perplexity.ai',         // Perplexity AI
  'perplexity.ai',             // Perplexity AI (without www)
  'copilot.microsoft.com',     // Microsoft Copilot
  'pi.ai',                     // Pi (Personal AI)
  'chat.mistral.ai',           // Mistral Chat
  'character.ai',              // Character.AI
  'you.com',                   // YouChat
  'huggingface.co/chat',       // HuggingChat
  'jan.ai',                    // Jan AI
  'chatsonic.com',             // ChatSonic
  'www.phind.com',             // Phind
  'phind.com',                 // Phind (without www)
  'huggingface.co/spaces',     // HuggingGPT Playground
  'x.ai',                      // Grok (X AI)
  'poe.com',                   // Quora Poe
  'kimi.moonshot.cn',          // Kimi.ai
  'yiyan.baidu.com',           // Ernie Bot
  'coral.cohere.com',          // Cohere Coral
  'replika.com',               // Replika
  'blackbox.ai',               // Blackbox AI
];

// Initialize extension state on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First time install - set defaults
    chrome.storage.local.set({
      enabled: true,
      showFloatingLogo: true, // Default to showing floating logo
      minSeverity: 'green', // Always show all indicators
      compressionMode: 'api', // Always use API mode
      apiEndpoint: 'http://localhost:8000/api/optimize',
      apiKey: '',
      firstTimeInstall: true,
      autoToggle: true // Enable smart auto-toggle by default
    });
    
    console.log('PrompTrim installed with smart auto-toggle enabled');
  }
});

// Listen for tab updates to implement smart auto-toggle
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only process when URL changes and page is loaded
  if (changeInfo.status === 'complete' && tab.url) {
    handleSmartToggle(tabId, tab.url);
  }
});

// Listen for tab activation (switching between tabs)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      handleSmartToggle(activeInfo.tabId, tab.url);
    }
  });
});

/**
 * Smart Auto-Toggle Logic
 * Automatically enables extension on AI chat platforms, disables on other sites
 */
function handleSmartToggle(tabId, url) {
  chrome.storage.local.get(['autoToggle', 'apiKey', 'showFloatingLogo', 'apiEndpoint'], (result) => {
    // Skip if auto-toggle is disabled
    if (!result.autoToggle) {
      console.log('🤖 PrompTrim: Auto-toggle is disabled in settings');
      return;
    }
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Check if current site is an AI chat platform
      const isAIChatPlatform = AI_CHAT_PLATFORMS.some(platform => {
        return hostname === platform || hostname.endsWith('.' + platform);
      });
      
      console.log(`🤖 PrompTrim: Smart toggle check - ${hostname} - AI Platform: ${isAIChatPlatform}`);
      
      // Get current settings and update enabled status
      chrome.storage.local.get(['enabled'], (currentSettings) => {
        // Determine if extension should be enabled
        // On AI platforms: enable if API key exists, otherwise keep disabled
        // On other sites: always disable
        const shouldEnable = isAIChatPlatform && result.apiKey;
        
        console.log(`🤖 PrompTrim: Auto-toggle analysis:`, {
          hostname,
          isAIChatPlatform,
          hasApiKey: !!result.apiKey,
          currentEnabled: currentSettings.enabled,
          shouldEnable
        });
        
        // Only update if there's a change to avoid unnecessary operations
        if (currentSettings.enabled !== shouldEnable) {
          console.log(`🤖 PrompTrim: Auto-toggle ${shouldEnable ? 'ENABLING' : 'DISABLING'} on ${hostname}`);
          
          // Update enabled status
          chrome.storage.local.set({ enabled: shouldEnable }, () => {
            // Notify the content script of the change
            chrome.tabs.sendMessage(tabId, {
              action: 'settingsUpdated',
              enabled: shouldEnable,
              showFloatingLogo: result.showFloatingLogo !== false,
              minSeverity: 'green',
              compressionMode: 'api',
              apiKey: result.apiKey || '',
              apiEndpoint: result.apiEndpoint || 'http://localhost:8000/api/optimize',
              autoToggled: true // Flag to indicate this was an automatic change
            }).catch(() => {
              // Content script might not be loaded yet, ignore error
              console.log(`🤖 PrompTrim: Could not notify tab ${tabId} - content script not loaded`);
            });
          });
        } else {
          console.log(`🤖 PrompTrim: No change needed - already ${shouldEnable ? 'enabled' : 'disabled'} on ${hostname}`);
        }
      });
      
    } catch (e) {
      // Invalid URL, skip auto-toggle
      console.log('🤖 PrompTrim: Invalid URL for auto-toggle:', url);
    }
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['enabled', 'minSeverity', 'compressionMode', 'apiEndpoint'], (result) => {
      sendResponse(result);
    });
    return true; // Indicates async response
  }
  
  if (request.action === 'getExtensionId') {
    sendResponse({ extensionId: chrome.runtime.id });
    return true;
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
  
  if (request.action === 'openDashboard') {
    // Open dashboard in new tab
    openDashboardTab(request.data);
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'compressWithAPI') {
    // Compress prompt using API
    chrome.storage.local.get(['apiKey', 'apiEndpoint'], async (result) => {
      try {
        await handleAPICompression(request, result, sendResponse);
      } catch (error) {
        if (chrome.runtime.lastError) {
          console.error('PrompTrim: Message error:', chrome.runtime.lastError.message);
        } else {
          console.error('PrompTrim: Compression error:', error);
        }
        sendResponse({ error: error.message || 'Unknown error occurred' });
      }
    });
    return true; // Indicates we will send response asynchronously
  }
  
  if (request.action === 'testAutoToggle') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        console.log('🤖 PrompTrim: Manual auto-toggle test triggered');
        handleSmartToggle(tabs[0].id, tabs[0].url);
        sendResponse({ success: true, url: tabs[0].url });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true;
  }
  
  return false; // Not handled
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

/**
 * Open dashboard tab with analytics and usage tracking
 */
function openDashboardTab(data) {
  // Track usage statistics
  chrome.storage.local.get(['statsPrompts', 'statsTokens'], (result) => {
    const statsPrompts = (result.statsPrompts || 0) + 1;
    const statsTokens = (result.statsTokens || 0) + (data.savings || 0);
    
    chrome.storage.local.set({
      statsPrompts: statsPrompts,
      statsTokens: statsTokens
    });
  });
  
  // Create dashboard URL - you can customize this to point to your dashboard page
  const dashboardUrl = chrome.runtime.getURL('popup.html') + '#dashboard';
  
  // Open dashboard in new tab
  chrome.tabs.create({
    url: dashboardUrl,
    active: true
  });
}

/**
 * Handle API compression request
 */
async function handleAPICompression(request, storage, sendResponse) {
  const { prompt } = request;
  
  if (!storage.apiKey) {
    console.warn('PrompTrim: No API key configured');
    sendResponse({ error: 'API key not configured' });
    return;
  }
  
  const endpoint = storage.apiEndpoint || 'http://localhost:8000/api/optimize';
  console.log('PrompTrim: Calling API endpoint:', endpoint);
  
  try {
    // Make API call to compression service
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.apiKey}`
      },
      body: JSON.stringify({ 
        prompt: prompt,
        optimization_level: 'moderate',
        language: 'en'
      })
    });
    
    console.log('PrompTrim: API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PrompTrim: API error response:', response.status, errorText);
      sendResponse({ error: `API error: ${response.status}` });
      return;
    }
    
    const data = await response.json();
    console.log('PrompTrim: API response data:', data);
    
    if (data.optimized_text) {
      const savings = Math.round(((data.original_token_count - data.optimized_token_count) / data.original_token_count) * 100);
      sendResponse({ 
        success: true, 
        compressed: data.optimized_text,
        savings: savings,
        original_tokens: data.original_token_count,
        optimized_tokens: data.optimized_token_count
      });
    } else {
      console.warn('PrompTrim: API response missing optimized_text:', data);
      sendResponse({ error: 'Invalid API response format' });
    }
  } catch (error) {
    console.error('PrompTrim: API compression error:', error.message);
    sendResponse({ error: 'Failed to connect to API server' });
  }
}

// Handle extension icon click (optional)
chrome.action.onClicked.addListener((tab) => {
  chrome.runtime.openOptionsPage();
});
