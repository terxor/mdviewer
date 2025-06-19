import { renderMarkdown } from './render.js';
import { loadDirTree, highlightCurrentFileInDirTree, setCurrentPage } from './dirtree.js';
import { generateTOC, highlightCurrentHeading } from './toc.js';
import { setupSearch } from './search.js';
import { highlightWordInViewer } from './highlight.js';

const ids = Object.freeze({
  mdBody: 'markdown-body',
  dirTree: 'dtree-container',
  tocTree: 'toc-container',
});

// Utility: get current file path from /render/URL
// returns empty string can't find one
function getCurrentFilePath() {
  const prefix = '/render/';
  let path = window.location.pathname;

  if (path.startsWith(prefix)) {
    path = path.slice(prefix.length);
  } else {
    path = ''; // Or handle as error/empty
  }

  return decodeURIComponent(path);
}

// Fetch and display file content, now accepts contextBlock
function fetchContent(id = null, searchContext = null) {
  if (id == null) {
    id = getCurrentFilePath();
  }
  let container = document.getElementById(ids.mdBody);
  let subContainer = document.createElement('div');
  subContainer.classList.add('hidden');
  preRenderProcessing(container, id);
  fetch('/plain/' + encodeURIComponent(id))
    .then((res) => res.text())
    .then((html) => {
      renderMarkdown(subContainer, html);
      postRenderProcessing(container, subContainer, id, searchContext);
    });
}

function preRenderProcessing(container, id) {
  setCurrentPage(id);
  document.title = id;
  highlightCurrentFileInDirTree();
}

function postRenderProcessing(container, subContainer, id, searchContext = null) {
  container.appendChild(subContainer);
  while (container.children.length > 1) {
    container.removeChild(container.firstElementChild);
  }
  container.firstElementChild.classList.remove('hidden');
  window.scrollTo(0, 0);
  history.pushState({}, '', '/render/' + id);
  generateTOC(subContainer, document.getElementById(ids.tocTree));

  if (searchContext) {
    console.log(searchContext);
    highlightWordInViewer(subContainer, searchContext.query, searchContext.context);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadDirTree(document.getElementById(ids.dirTree), fetchContent);
  fetchContent();
  setupSearch(fetchContent);

  // Listen for browser navigation (back/forward)
  window.addEventListener('popstate', fetchContent);

  // Listen for scroll to highlight current TOC entry
  window.addEventListener('scroll', highlightCurrentHeading);
});
