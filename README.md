# Salesforce Case Highlighter Chrome Extension

A productivity Chrome Extension that highlights Salesforce Case rows based on matching keywords or time-sensitive SLA thresholds.

## Features
- Keyword or regex based row highlighting
- User-defined keyword list (stored in Chrome)
- SLA age highlight (critical, warning, normal)
- Custom popup UI to manage keywords
- Runs automatically on Salesforce Lightning pages

## Installation
1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click "Load Unpacked"
4. Select the folder containing this extension

---

## Folder Structure
```
salesforce-case-highlighter/
├── manifest.json
├── content.js
├── popup.html
├── popup.js
├── icons/
│   └── icon.png
└── README.md
```

## Customization
- Modify `keywords` via the popup
- Adjust SLA timing logic in `content.js`
- Extend to play sound or show toast notifications if needed