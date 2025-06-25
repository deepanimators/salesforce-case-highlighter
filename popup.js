document.addEventListener('DOMContentLoaded', () => {
    const keywordForm = document.getElementById('keyword-form');
    const keywordInput = document.getElementById('keyword-input');
    const keywordsList = document.getElementById('keywords-list');

    // Load existing keywords from storage and display them
    const loadKeywords = () => {
        chrome.storage.local.get({ keywords: [] }, (data) => {
            keywordsList.innerHTML = ''; // Clear the list first
            data.keywords.forEach(keyword => {
                addKeywordToList(keyword);
            });
        });
    };

    // Add a keyword to the visual list in the popup
    const addKeywordToList = (keyword) => {
        const li = document.createElement('li');
        li.className = 'keyword-item';
        li.dataset.keyword = keyword;

        const span = document.createElement('span');
        span.className = 'keyword-text';
        span.textContent = keyword;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Remove keyword';

        deleteBtn.addEventListener('click', () => {
            removeKeyword(keyword);
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        keywordsList.appendChild(li);
    };

    // Save a new keyword to chrome storage
    const saveKeyword = (keyword) => {
        if (!keyword) return;
        chrome.storage.local.get({ keywords: [] }, (data) => {
            const keywords = data.keywords;
            if (!keywords.includes(keyword)) {
                keywords.push(keyword);
                chrome.storage.local.set({ keywords: keywords }, () => {
                    addKeywordToList(keyword);
                });
            }
        });
    };

    // Remove a keyword from chrome storage
    const removeKeyword = (keywordToRemove) => {
        chrome.storage.local.get({ keywords: [] }, (data) => {
            const filteredKeywords = data.keywords.filter(k => k !== keywordToRemove);
            chrome.storage.local.set({ keywords: filteredKeywords }, () => {
                // Remove from the DOM
                const itemToRemove = keywordsList.querySelector(`[data-keyword="${keywordToRemove}"]`);
                if (itemToRemove) {
                    itemToRemove.remove();
                }
            });
        });
    };

    // Handle form submission
    keywordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newKeyword = keywordInput.value.trim();
        saveKeyword(newKeyword);
        keywordInput.value = ''; // Clear input field
    });

    // Initial load of keywords
    loadKeywords();
});
