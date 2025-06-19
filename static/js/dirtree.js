import { treeClasses, renderTree } from './commons.js';

const dirTreeState = {
  id: null, // currently loaded page
  entryMap: {},
};

export function getDirTreeIds() {
  return Object.keys(dirTreeState.entryMap);
}

export function setCurrentPage(id) {
  if (dirTreeState.id != null && dirTreeState.id in dirTreeState.entryMap) {
    dirTreeState.entryMap[dirTreeState.id].classList.remove(treeClasses.active);
  }
  dirTreeState.id = id;
}

// Helper to expand and highlight the current file in the directory tree
export function highlightCurrentFileInDirTree() {
  let id = dirTreeState.id;
  if (id == null || !(id in dirTreeState.entryMap)) {
    return;
  }
  const entry = dirTreeState.entryMap[id];
  entry.classList.add(treeClasses.active);
  // Expand all parent directories
  let li = entry.closest('li');
  while (li) {
    li.classList.remove(treeClasses.collapsed);
    li = li.parentElement.closest('li');
  }
  // Scroll into view if not visible
  // entry.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

// Dir tree related
export async function loadDirTree(container, callback) {
  // recursive function to enrich all nodes
  function enrichDirTree(tree) {
    return tree.map((item) => {
      if (item.type === 'directory') {
        return {
          name: item.name,
          action: function (e) {
            const li = this.parentNode;
            li.classList.toggle(treeClasses.collapsed);
            e.stopPropagation();
          },
          children: enrichDirTree(item.children || []),
          collapsed: true, // Start directories collapsed
          metadata: {
            isFile: false,
          },
        };
      } else {
        return {
          name: item.name,
          action: function (e) {
            callback(item.path);
            e.stopPropagation();
          },
          collapsed: false, // Files are not collapsible
          metadata: {
            id: item.path,
          },
          render: (item, entry) => {
            dirTreeState.entryMap[item.metadata.id] = entry;
          },
        };
      }
    });
  }
  return fetch('/api/tree')
    .then((res) => res.json())
    .then((tree) => {
      renderTree(container, enrichDirTree(tree));
    });
}
