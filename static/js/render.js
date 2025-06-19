import { commonClasses } from './commons.js';

export function renderMarkdown(container, html) {
  container.innerHTML = html;

  renderMathInElement(container, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '$', right: '$', display: false },
      { left: '\\(', right: '\\)', display: false },
    ],
    throwOnError: false,
  });

  wrapElements(container, 'table', commonClasses.scrollableWrapper);
  wrapElements(container, 'img', commonClasses.scrollableWrapper);

  // Make code blocks copy-able
  genCopyButtons(container);
}

// Utility: wrap elements of a particular class within a div created given classes
function wrapElements(container, selector, wrapperClass) {
  container.querySelectorAll(selector).forEach((el) => {
    if (el.parentElement.classList.contains(wrapperClass)) return;

    const wrapper = document.createElement('div');
    wrapper.classList.add(wrapperClass);
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  });
}

// Post page load function
// Add copy-to-clipboard buttons for code blocks
function genCopyButtons(container) {
  container.querySelectorAll('pre > code').forEach((codeBlock) => {
    const pre = codeBlock.parentNode;
    pre.addEventListener('click', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return; // Don't copy if selecting
      navigator.clipboard.writeText(codeBlock.innerText).then(() => {
        pre.classList.add(commonClasses.mdCodeCopiedHighlight);
        pre.style.transition = 'none';
        setTimeout(() => {
          pre.style.transition = 'background-color 0.2s ease';
          pre.classList.remove(commonClasses.mdCodeCopiedHighlight);
        }, 200);
      });
    });
  });
}
