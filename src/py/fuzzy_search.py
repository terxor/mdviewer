import re
import os

class FuzzySearch:
    def __init__(self):
        self.file_contents = {}

    def index(self, pathmap):
        self.file_contents = {}
        for name, full_path in pathmap.items():
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    self.file_contents[name] = f.read()
            except Exception:
                self.file_contents[name] = ""

    def search(self, query, limit=10):
        query = query.strip()
        if not query or ' ' in query:
            return []
        results = []
        word = re.escape(query)
        pattern = re.compile(rf'\b{word}\b', re.IGNORECASE)
        for path, content in self.file_contents.items():
            lines = content.splitlines()
            for idx, line in enumerate(lines):
                if pattern.search(line):
                    start = max(idx - 2, 0)
                    end = min(idx + 3, len(lines))
                    snippet = '\n'.join(lines[start:end])
                    results.append({
                        'path': path,
                        'preview': snippet,
                        'lineno': idx + 1
                    })
                    if len(results) >= limit:
                        return results
        return results

    def context_search(self, search_query, block_size=5, limit=20):
        """
        Return non-overlapping blocks of block_size lines containing ALL words (case-insensitive),
        with highlights applied to the preview.
        """
        words = [w for w in search_query.strip().split() if w]
        results = []
        word_patterns = [re.compile(re.escape(w), re.IGNORECASE) for w in words]
        for path, content in self.file_contents.items():
            lines = content.splitlines()
            n = len(lines)
            i = 0
            while i <= n - block_size:
                block = lines[i:i+block_size]
                if all(any(p.search(line) for line in block) for p in word_patterns):
                    block_text = '\n'.join(block)
                    results.append({
                        'path': path,
                        'preview': block_text,
                        'lineno': i + 1
                    })
                    if len(results) >= limit:
                        return results
                    i += block_size
                else:
                    i += 1
        return results
