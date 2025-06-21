import { getDirTreeIds } from './dirtree.js';

const elems = {
  input: null,
  resultsPanel: null,
  fileResults: null,
  contentResults: null,
};

function setupElems() {
  elems.input = document.getElementById('search-input');
  elems.resultsPanel = document.getElementById('search-results');
  elems.fileResults = document.getElementById('search-results-file');
  elems.contentResults = document.getElementById('search-results-content');
}

function prepareSearchPanel() {
  const rect = elems.input.getBoundingClientRect();
  elems.resultsPanel.style.left = rect.left + 'px';
  elems.resultsPanel.style.top = rect.bottom + +4 + 'px';
  elems.resultsPanel.style.display = 'block';
}

async function searchFiles(query, callback) {
  const fileMatches = getDirTreeIds().filter((f) => f.toLowerCase().includes(query.toLowerCase()));

  if (fileMatches.length === 0) {
    elems.fileResults.innerHTML = '<li style="color:#888;padding:0.5em;">No files found.</li>';
    return;
  }

  fileMatches.forEach((key) => {
    const li = document.createElement('li');
    // Highlight the path, not just the name
    li.innerHTML = `<span class="file">${highlightMatches(key, query)}</span>`;
    li.style.cursor = 'pointer';
    li.onclick = () => {
      callback(key); // No context block for file name search
      elems.resultsPanel.style.display = 'none';
      elems.input.value = '';
    };
    elems.fileResults.appendChild(li);
  });
}

async function searchContent(query, callback) {
  // 2. Global content/context search
  const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
  const results = await response.json();
  if (results.length === 0) {
    elems.contentResults.innerHTML = '<li style="color:#888;padding:0.5em;">No content found.</li>';
    return;
  }
  results.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<div>
      <strong>${highlightMatches(item.path, query)}</strong>
      <pre style="font-size:smaller;color:#555;margin-top:2px;">${highlightMatches(
        item.preview.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]),
        query
      )}</pre>
    </div>`;
    li.style.cursor = 'pointer';
    li.onclick = () => {
      callback(item.path, null, { query: query, context: item.preview }); // Pass context block!
      elems.resultsPanel.style.display = 'none';
      elems.input.value = '';
    };
    elems.contentResults.appendChild(li);
  });
}

async function search(callback) {
  prepareSearchPanel();

  elems.fileResults.innerHTML = '';
  elems.contentResults.innerHTML = '';

  const query = elems.input.value.trim();

  if (!query) {
    elems.resultsPanel.style.display = 'none';
    return;
  }
  elems.resultsPanel.style.display = 'block';

  searchFiles(query, callback);
  searchContent(query, callback);
}

export function setupSearch(callback) {
  setupElems();
  let debounceTimer = null;
  elems.input.addEventListener('input', function () {
    // console.log('query: ', elems.input.value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(callback), 300);
  });

  // Hide results when clicking outside
  document.addEventListener('click', (e) => {
    if (!elems.resultsPanel.contains(e.target) && e.target !== elems.input) {
      elems.resultsPanel.style.display = 'none';
    }
  });

  // Hide on Escape
  elems.input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      elems.resultsPanel.style.display = 'none';
      elems.input.value = '';
    }
  });
}

// Utility to highlight all occurrences of query words (case-insensitive, partial matches)
function highlightMatches(text, query) {
  if (!query) return text;
  const words = query
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (words.length === 0) return text;
  const regex = new RegExp(`(${words.join('|')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
