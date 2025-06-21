import { renderMarkdown } from './render.js';
import { loadDirTree, highlightCurrentFileInDirTree, setCurrentPage } from './dirtree.js';
import { generateTOC, highlightCurrentHeading } from './toc.js';
import { setupSearch } from './search.js';
import { highlightWordInViewer } from './highlight.js';
import { addTempHighlight, commonClasses } from './commons.js';

const ids = Object.freeze({
  mdBody: 'markdown-body',
  dirTree: 'dtree-container',
  tocTree: 'toc-container',
  pageMessage: 'page-message',
});

const welcomeMessage = 'Select a file to view';

// Utility: get current file path and hash from /render/URL
// Returns an object like { id: 'docs/intro', hash: 'section2' }
function getCurrentFilePath() {
  const prefix = '/render/';
  const { pathname, hash } = window.location;

  let id = '';
  if (pathname.startsWith(prefix)) {
    id = decodeURIComponent(pathname.slice(prefix.length));
  }

  return {
    id,
    hash: hash ? hash.slice(1) : '', // remove leading #
  };
}

// Fetch and display file content, now accepts contextBlock
// id: The id of the file
// specificTarget: The heading id to navigate to
// searchContext: {query: str, context: str} The search context to highlight
// The last two args are mutually exclusive, specificTarget gets priority
async function fetchContent(id = null, specificTarget = '', searchContext = null) {
  if (id == null) {
    // We don't care about specificTarget in this case
    let path = getCurrentFilePath();
    id = path.id;
    specificTarget = path.hash;
    searchContext = null;
  }

  let pageMessageContainer = document.getElementById(ids.pageMessage);
  let container = document.getElementById(ids.mdBody);

  if (id == '') {
    container.innerHTML = '';
    document.getElementById(ids.tocTree).innerHTML = '';
    highlightCurrentFileInDirTree();
    pageMessageContainer.innerHTML = welcomeMessage;
    return;
  }

  let subContainer = document.createElement('div');
  subContainer.classList.add(commonClasses.hidden);

  let res = await fetch('/plain/' + encodeURIComponent(id));
  let html = await res.text();
  if (!res.ok) {
    pageMessageContainer.innerHTML = html;
    pageMessageContainer.classList.remove(commonClasses.hidden);
    container.classList.add(commonClasses.hidden);
    return;
  }
  pageMessageContainer.classList.add(commonClasses.hidden);
  container.classList.remove(commonClasses.hidden);

  setCurrentPage(id);
  document.title = id;
  highlightCurrentFileInDirTree();

  renderMarkdown(subContainer, html);

  container.appendChild(subContainer);
  while (container.children.length > 1) {
    container.removeChild(container.firstElementChild);
  }
  container.firstElementChild.classList.remove(commonClasses.hidden);
  window.scrollTo(0, 0);

  const url = `/render/${id}${specificTarget ? `#${specificTarget}` : ''}`;
  history.pushState({}, '', url);

  generateTOC(subContainer, document.getElementById(ids.tocTree));

  if (specificTarget) {
    let h = document.getElementById(specificTarget);
    if (h) {
      h.scrollIntoView({ block: 'start' });
      addTempHighlight(h);
    }
  } else if (searchContext) {
    highlightWordInViewer(subContainer, searchContext.query, searchContext.context);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadDirTree(document.getElementById(ids.dirTree), fetchContent);
  fetchContent();
  setupSearch(fetchContent);

  // Listen for browser navigation (back/forward)
  window.addEventListener('popstate', () => {
    if (location.hash) {
      // It's a hash-only navigation — skip handling
      return;
    }

    // Handle actual state changes
    fetchContent();
  });

  // Listen for scroll to highlight current TOC entry
  window.addEventListener('scroll', highlightCurrentHeading);
});
