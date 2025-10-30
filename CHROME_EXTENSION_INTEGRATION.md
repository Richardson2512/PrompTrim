# Chrome Extension & Platform Integration

## Overview
This document outlines how the Chrome Extension connects with the PromptTrim platform for API key management.

## User Flow

### 1. First Install (No API Key)
When a user installs the Chrome Extension for the first time:
1. Extension icon appears in toolbar
2. User clicks icon to open popup
3. Popup shows API Key input field (empty)
4. "Get API Key" button is visible

### 2. Getting an API Key
When user clicks "Get API Key":
1. Browser opens new tab with: `http://localhost:5173/signup`
2. **New users**: Complete signup form → Platform redirects to API Keys page automatically
3. **Existing users**: If already authenticated, platform redirects to API Keys page automatically
4. User creates a new API key with desired optimization level (minimal/moderate/aggressive)
5. Full API key is displayed in popup (format: `pt_XXXXXXXXXXXXXXXXXXXXXXXX...`)
6. User copies the API key

### 3. Configuring Extension
Back in the extension popup:
1. User pastes the copied API key into input field
2. Extension validates format (must start with `pt_`)
3. User clicks "Save Settings" button
4. Settings are saved to Chrome local storage
5. All active chat tabs receive message to reload settings
6. Extension becomes active

### 4. Using the Extension
Once API key is saved and extension is enabled:
1. Extension monitors all chat input fields on the page
2. Floating PrompTrim logo appears next to detected chat boxes
3. Color indicator shows verbosity level:
   - 🟢 Green = Optimal (minimal changes needed)
   - 🟠 Orange = Moderate (can be improved)
   - 🔴 Red = High verbosity (significant optimization available)
4. Clicking the indicator shows optimization popup
5. User can apply optimized version with one click

### 5. Enable/Disable Toggle
Extension has a toggle switch in the popup:
- **ON**: PrompTrim is active, monitoring chats, showing indicators
- **OFF**: PrompTrim is inactive, no monitoring, all indicators removed

When toggled:
1. Popup sends `settingsUpdated` message to all tabs
2. Content scripts update their `enabled` state
3. If disabled: `stopMonitoring()` is called, all overlays removed
4. If enabled: `startMonitoring()` is called, scanning begins

## Technical Implementation

### Files Modified

#### 1. `popup.js` - Settings Management
**Changes:**
- Updated "Get API Key" link to open login page instead of signup
- Added logic to check for existing API key before redirecting
- Displays helpful message when user needs to sign in

**Key Functions:**
```javascript
// Get API Key link handler
getApiKeyLink.addEventListener('click', (e) => {
  chrome.tabs.create({ url: 'http://localhost:5173/login' });
  showStatus('Please sign in to get your API key...');
});

// API key validation
function handleApiKeyInput() {
  if (apiKey.startsWith('pt_')) {
    statusMessage.textContent = '✓ Valid API key format';
  } else {
    statusMessage.textContent = '⚠️ API key should start with "pt_"';
  }
}
```

#### 2. `content.js` - Extension Behavior
**Changes:**
- Updated `settingsUpdated` message handler to respect enable/disable toggle
- Calls `startMonitoring()` or `stopMonitoring()` based on state
- Removes all overlays when extension is disabled

**Key Functions:**
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'settingsUpdated') {
    enabled = request.enabled;
    
    // Start or stop monitoring based on enabled state
    if (enabled && apiKey) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }
});

function stopMonitoring() {
  observers.forEach(obs => obs.disconnect());
  observers = [];
  removeAllOverlays(); // Removes PrompTrim logo and indicators
}
```

### Storage Schema

Chrome Extension stores these settings in `chrome.storage.local`:

```javascript
{
  enabled: true/false,              // Extension on/off
  apiKey: "pt_XXXXXXXXXXXXXXXX",   // User's API key
  apiEndpoint: "http://localhost:8000/api/optimize",
  compressionMode: "api",           // Always 'api'
  minSeverity: "green",             // Show all indicators
  statsPrompts: 0,                  // Usage statistics
  statsTokens: 0
}
```

## API Integration

### API Key Format
- Prefix: `pt_`
- Full format: `pt_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` (64+ characters)

### API Endpoint
- Default: `http://localhost:8000/api/optimize`
- Requires API key in `Authorization` header: `Bearer pt_...`

### Request Format
```javascript
fetch(apiEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    prompt: "...",
    optimization_level: "moderate", // or "minimal", "aggressive"
    language: "en"
  })
});
```

## Testing the Integration

### 1. Test New User Flow
```
1. Install extension (no API key)
2. Click extension icon
3. Click "Get API Key"
4. Sign up for account
5. Create API key
6. Paste key in extension
7. Click "Save Settings"
8. Visit chat page (e.g., ChatGPT)
9. Verify PrompTrim logo appears
```

### 2. Test Enable/Disable Toggle
```
1. Open extension popup with valid API key
2. Toggle extension OFF
3. Visit chat page
4. Verify no PrompTrim logo appears
5. Toggle extension ON
6. Refresh page
7. Verify PrompTrim logo appears again
```

### 3. Test API Key Validation
```
1. Open extension popup
2. Try entering invalid key (not starting with "pt_")
3. Verify error message appears
4. Enter valid key format
5. Verify success message appears
6. Click "Save Settings"
```

## Troubleshooting

### Extension Not Working
**Symptoms:** No PrompTrim logo on chat pages

**Check:**
1. Is extension enabled? (Check toggle in popup)
2. Is API key configured? (Should not be empty)
3. Is API key valid format? (Must start with `pt_`)
4. Open DevTools console on chat page
5. Look for error messages prefixed with `🎯 PrompTrim:`

### API Key Not Validating
**Symptoms:** Error message when saving

**Check:**
1. API key starts with `pt_`
2. API key is from API Keys page (not manually created)
3. Backend server is running (port 8000)

### Logo Not Appearing After Enabling
**Symptoms:** Toggle is ON but no logo

**Solution:**
1. Close all chat page tabs
2. Reopen chat page
3. Logo should appear

## Future Enhancements

1. **Auto-detection of signed-in state**: Check if user is logged into platform
2. **Direct API key copy**: Copy button in popup to retrieve saved key
3. **Multiple API keys**: Support for multiple keys with profiles
4. **Usage statistics**: Track tokens saved per key
5. **Sync across devices**: Use Chrome sync storage for settings

