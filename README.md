# Salesforce Case Highlighter Chrome Extension

A productivity Chrome Extension that highlights Salesforce Case rows based on:
- Matching keywords or regex
- Real-world urgency patterns
- Time-sensitive SLA age (with timer overlay)

## Real-World P1 Scenarios Covered
- Keywords: "urgent", "asap", "P1", "high severity"
- Patterns: "production down", "site outage", "customer impact", "cannot login", "security breach"
- Case age over 30/60 minutes

## Features
- Regex-based row highlighting
- Custom keyword entry via popup
- SLA timer display per row
- Auto-runs on Salesforce Lightning UI

## Installation
1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click "Load Unpacked"
4. Select the extension folder

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