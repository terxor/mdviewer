from fuzzy_search import FuzzySearch
from mdparser import MarkdownParser
import os

class MdViewerState:
    def __init__(self, root_dir):
        self._root_dir = root_dir
        self._build_tree(self._root_dir)
        self._fuzzy_search = FuzzySearch()
        self._fuzzy_search.index(self._pathmap)

    def _build_tree(self, start_path=None):
        if start_path is None:
            start_path = self._root_dir
        ignored_dirs = {'.git', '__pycache__'}
        tree = []
        pathmap = {}
        for entry in sorted(os.listdir(start_path)):
            if entry in ignored_dirs:
                continue
            full_path = os.path.join(start_path, entry)
            rel_path = os.path.relpath(full_path, self._root_dir)
            if os.path.isdir(full_path):
                children = self._build_tree(full_path)
                if children:
                    tree.append({
                        'type': 'directory',
                        'name': entry,
                        'children': children
                    })
            elif entry.endswith('.md'):
                pathmap[rel_path] = full_path
                tree.append({
                    'type': 'file',
                    'name': entry,
                    'path': rel_path
                })
        self._tree = tree
        self._pathmap = pathmap

    def refresh(self):
        self._build_tree()
        self._fuzzy_search.index(self._pathmap)
    
    def get_content(self, name, raw=False):
        if name not in self._pathmap:
            raise FileNotFoundError(f"File '{name}' not found in pathmap.")
        full_path = self._pathmap[name]
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if raw:
                return content
            return MarkdownParser.parse(content)

    def search(self, search_query):
        results = self._fuzzy_search.context_search(search_query)
        return results

    def get_tree(self):
        return self._tree.copy()
