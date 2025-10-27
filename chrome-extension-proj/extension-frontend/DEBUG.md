# PrompTrim Extension Debugging Guide

## Quick Debugging Steps

### 1. Check if Extension is Loaded
- Go to `chrome://extensions/`
- Find PrompTrim
- Make sure it's **enabled** (toggle switch is ON)
- Check for any error messages in red

### 2. Reload the Extension
- Click the **reload icon** (circular arrow) on PrompTrim extension
- Or toggle it off and on again

### 3. Check Console for Errors
- Open any chat page (ChatGPT, Claude, etc.)
- Press **F12** to open DevTools
- Go to **Console** tab
- Look for errors starting with "PrompTrim" or related to "content.js"

### 4. Check if Input is Detected
In the console, type this to see if inputs are being detected:
```javascript
document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]')
```

This should show chat input elements.

### 5. Check if Indicator Elements are Created
In the console, type:
```javascript
document.querySelectorAll('.promptrim-indicator')
```

This should show the PrompTrim indicators that have been created.

## Common Issues

### Issue: Extension not detecting chat inputs
**Solution:**
- Make sure you're on a page with a chat interface
- The extension targets textareas and contentEditable divs
- Some sites may load inputs dynamically after page load

### Issue: Indicator appears but moves/positioning is off
**Solution:**
- The extension continuously updates position
- Try refreshing the page
- Check if any CSS on the page is interfering

### Issue: Extension shows errors in console
**Solution:**
- Take a screenshot of the error
- Check which line of content.js is failing
- Ensure all extension files are present

## Debug Mode

To enable more verbose logging, you can temporarily modify `background.js`:
```javascript
console.log('PrompTrim: Input detected', input);
console.log('PrompTrim: Indicator created', indicator);
console.log('PrompTrim: Position', rect);
```

## Testing Different Sites

Try the extension on these sites to verify it works:

1. **ChatGPT**: https://chat.openai.com
2. **Claude**: https://claude.ai
3. **Perplexity**: https://www.perplexity.ai

## Check Extension Files

Make sure these files exist in your extension folder:
- ✅ manifest.json
- ✅ background.js
- ✅ content.js
- ✅ content.css
- ✅ popup.html
- ✅ popup.js
- ✅ popup.css
- ✅ icons/icon-16.png
- ✅ icons/icon-48.png
- ✅ icons/icon-128.png

## Still Not Working?

1. **Disable other extensions** temporarily to check for conflicts
2. **Try incognito mode** with extension enabled
3. **Check browser permissions** - extension needs access to all URLs
4. **Take screenshots** of:
   - Extension page showing PrompTrim is loaded
   - Console errors
   - The chat interface where indicator should appear

## Manual Test

You can manually test by opening the console on a chat page and running:

```javascript
// Create a test indicator
const testIndicator = document.createElement('div');
testIndicator.className = 'promptrim-indicator';
testIndicator.style.cssText = 'width: 32px; height: 32px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; position: fixed; top: 100px; right: 100px; z-index: 9999999; cursor: pointer;';
testIndicator.textContent = 'PT';
document.body.appendChild(testIndicator);

// If you see a purple box with "PT", the styles are loaded correctly
```

If you see the purple PT box, then the extension is working and the issue is with input detection or positioning.

