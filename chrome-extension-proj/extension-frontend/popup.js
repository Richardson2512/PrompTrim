/**
 * PrompTrim Popup Script
 * Manages settings UI and user preferences
 */

// DOM elements
const enabledToggle = document.getElementById('enabledToggle');
const showFloatingLogoToggle = document.getElementById('showFloatingLogoToggle');
const autoToggleSwitch = document.getElementById('autoToggleSwitch');
const testAutoToggleBtn = document.getElementById('testAutoToggle');
const apiKeyInput = document.getElementById('apiKey');
const apiEndpointInput = document.getElementById('apiEndpoint');
const saveButton = document.getElementById('saveSettings');
const statusMessage = document.getElementById('statusMessage');
const statsPrompts = document.getElementById('promptsOptimized');
const statsTokens = document.getElementById('tokensSaved');
const getApiKeyLink = document.getElementById('getApiKey');
const visitDashboardLink = document.getElementById('visitDashboard');

// Load current settings on popup open
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadStats();
  
  // Initialize UI after settings are loaded
  setTimeout(() => {
    initializeUI();
  }, 100);
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Initialize UI state
 */
function initializeUI() {
  // Check if API key exists to enable save button
  if (apiKeyInput.value.length > 0) {
    saveButton.disabled = false;
    saveButton.textContent = 'Save & Apply';
  } else {
    saveButton.disabled = false; // Always enabled for now
    saveButton.textContent = 'Save Settings';
  }
}

/**
 * Load settings from storage
 */
function loadSettings() {
  chrome.storage.local.get(['enabled', 'showFloatingLogo', 'autoToggle', 'apiKey', 'apiEndpoint'], (result) => {
    // Set toggle
    enabledToggle.checked = result.enabled !== false;
    
    // Set floating logo toggle (default to true if not set)
    showFloatingLogoToggle.checked = result.showFloatingLogo !== false;
    
    // Set auto-toggle switch (default to true if not set)
    autoToggleSwitch.checked = result.autoToggle !== false;
    
    
    // Set API key
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
    
    // Always set API endpoint to localhost (fix for incorrect cached endpoints)
    const correctEndpoint = 'http://localhost:8000/api/optimize';
    apiEndpointInput.value = correctEndpoint;
    
    // Update storage with correct endpoint
    chrome.storage.local.set({ apiEndpoint: correctEndpoint });
    
    // Check if first time install - no API key
    if (!result.apiKey) {
      showFirstTimeInstallMessage();
    }
  });
}

/**
 * Show message for first time install
 */
function showFirstTimeInstallMessage() {
  statusMessage.textContent = 'Please enter your API key to start using PrompTrim';
  statusMessage.className = 'status-message';
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }, 5000);
}

/**
 * Load statistics
 */
function loadStats() {
  chrome.storage.local.get(['statsPrompts', 'statsTokens'], (result) => {
    statsPrompts.textContent = result.statsPrompts || 0;
    statsTokens.textContent = result.statsTokens || 0;
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Save settings button
  saveButton.addEventListener('click', saveSettings);
  
  enabledToggle.addEventListener('change', saveToggleSettings);
  showFloatingLogoToggle.addEventListener('change', saveToggleSettings);
  autoToggleSwitch.addEventListener('change', saveToggleSettings);
  
  // Test auto-toggle button
  testAutoToggleBtn.addEventListener('click', testAutoToggle);
  
  // Real-time API key validation
  apiKeyInput.addEventListener('input', handleApiKeyInput);
  
  // Get API Key link - redirect to platform for signup/signin then to API keys page
  getApiKeyLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Always open signup page - the platform will handle authentication state
    // New users will see signup form, existing users will be redirected to login or API keys
    chrome.tabs.create({
      url: 'http://localhost:5173/signup',
      active: true
    });
    
    // Show message in popup
    showStatus('Creating your account...', 'info');
    
    // Clear message after delay
    setTimeout(() => {
      showStatus('', 'info');
    }, 3000);
  });
  
  // Visit Dashboard link
  visitDashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.storage.local.get(['apiKey'], (result) => {
      const apiKey = result.apiKey || '';
      const dashboardUrl = `http://localhost:5173/dashboard?apiKey=${encodeURIComponent(apiKey)}`;
      chrome.tabs.create({
        url: dashboardUrl,
        active: true
      });
    });
  });
}

/**
 * Save only toggle settings immediately (for Status and Floating Logo)
 */
