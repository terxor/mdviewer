import { treeClasses, renderTree, addTempHighlight } from './commons.js';

const state = {
  curHeadingIndex: null,
  headings: [],
  headingEntries: [],
};

// Helper to highlight the TOC entry for the current scroll position
export function highlightCurrentHeading() {
  if (state.headings.length == 0) {
    return;
  }

  const threshold = 20; // Extra buffer
  const scrollPos = (window.scrollY || window.pageYOffset) + threshold;

  let low = 0,
    high = state.headings.length - 1,
    result = 0;

  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (state.headings[mid].offsetTop <= scrollPos) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  if (state.curHeadingIndex != null) {
    state.headingEntries[state.curHeadingIndex].classList.remove(treeClasses.active);
  }
  state.curHeadingIndex = result;
  const target = state.headingEntries[result];
  target.classList.add(treeClasses.active);
  target.scrollIntoView({
    behavior: 'auto',
    block: 'nearest',
    inline: 'nearest'
  });
}

export function generateTOC(contentContainer, treeContainer) {
  state.headings = contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6');
  state.curHeadingIndex = null;
  state.headingEntries = new Array(state.headings.length);

  const root = [];
  const stack = [{ level: 0, children: root }];

  state.headings.forEach((h, idx) => {
    const level = parseInt(h.tagName[1]);
    const node = {
      name: h.textContent,
      children: [],
      action: function (e) {
        e.preventDefault();
        h.scrollIntoView({ block: 'start' });
        addTempHighlight(h);
      },
      collapsed: false,
      metadata: {
        index: idx,
      },
      render: (item, entry) => {
        state.headingEntries[item.metadata.index] = entry;
      },
    };
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push({ level, children: node.children });
  });
  renderTree(treeContainer, root);
  highlightCurrentHeading();
}
