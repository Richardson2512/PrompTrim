================================================================================
                          PROMPTRIM - CHROME EXTENSION
                           Prompt Optimizer for LLMs
                           Version 1.0.0
================================================================================

INSTALLATION
================================================================================

1. Open Chrome and navigate to chrome://extensions/
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the chrome-extension folder
5. PrompTrim will appear in your extensions list

Alternatively (for developers):
1. Clone this repository
2. Follow the steps above


PERMISSIONS EXPLAINED
================================================================================

<all_urls> - Required to detect and analyze chat inputs on any website
storage - Required to save your settings and preferences
activeTab - Required to interact with chat inputs on the current tab

PrompTrim does NOT:
- Track your browsing habits
- Send your prompts anywhere (unless you enable API mode)
- Collect personal information
- Modify content on websites (only adds UI overlays)


USER INTERFACE FLOW
================================================================================

1. DETECTION
   - PrompTrim automatically detects chat input fields on any page
   - Works with: ChatGPT, Claude, Intercom, Drift, custom chat widgets
   - Targets standard HTML inputs, textareas, and contenteditable divs

2. ANALYSIS
   - When you type a prompt (10+ characters), PrompTrim analyzes it
   - Checks for verbosity, redundant phrases, repetition
   - Calculates a severity score (Green/Orange/Red)

3. SEVERITY INDICATOR
   - Small colored dot appears near the chat input:
     • Red Dot: Highly verbose, expensive prompt (significant optimization available)
     • Orange Dot: Moderate verbosity (improvements possible)
     • Green Dot: Already optimal (minimal changes needed)

4. COMPRESSION MODAL
   - Click the severity dot to open optimization modal
   - View original vs compressed prompt side-by-side
   - See estimated token savings percentage
   - Two options:
     ✔️ "Use Compressed" - Replace input with optimized version
     ❌ "Keep Original" - Leave prompt unchanged

5. SETTINGS
   - Click PrompTrim icon in Chrome toolbar
   - Toggle extension ON/OFF
   - Set minimum severity threshold
   - Choose compression mode (client-side or API)
   - View statistics (prompts optimized, tokens saved)


TROUBLESHOOTING
================================================================================

PROBLEM: Severity indicator not showing
SOLUTION: 
  - Ensure extension is enabled in popup
  - Check that your prompt is at least 10 characters
  - Verify minimum severity setting (try setting to "green" to see all)
  - Refresh the page

PROBLEM: Modal not opening when clicking dot
SOLUTION:
  - Check browser console for errors (F12)
  - Ensure no other extensions are interfering
  - Try disabling other extensions temporarily

PROBLEM: Compression suggestions seem inaccurate
SOLUTION:
  - Client-side compression is rule-based (simplified)
  - For better results, enable API mode and configure endpoint
  - PrompTrim focuses on removing redundant phrases

PROBLEM: Not detecting chat inputs on specific site
SOLUTION:
  - Content script runs on all pages by default
  - PrompTrim targets standard selectors (input, textarea, [role="textbox"])
  - Some custom chat widgets may need additional selector support
  - Consider opening an issue with the site's HTML structure

PROBLEM: Extension slows down browsing
SOLUTION:
  - Disable extension when not needed
  - Content scripts run only when extension is enabled
  - PrompTrim uses minimal resources


TECHNICAL DETAILS
================================================================================

ARCHITECTURE:
- Manifest V3 (Chrome Extension)
- Background Service Worker: State management
- Content Script: Chat detection and UI injection
- Popup: Settings and configuration
- Client-side compression: Rule-based algorithm
- API hook: Ready for TinyLlama integration

COMPRESSION ALGORITHM:
- Removes redundant phrases ("please", "kindly", "can you", etc.)
- Removes excessive whitespace
- Preserves core meaning
- Estimates token savings

PERFORMANCE:
- Minimal page impact (runs on document idle)
- Lazy evaluation (only analyzes when typing)
- Efficient DOM observation (MutationObserver)
- No external API calls by default


CUSTOMIZATION
================================================================================

MINIMUM SEVERITY:
- Green: Show all indicators (default)
- Orange: Only show for moderate/high verbosity
- Red: Only show for highly verbose prompts

COMPRESSION MODE:
- Client-side: Fast, local, privacy-preserving
- API: Remote compression (configure endpoint)

API INTEGRATION:
To connect PrompTrim to your TinyLlama service:

1. Set compression mode to "API" in popup
2. Enter your API endpoint (e.g., https://your-api.com/compress)
3. Implement endpoint that accepts:
   POST /compress
   Body: { "prompt": "string" }
   Returns: { "compressed": "string", "savings": number }

See backend/services/docs_chat_service.py for reference


COMPATIBILITY
================================================================================

BROWSERS:
- Chrome 88+ (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

WEBSITES TESTED:
- ChatGPT (chat.openai.com)
- Claude (claude.ai)
- Generic chat widgets (Intercom, Drift, Zendesk)
- Custom chat interfaces with standard HTML inputs

INPUT TYPES:
- <input type="text">
- <textarea>
- <div contenteditable="true">
- <div role="textbox">


FUTURE ENHANCEMENTS
================================================================================

- Machine learning-based compression
- Real-time typing suggestions
- Cost calculator (showing estimated $ savings)
- Per-site customization
- Prompt templates library
- Keyboard shortcuts
- Export/import settings
- Analytics dashboard


DEVELOPER NOTES
================================================================================

KEY FILES:
- manifest.json: Extension configuration
- background.js: Service worker
- content.js: Main detection and analysis logic
- popup.html/js/css: Settings UI
- content.css: Overlay and modal styles

SELECTOR PATTERNS:
Content script uses comprehensive selector patterns to detect:
- Standard form inputs
- Chat widget classes/IDs
- ARIA roles
- Common naming conventions

COMPRESSION HOOK:
In content.js, the compressPrompt() function can be replaced with API call.
Background.js contains placeholder for remote API integration.

TESTING:
Test on multiple sites with chat interfaces.
Verify accessibility (screen readers, keyboard navigation).
Check cross-browser compatibility.


FEEDBACK & SUPPORT
================================================================================

Report issues, suggest features, or contribute:
- GitHub Issues: [Your repository URL]
- Email: [Your contact]

Thank you for using PrompTrim! 🎯


LICENSE
================================================================================

[Add your license information here]


CHANGELOG
================================================================================

v1.0.0 (Initial Release)
- Chat input detection
- Severity analysis
- Client-side compression
- Settings popup
- Modal UI
- Cross-site compatibility
- Accessibility support


================================================================================

