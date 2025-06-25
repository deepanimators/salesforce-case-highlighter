function getKeywords(callback) {
  chrome.storage.local.get('keywords', (data) => {
    const keywords = data.keywords || ['urgent', 'asap', 'p1', 'production down', 'customer impact', 'high severity', 'site outage'];
    callback(keywords.map(k => k.toLowerCase()));
  });
}

function getTimeSince(dateString) {
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now - created;
  const mins = Math.floor(diffMs / 60000);
  return mins;
}

function containsCriticalIndicators(text) {
  const patterns = [
    /customer\simpact/i,
    /production\sdown/i,
    /site\soutage/i,
    /cannot\slogin/i,
    /system\sfailure/i,
    /security\sbreach/i
  ];
  return patterns.some(p => p.test(text));
}

function highlightRows(keywords) {
  const rows = document.querySelectorAll('table tr');
  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    const dateCell = [...row.cells].find(td => /\d{4}-\d{2}-\d{2}/.test(td.innerText));
    let ageMins = null;

    if (dateCell) {
      ageMins = getTimeSince(dateCell.innerText);
    }

    const matchesKeyword = keywords.some(kw => new RegExp(kw, 'i').test(text));
    const isCritical = containsCriticalIndicators(text);

    if (matchesKeyword || isCritical || ageMins !== null) {
      row.style.borderLeft = '5px solid red';

      if (isCritical) {
        row.style.backgroundColor = '#ff9999';
      } else if (matchesKeyword) {
        row.style.backgroundColor = '#ffe6e6';
      }

      if (ageMins !== null) {
        if (ageMins > 60) {
          row.style.backgroundColor = '#ffcccc'; // critical
        } else if (ageMins > 30) {
          row.style.backgroundColor = '#fff3cd'; // warning
        } else {
          row.style.backgroundColor = '#d4edda'; // normal
        }

        // Add timer overlay
        const ageTag = document.createElement('span');
        ageTag.textContent = `${ageMins} min`;
        ageTag.style.cssText = 'font-size: 10px; background: #000; color: #fff; padding: 2px 4px; border-radius: 3px; margin-left: 5px;';
        row.cells[0]?.appendChild(ageTag);
      }
    }
  });
}

window.addEventListener('load', () => {
  setTimeout(() => {
    getKeywords(highlightRows);
  }, 2000);
});