// --- Configuration ---
const P1_KEYWORDS = [
    "urgent", "asap", "p1", "high severity", "production down",
    "site outage", "customer impact", "cannot login", "security breach"
];
const SLA_THRESHOLDS = {
    critical: 60, // minutes for red highlight
    warning: 30   // minutes for yellow highlight
};
const DATE_TIME_COLUMN_HEADER = 'Date/Time Opened'; // Adjust if your org uses a different column name

// --- Main Logic ---

// Function to parse date from Salesforce's format
function parseSalesforceDateTime(dateString) {
    // Handles formats like "6/25/2025, 10:46 PM"
    if (!dateString) return null;
    try {
        return new Date(dateString);
    } catch (e) {
        console.error('Case Highlighter: Could not parse date:', dateString, e);
        return null;
    }
}

// Function to calculate the age of the case in minutes
function getCaseAgeMinutes(openedDate) {
    if (!openedDate) return 0;
    const now = new Date();
    const diffMs = now - openedDate;
    return Math.floor(diffMs / 60000);
}

// Function to apply styles and timer
function processRow(row, userKeywords, dateTimeColumnIndex) {
    const rowText = row.innerText.toLowerCase();
    const allKeywords = [...new Set([...P1_KEYWORDS, ...userKeywords.map(k => k.toLowerCase())])];
    
    let isP1 = false;
    for (const keyword of allKeywords) {
        try {
            // Treat as regex if it looks like one, otherwise plain text search
            const regex = keyword.startsWith('/') && keyword.endsWith('/') ?
                new RegExp(keyword.slice(1, -1), 'i') :
                new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(row.innerText)) {
                isP1 = true;
                break;
            }
        } catch (e) {
            // Fallback for invalid regex
            if (rowText.includes(keyword)) {
                isP1 = true;
                break;
            }
        }
    }

    const dateCell = row.cells[dateTimeColumnIndex];
    const openedDate = dateCell ? parseSalesforceDateTime(dateCell.innerText) : null;
    const ageMinutes = getCaseAgeMinutes(openedDate);

    // Determine highlighting
    let highlightClass = '';
    if (isP1 || ageMinutes > SLA_THRESHOLDS.critical) {
        highlightClass = 'ch-critical';
    } else if (ageMinutes > SLA_THRESHOLDS.warning) {
        highlightClass = 'ch-warning';
    }

    // Apply highlighting
    if (highlightClass) {
        row.classList.add('ch-highlight', highlightClass);
    }

    // Add or update the timer overlay
    if (openedDate) {
        let timerDiv = row.querySelector('.ch-timer');
        if (!timerDiv) {
            timerDiv = document.createElement('div');
            timerDiv.className = 'ch-timer';
            // Prepend to the first cell for better visibility
            row.cells[0].style.position = 'relative';
            row.cells[0].appendChild(timerDiv);
        }
        
        const hours = Math.floor(ageMinutes / 60);
        const minutes = ageMinutes % 60;
        timerDiv.textContent = `Age: ${hours}h ${minutes}m`;
    }
}


// Function to inject CSS styles into the page
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .ch-highlight.ch-critical {
            background-color: rgba(255, 0, 0, 0.15) !important;
            font-weight: bold;
        }
        .ch-highlight.ch-warning {
            background-color: rgba(255, 165, 0, 0.15) !important;
        }
        .ch-timer {
            position: absolute;
            top: 2px;
            right: 5px;
            background-color: #333;
            color: white;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 10px;
            z-index: 100;
            opacity: 0.8;
        }
        .ch-critical .ch-timer { background-color: #c9302c; }
        .ch-warning .ch-timer { background-color: #f0ad4e; }
    `;
    document.head.appendChild(style);
}

// Main execution function
function runHighlighter() {
    // Find the column index for Date/Time Opened
    const headers = Array.from(document.querySelectorAll('table thead th'));
    const dateTimeColumnIndex = headers.findIndex(th => th.innerText.trim() === DATE_TIME_COLUMN_HEADER);

    if (dateTimeColumnIndex === -1) {
        console.warn(`Case Highlighter: Column "${DATE_TIME_COLUMN_HEADER}" not found.`);
        // Don't run if we can't get the date for SLA timers
        return;
    }

    chrome.storage.local.get({ keywords: [] }, (data) => {
        const caseRows = document.querySelectorAll('table tbody tr');
        caseRows.forEach(row => processRow(row, data.keywords, dateTimeColumnIndex));
    });
}

// --- Initializer ---
injectStyles();

// Use MutationObserver to detect when the case list is loaded or updated
const observer = new MutationObserver((mutationsList, observer) => {
    // Simple check: if a table body exists, run the highlighter.
    // This is more robust for dynamic tables in Lightning Experience.
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            if(document.querySelector('table tbody tr')) {
                 runHighlighter();
                 // Maybe disconnect after first run if list view doesn't dynamically change without a page reload
                 // observer.disconnect();
            }
        }
    }
});


// Start observing the main content area of the Salesforce page
const targetNode = document.body;
const config = { childList: true, subtree: true };
observer.observe(targetNode, config);

// Run once on load just in case the content is already there
setTimeout(runHighlighter, 2000); // Delay to ensure Lightning components are rendered
setInterval(runHighlighter, 30000); // Re-run every 30 seconds to update timers
