# PrompTrim Project Structure

## 📁 Directory Layout

```
chrome-extension-proj/
│
├── README.md                      # Main project overview
├── PROJECT_STRUCTURE.md          # This file
│
├── extension-frontend/           # Chrome Extension (UI)
│   ├── manifest.json            # Extension configuration (Manifest V3)
│   ├── background.js            # Service worker - state management
│   ├── content.js               # Content script - chat detection & UI
│   ├── content.css              # Styles for indicators & modal
│   ├── popup.html               # Settings popup HTML
│   ├── popup.css                # Settings popup styles
│   ├── popup.js                 # Settings popup logic
│   ├── icons/                   # Extension icons (icon16/48/128.png)
│   ├── README.txt               # User documentation
│   ├── INSTALL.md              # Installation instructions
│   ├── QUICK_START.md          # Quick start guide
│   └── FEATURES.md             # Features overview
│
└── extension-backend/           # API Backend (Optional)
    ├── api_endpoint.py         # FastAPI compression service
    ├── compression-service.js  # Client-side compression library
    ├── requirements.txt        # Python dependencies
    └── integration_guide.md    # Integration instructions
```

## 🎯 What Each Folder Contains

### extension-frontend/
**Purpose**: Chrome extension that runs in the browser

**Files**:
- `manifest.json` - Extension configuration, permissions, scripts
- `background.js` - Service worker that manages extension state
- `content.js` - Main logic: detects chat inputs, analyzes prompts, injects UI
- `content.css` - Styles for severity indicators and compression modal
- `popup.*` - Settings interface (enable/disable, severity threshold)
- `icons/` - Extension icons

**How to use**: Load as unpacked extension in Chrome

### extension-backend/
**Purpose**: Optional API service for advanced compression

**Files**:
- `api_endpoint.py` - FastAPI service with `/api/compress` endpoint
- `compression-service.js` - Client-side compression utilities
- `requirements.txt` - Python dependencies (FastAPI, Uvicorn)
- `integration_guide.md` - Instructions for integrating with existing backend

**How to use**: Deploy as separate service OR integrate into main `backend/`

## 🔄 Data Flow

### Client-Side Mode (Default)
```
User types in chat → 
content.js detects → 
Analyzes locally → 
Shows indicator → 
Modal with compressed version
```

### API Mode (Optional)
```
User types in chat → 
content.js detects → 
Sends to backend API → 
API compresses (TinyLlama) → 
Returns to extension → 
Shows in modal
```

## 🚀 Quick Start

### Frontend Only (Recommended to Start)

1. Navigate to `extension-frontend/`
2. Create icons (see INSTALL.md)
3. Load in Chrome as unpacked extension
4. Start using on ChatGPT/Claude

### With Backend

1. Set up `extension-backend/`:
   ```bash
   cd extension-backend
   pip install -r requirements.txt
   python api_endpoint.py
   ```

2. Configure extension:
   - Open popup → Set mode to "API"
   - Enter endpoint URL
   - Restart extension

3. Integrate with TinyLlama (optional):
   - See `integration_guide.md`
   - Update `api_endpoint.py`

## 🔌 Integration Options

### Option 1: Standalone Extension (Client-Side)
- Works immediately
- No server needed
- Best for personal use

### Option 2: Backend API (Advanced)
- Better compression quality
- Can integrate TinyLlama
- Deploy separately

### Option 3: Integrate with Main Backend
- Add to existing `backend/main.py`
- Use existing TinyLlama service
- Production-ready

Choose Option 3 for production use.

## 📝 Key Files Explained

### manifest.json
Defines the extension:
- Permissions (<all_urls>, storage, activeTab)
- Scripts (background, content)
- Popup configuration
- Icon paths

### content.js
**Most important file** - Core functionality:
- Scans page for chat inputs
- Analyzes prompt verbosity
- Creates severity indicators
- Shows compression modal
- Handles user actions

### background.js
Manages extension state:
- Stores settings (enabled, severity, mode)
- Listens for updates
- Handles messages from content script

### popup.html/js/css
Settings interface:
- Toggle on/off
- Set severity threshold
- Choose compression mode (client/API)
- View statistics

### api_endpoint.py
Backend compression service:
- POST `/api/compress` endpoint
- Currently uses rule-based compression
- Hook for TinyLlama integration
- Returns compressed prompt + savings

## 🎨 Customization

### Icons
Create 3 sizes: 16x16, 48x48, 128x128
Place in `extension-frontend/icons/`

### Compression Algorithm
Edit:
- Frontend: `content.js` → `compressPrompt()`
- Backend: `api_endpoint.py` → `compress_rule_based()`

### Selectors for Chat Detection
Edit `content.js` → `scanForInputs()` function

## 🧪 Testing

### Test Frontend
1. Load extension
2. Go to ChatGPT
3. Type: "Can you please kindly help me with this task if you don't mind"
4. Check for orange/red indicator
5. Click to see compressed version

### Test Backend
```bash
curl -X POST http://localhost:8001/api/compress \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Can you help me please"}'
```

## 📦 Deployment

### Frontend
- Development: Load unpacked
- Production: Publish to Chrome Web Store

### Backend
- Integrate into existing `backend/` (recommended)
- OR deploy separately to Railway
- OR add to main FastAPI app

## 🔗 Dependencies

### Frontend (No dependencies!)
All code is vanilla JS - ready to load

### Backend
See `extension-backend/requirements.txt`:
- FastAPI
- Uvicorn
- Pydantic

## 🎓 Learning Resources

- Chrome Extension Docs: https://developer.chrome.com/docs/extensions/
- Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- Content Scripts: https://developer.chrome.com/docs/extensions/mv3/content_scripts/
- FastAPI: https://fastapi.tiangolo.com/

---

**Next Steps**: See `extension-frontend/QUICK_START.md` to begin!

