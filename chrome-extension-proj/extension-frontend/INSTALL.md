# PrompTrim Installation Guide

## Quick Start

### Step 1: Download/Clone
- If you haven't already, get the chrome-extension folder

### Step 2: Load Extension
1. Open Google Chrome
2. Go to `chrome://extensions/` (copy-paste in address bar)
3. Toggle "Developer mode" ON (top-right corner)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder

### Step 3: Get Started
1. Navigate to any page with a chat input (e.g., ChatGPT, Claude)
2. Start typing a prompt
3. Look for the colored dot indicator next to the input
4. Click the dot to optimize your prompt!

## Creating Extension Icons

The manifest references icon files that need to be created:

```
chrome-extension/
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Option 1: Use Online Icon Generator
1. Visit: https://www.favicon-generator.org/ or https://realfavicongenerator.net/
2. Upload an image (or use text "PT" on a gradient background)
3. Generate icons
4. Download and extract to `chrome-extension/icons/`

### Option 2: Quick Placeholder Icons

You can create simple placeholder icons using any image editor:

**Requirements:**
- icon16.png: 16x16 pixels
- icon48.png: 48x48 pixels  
- icon128.png: 128x128 pixels

**Design Suggestion:**
- Use a gradient background (purple/blue: #667eea to #764ba2)
- Add text "PT" or an emoji "🎯" centered
- Ensure high contrast for visibility

### Option 3: Use This Command (if you have ImageMagick)

```bash
cd chrome-extension/icons
# Create gradient background
convert -size 128x128 -background 'linear-gradient(135deg, #667eea, #764ba2)' -fill white -gravity center -font Arial-Bold label:"PT" icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

## Temporary Workaround

If you don't have icons yet, the extension will still work, but you'll see a default puzzle piece icon in Chrome's toolbar.

## Verify Installation

1. Check extension icon appears in Chrome toolbar
2. Click icon to open popup
3. Verify settings load correctly
4. Visit ChatGPT or Claude
5. Type a long prompt
6. Look for colored dot indicator

## Troubleshooting

**Extension not loading:**
- Make sure Developer mode is enabled
- Check for errors in Extensions page (chrome://extensions/)
- Verify all files are in chrome-extension folder

**No indicators showing:**
- Ensure extension is enabled in popup
- Check page has chat inputs (textareas, inputs)
- Try refreshing the page

## Next Steps

- Configure settings (minimum severity, compression mode)
- Test on different sites (ChatGPT, Claude, etc.)
- Try optimizing some prompts!

See README.txt for full documentation.

