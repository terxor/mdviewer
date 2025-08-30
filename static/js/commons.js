export const commonClasses = Object.freeze({
  scrollableWrapper: 'scrollable-wrapper',
  mdCodeCopiedHighlight: 'copied',
  tempHighlight: 'temp-highlight',
  hidden: 'hidden',
});

export const treeClasses = Object.freeze({
  tree: 'tree',
  entry: 'tree-entry',
  collapsed: 'tree-collapsed',
  nested: 'nested',
  active: 'active',
});

function renderTreeRecursive(tree, parentNode, depth = 0) {
  tree.forEach((item) => {
    /* item should have keys:
       - name: Display name
       - metadata: some internal value the item signifies (could be object)
       - action: the on-click function
       - href: useful in some cases
       - children: optionally, children of the element
       - collapsed: whether to start collapsed
       - render: optional function to trigger on the entry upon rendering
     */
    const li = document.createElement('li');
    li.classList.add(treeClasses.tree);

    if (item.collapsed) {
      li.classList.add(treeClasses.collapsed);
    }

    const entry = document.createElement('a');
    entry.classList.add(treeClasses.entry);
    entry.textContent = item.name;
    entry.style.setProperty('--tree-depth', depth);
    entry.addEventListener('click', item.action);

    // For tooltip
    entry.title = item.name;

    if (item.href) {
      entry.href = item.href;
    }

    li.appendChild(entry);
    if (item.render) {
      item.render(item, entry);
    }

    if (item.children && item.children.length) {
      const ul = document.createElement('ul');
      ul.classList.add(treeClasses.nested);
      renderTreeRecursive(item.children, ul, depth + 1);
      li.appendChild(ul);
    }
    parentNode.appendChild(li);
  });
}

export function renderTree(container, tree) {
  const ul = document.createElement('ul');
  ul.classList.add(treeClasses.tree);
  renderTreeRecursive(tree, ul);
  container.innerHTML = '';
  container.appendChild(ul);
}

export function addTempHighlight(el, duration = 1000, transitionMs = 500) {
  if (!el) return;
  el.classList.add(commonClasses.tempHighlight);
  // Ensure transition is set (in case CSS is missing/overridden)
  el.style.transition = `background ${transitionMs}ms, box-shadow ${transitionMs}ms`;
  setTimeout(() => {
    el.classList.add('fading');
    setTimeout(() => {
      el.classList.remove(commonClasses.tempHighlight, 'fading');
      el.style.transition = ''; // Clean up inline style
    }, transitionMs);
  }, duration);
}
