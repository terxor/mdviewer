from fuzzy_search import FuzzySearch
from mdparser import MarkdownParser
import logging
import os

PATH_DELIMITER = '/'
IGNORED_DIRS = {'.git'}
MD_EXTENSION = '.md'

class MdViewerState:
    def __init__(self, root_dir):
        self._root_dir = root_dir
        self.refresh()
    
    # All filesystem interactions take place here.
    def _build_dtree_cache(self, start_path):
        tree = []
        for entry in sorted(os.listdir(start_path)):
            full_path = os.path.join(start_path, entry)
            rel_path = os.path.relpath(full_path, self._root_dir)
            if os.path.isdir(full_path):
                children = self._build_dtree_cache(full_path)
                if children:
                    tree.append({
                        'type': 'directory',
                        'name': entry,
                        'children': children
                    })
            elif entry.endswith(MD_EXTENSION):
                contents = ''
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        contents = f.read()
                except Exception:
                    logging.error(f'Unable to read contents of file {full_path}')
                node = {
                    'type': 'file',
                    'name': entry,
                    'path': rel_path,
                    'contents': contents
                }
                tree.append(node)
                self._node_map[rel_path] = node

        return tree

    def refresh(self):
        logging.info(f"(re)building cache from scratch")
        self._node_map = {}
        self._tree = self._build_dtree_cache(self._root_dir)
        self._fuzzy_search = FuzzySearch({name: node['contents'] for name, node in self._node_map.items()})
    
    def get_content(self, name, raw=False):
        if name not in self._node_map:
            raise FileNotFoundError(f"File '{name}' not found in cache")
        content = self._node_map[name]['contents']
        if raw:
            return content
        return MarkdownParser.parse(content)

    def search(self, search_query):
        results = self._fuzzy_search.context_search(search_query)
        return results

    def get_tree(self):
        """
        Return the tree structure without file contents for API responses.
        """
        def strip_content(node):
            if node['type'] == 'file':
                return {k: v for k, v in node.items() if k != 'content'}
            elif node['type'] == 'directory':
                return {
                    'type': 'directory',
                    'name': node['name'],
                    'children': [strip_content(child) for child in node['children']]
                }
        return [strip_content(node) for node in self._tree]
