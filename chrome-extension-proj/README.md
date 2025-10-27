# PrompTrim Chrome Extension

AI-powered prompt optimizer that detects chat inputs, analyzes verbosity, and offers compressed alternatives to save tokens and costs.

## 📁 Project Structure

```
chrome-extension-proj/
├── extension-frontend/     # Chrome extension files
│   ├── manifest.json     # Extension manifest
│   ├── background.js     # Service worker
│   ├── content.js        # Content script (main logic)
│   ├── content.css       # Styles for UI
│   ├── popup.html/js/css # Settings popup
│   ├── icons/            # Extension icons
│   └── *.md              # Documentation
│
└── extension-backend/     # API backend (optional)
    ├── api_endpoint.py   # FastAPI compression service
    ├── compression-service.js  # Client-side compression
    └── integration_guide.md   # Integration instructions
```

## 🚀 Quick Start

### Frontend (Chrome Extension)

1. **Load the extension:**
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `chrome-extension-proj/extension-frontend/`

2. **Add icons:**
   - Create `icon16.png`, `icon48.png`, `icon128.png`
   - Place in `extension-frontend/icons/`
   - Or use placeholder icons

3. **Start using:**
   - Visit ChatGPT or Claude
   - Start typing in chat
   - Look for colored dots

### Backend (Optional)

The backend is **optional**. The extension works with client-side compression by default.

**To use backend compression:**

1. **Setup:**
   ```bash
   cd chrome-extension-proj/extension-backend
   pip install fastapi uvicorn
   ```

2. **Run:**
   ```bash
   python api_endpoint.py
   ```

3. **Configure extension:**
   - Open popup
   - Set mode to "API"
   - Enter endpoint: `http://localhost:8001/api/compress`

4. **Integrate with TinyLlama:**
   - See `integration_guide.md`
   - Update `api_endpoint.py` to use your TinyLlama service

## 🎯 Features

### Frontend Features
- ✅ Automatic chat input detection
- ✅ Real-time severity analysis
- ✅ Visual indicators (red/orange/green dots)
- ✅ Compression modal with side-by-side comparison
- ✅ Settings popup (on/off, severity threshold)
- ✅ Client-side compression (default)
- ✅ API integration ready
- ✅ Cross-platform support (ChatGPT, Claude, etc.)

### Backend Features
- ✅ FastAPI compression endpoint
- ✅ Rule-based compression algorithm
- ✅ TinyLlama integration hook
- ✅ Token savings calculation
- ✅ Confidence scoring
- ✅ Health check endpoint

## 📚 Documentation

| File | Description |
|------|-------------|
| `extension-frontend/README.txt` | User documentation |
| `extension-frontend/INSTALL.md` | Installation guide |
| `extension-frontend/QUICK_START.md` | Quick start guide |
| `extension-frontend/FEATURES.md` | Features overview |
| `extension-backend/integration_guide.md` | Backend integration |

## 🔧 Development

### Frontend Structure

- **manifest.json**: Extension configuration (Manifest V3)
- **background.js**: Service worker for state management
- **content.js**: Core detection and analysis logic
- **popup.html/js/css**: Settings interface
- **content.css**: Overlay and modal styles

### Backend Structure

- **api_endpoint.py**: FastAPI compression service
- **compression-service.js**: Client-side compression library
- **integration_guide.md**: Integration instructions

## 🔌 Integration Options

### Option 1: Client-Side Only (Default)
Works out of the box with rule-based compression. No backend needed.

### Option 2: Standalone Backend
Run the backend separately for advanced compression.

### Option 3: Integrate with Main Backend
Add compression endpoints to your existing backend (recommended for production).

See `extension-backend/integration_guide.md` for details.

## 🎨 Customization

### Icons
- Create `icon16.png`, `icon48.png`, `icon128.png`
- Place in `extension-frontend/icons/`
- Or use online icon generator

### API Endpoint
1. Deploy backend (Railway, Heroku, etc.)
2. Configure CORS for `chrome-extension://*`
3. Update extension popup with API URL

### Compression Algorithm
Edit `api_endpoint.py` to use:
- Your TinyLlama service
- OpenAI GPT models
- Custom compression logic

## 🌐 Deployment

### Frontend
- Load unpacked in Chrome (development)
- Publish to Chrome Web Store (production)

### Backend
- Deploy to Railway (recommended)
- Or integrate into existing backend
- Configure CORS properly

## 📊 Testing

### Test the Frontend
1. Load extension
2. Visit ChatGPT
3. Type a long prompt
4. Check indicator appears
5. Click to see compression

### Test the Backend
```bash
curl -X POST http://localhost:8001/api/compress \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Can you please help me with this?"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📝 License

[Add your license]

## 🙏 Acknowledgments

Built for optimizing LLM prompts and reducing token costs.

---

**Need help?** Check the documentation files or open an issue.