function saveToggleSettings() {
  console.log('Toggle changed! enabled:', enabledToggle.checked, 'showFloatingLogo:', showFloatingLogoToggle.checked, 'autoToggle:', autoToggleSwitch.checked);
  
  chrome.storage.local.get(['compressionMode', 'minSeverity', 'apiKey', 'apiEndpoint'], (result) => {
    const settings = {
      enabled: enabledToggle.checked,
      showFloatingLogo: showFloatingLogoToggle.checked,
      autoToggle: autoToggleSwitch.checked,
      compressionMode: result.compressionMode || 'api',
      minSeverity: result.minSeverity || 'green',
      apiKey: result.apiKey || '',
      apiEndpoint: result.apiEndpoint || 'http://localhost:8000/api/optimize'
    };
    
    chrome.storage.local.set(settings, () => {
      // Notify only the active tab for faster testing (optimization from point 4)
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'settingsUpdated',
            enabled: settings.enabled,
            showFloatingLogo: settings.showFloatingLogo,
            autoToggle: settings.autoToggle,
            minSeverity: settings.minSeverity,
            compressionMode: settings.compressionMode,
            apiKey: settings.apiKey,
            apiEndpoint: settings.apiEndpoint
          }).catch(() => {
            // Content script not loaded, ignore
          });
        }
      });
      
      showStatus('✓ Settings updated', 'success');
      setTimeout(() => showStatus('', 'success'), 1500);
    });
  });
}

/**
 * Handle API key input changes
 */
function handleApiKeyInput() {
  const apiKey = apiKeyInput.value.trim();
  
  if (apiKey.length > 0) {
    // Show save button as enabled and ready
    saveButton.disabled = false;
    saveButton.textContent = 'Save & Apply';
    
    // Show validation status
    if (apiKey.startsWith('pt_')) {
      statusMessage.textContent = '✓ Valid API key format';
      statusMessage.className = 'status-message success';
    } else {
      statusMessage.textContent = '⚠️ API key should start with "pt_"';
      statusMessage.className = 'status-message error';
    }
  } else {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }
}

/**
 * Save settings to storage
 */
function saveSettings() {
  const settings = {
    enabled: enabledToggle.checked,
    showFloatingLogo: showFloatingLogoToggle.checked,
    autoToggle: autoToggleSwitch.checked,
    compressionMode: 'api', // Always use API mode
    minSeverity: 'green', // Always show all indicators
    apiKey: apiKeyInput.value.trim(),
    apiEndpoint: apiEndpointInput.value.trim()
  };
  
  // Validate API key
  if (!settings.apiKey) {
    showStatus('API key is required', 'error');
    return;
  }
  
  // Show saving status
  showStatus('Saving settings...', 'info');
  
  chrome.storage.local.set(settings, () => {
    showStatus('Settings applied! Reloading chat pages...', 'success');
    
    // Notify all active tabs to reload settings
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'settingsUpdated',
            enabled: settings.enabled,
            showFloatingLogo: settings.showFloatingLogo,
            autoToggle: settings.autoToggle,
            minSeverity: settings.minSeverity,
            compressionMode: settings.compressionMode,
            apiKey: settings.apiKey,
            apiEndpoint: settings.apiEndpoint
          }).catch(() => {
            // Ignore errors for tabs without content script
          });
        }
      });
    });
    
    // Close popup after saving
    setTimeout(() => {
      window.close();
    }, 1500);
  });
}

/**
 * Show status message
 */
function showStatus(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }, 3000);
}

/**
 * Test auto-toggle functionality manually
 */
function testAutoToggle() {
  console.log('🤖 Testing auto-toggle functionality...');
  
  testAutoToggleBtn.textContent = 'Testing...';
  testAutoToggleBtn.disabled = true;
  
  // Send test message to background script
  chrome.runtime.sendMessage({ action: 'testAutoToggle' }, (response) => {
    testAutoToggleBtn.disabled = false;
    
    if (response && response.success) {
      console.log('🤖 Auto-toggle test completed for URL:', response.url);
      testAutoToggleBtn.textContent = 'Test Completed!';
      
      // Show temporary success message
      showStatus('Auto-toggle test completed - check console for details', 'success');
      
      // Reset button text after 2 seconds
      setTimeout(() => {
        testAutoToggleBtn.textContent = 'Test Auto-Toggle Now';
        showStatus('', 'success');
      }, 2000);
      
    } else {
      console.error('🤖 Auto-toggle test failed:', response?.error || 'Unknown error');
      testAutoToggleBtn.textContent = 'Test Failed';
      showStatus('Test failed - check console for details', 'error');
      
      // Reset button text after 2 seconds
      setTimeout(() => {
        testAutoToggleBtn.textContent = 'Test Auto-Toggle Now';
        showStatus('', 'error');
      }, 2000);
    }
  });
}

