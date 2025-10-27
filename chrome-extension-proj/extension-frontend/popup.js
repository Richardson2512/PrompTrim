/**
 * PrompTrim Popup Script
 * Manages settings UI and user preferences
 */

// DOM elements
const enabledToggle = document.getElementById('enabledToggle');
const minSeverityRadios = document.querySelectorAll('input[name="minSeverity"]');
const compressionModeRadios = document.querySelectorAll('input[name="compressionMode"]');
const apiEndpointInput = document.getElementById('apiEndpoint');
const saveButton = document.getElementById('saveSettings');
const statusMessage = document.getElementById('statusMessage');
const statsPrompts = document.getElementById('promptsOptimized');
const statsTokens = document.getElementById('tokensSaved');

// Load current settings on popup open
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadStats();
  
  // Setup event listeners
  setupEventListeners();
});

/**
 * Load settings from storage
 */
function loadSettings() {
  chrome.storage.local.get(['enabled', 'minSeverity', 'compressionMode', 'apiEndpoint'], (result) => {
    // Set toggle
    enabledToggle.checked = result.enabled !== false;
    
    // Set minimum severity
    const severity = result.minSeverity || 'green';
    document.getElementById(severity).checked = true;
    
    // Set compression mode
    const mode = result.compressionMode || 'client';
    document.getElementById(mode).checked = true;
    
    // Set API endpoint
    if (result.apiEndpoint) {
      apiEndpointInput.value = result.apiEndpoint;
    }
  });
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
  // Update UI based on compression mode
  compressionModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'client') {
        apiEndpointInput.disabled = true;
      } else {
        apiEndpointInput.disabled = false;
      }
    });
  });
  
  // Save settings button
  saveButton.addEventListener('click', saveSettings);
}

/**
 * Save settings to storage
 */
function saveSettings() {
  const settings = {
    enabled: enabledToggle.checked,
    minSeverity: document.querySelector('input[name="minSeverity"]:checked').value,
    compressionMode: document.querySelector('input[name="compressionMode"]:checked').value,
    apiEndpoint: apiEndpointInput.value.trim()
  };
  
  chrome.storage.local.set(settings, () => {
    showStatus('Settings saved successfully!', 'success');
    
    // Notify content script of settings change
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'settingsUpdated',
        ...settings
      });
    });
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

