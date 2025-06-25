function renderKeywords(keywords) {
  const list = document.getElementById('keywordList');
  list.innerHTML = '';
  keywords.forEach((kw, index) => {
    const li = document.createElement('li');
    li.textContent = kw;
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.onclick = () => {
      keywords.splice(index, 1);
      chrome.storage.local.set({ keywords });
      renderKeywords(keywords);
    };
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

document.getElementById('addBtn').onclick = () => {
  const input = document.getElementById('newKeyword');
  const keyword = input.value.trim();
  if (!keyword) return;
  chrome.storage.local.get('keywords', (data) => {
    const keywords = data.keywords || [];
    if (!keywords.includes(keyword)) {
      keywords.push(keyword);
      chrome.storage.local.set({ keywords });
      renderKeywords(keywords);
    }
    input.value = '';
  });
};

chrome.storage.local.get('keywords', (data) => {
  renderKeywords(data.keywords || []);
});