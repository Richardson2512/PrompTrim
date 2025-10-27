# PrompTrim - Quick Start Guide

## 🚀 Install in 3 Steps

### 1. Open Chrome Extensions
```
chrome://extensions/
```

### 2. Enable Developer Mode
- Toggle switch in top-right corner

### 3. Load Extension
- Click "Load unpacked"
- Select the `chrome-extension` folder

## 🎯 How to Use

### Step 1: Navigate to a Chat Interface
Visit any of these sites:
- ChatGPT (https://chat.openai.com)
- Claude (https://claude.ai)
- Any site with a chat input

### Step 2: Start Typing
Type a prompt in the chat input field

### Step 3: Look for the Indicator
A colored dot appears next to the input:
- 🟢 **Green**: Already optimal
- 🟠 **Orange**: Can be improved
- 🔴 **Red**: Highly verbose

### Step 4: Optimize (Optional)
- Click the colored dot
- Compare original vs compressed
- Click "Use Compressed" or "Keep Original"

## ⚙️ Configure Settings

Click the PrompTrim icon in Chrome toolbar to adjust:
- **Status**: Turn on/off
- **Minimum Severity**: When to show indicators
- **Compression Mode**: Client-side or API
- **Statistics**: Track your savings

## 🎓 Example Prompts

### Example 1: Verbose (Red) ⛔
```
Original: "I would like to kindly ask you if you could please help me understand how artificial intelligence works in a simple way that I can comprehend"
```
```
Compressed: "Explain artificial intelligence simply" (87% smaller)
```

### Example 2: Moderate (Orange) ⚡
```
Original: "Can you please help me with a task? I need you to write a Python function that calculates Fibonacci numbers"
```
```
Compressed: "Write a Python function for Fibonacci numbers" (65% smaller)
```

### Example 3: Optimal (Green) ✅
```
Original: "List the planets in our solar system"
```
Result: No changes needed

## 🔍 Tips for Best Results

1. **Type fully first**: Let PrompTrim analyze the complete prompt
2. **Review changes**: Always check compressed version before accepting
3. **Adjust settings**: Lower severity threshold to see more suggestions
4. **Enable statistics**: Track your token savings over time

## 🛠️ Troubleshooting

### No indicator showing?
- Check if extension is enabled
- Ensure prompt is 10+ characters
- Try setting minimum severity to "Green"
- Refresh the page

### Indicator in wrong position?
- PrompTrim positions itself dynamically
- May shift as page content changes
- This is normal behavior

### Want to disable on specific sites?
Currently not supported. Coming in a future update!

## 📊 Statistics

Track your optimization impact:
- **Prompts Optimized**: Total count
- **Tokens Saved**: Estimated reduction

Access via the PrompTrim popup icon.

## 🔗 Connect to Your API

Want to use your TinyLlama backend?

1. Open PrompTrim popup
2. Set compression mode to "API"
3. Enter your endpoint URL
4. Implement the API endpoint (see README.txt)

Example API request:
```json
POST https://your-api.com/compress
{
  "prompt": "user's original prompt"
}
```

Expected response:
```json
{
  "compressed": "optimized version",
  "savings": 45
}
```

## 💡 Pro Tips

1. **Trust but verify**: Review compressed prompts before accepting
2. **Context matters**: Technical terms may need adjustment
3. **Use statistics**: Track which types of prompts get optimized most
4. **Experiment**: Try different severity settings
5. **Feedback welcome**: Help us improve!

## 🎉 You're Ready!

Start using PrompTrim on your next chat session.
Click the extension icon anytime to adjust settings.

Happy optimizing! 🎯

