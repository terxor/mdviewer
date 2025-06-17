import re
import markdown2

class MarkdownParser:

    @staticmethod
    def _strip_self_links(html: str) -> str:
        def replacer(match):
            tag_start = match.group(1)
            original = match.group(2)
            tag_end = match.group(3)
            modified = re.sub(r'^https?://', '', original)
            return f'{tag_start}{modified}{tag_end}'
        
        return re.sub(
            r'(<a[^>]*>)(.*?)(</a>)',
            replacer,
            html,
            flags=re.DOTALL | re.IGNORECASE
        )
    
    @staticmethod
    def _clean_math(content: str) -> str:
        # Merge all lines inside $$...$$, remove leading > and whitespace from each line
        def replacer(m):
            inner = m.group(1)
            # Remove leading > and spaces from each line
            lines = [re.sub(r'^\s*>?\s?', '', line) for line in inner.splitlines()]
            merged = ' '.join(lines)
            return '$$' + merged.replace('\\', '\\\\') + '$$'
        content = re.sub(r'\$\$(.*?)\$\$', replacer, content, flags=re.DOTALL)
        return content

    @staticmethod
    def parse(mdcontent: str) -> str:
        mdcontent = MarkdownParser._clean_math(mdcontent)
        html = markdown2.markdown(mdcontent, extras=[
            "fenced-code-blocks",
            "code-friendly",
            "code-color",
            "tables",
            "cuddled-lists",
            "target-blank-links"
        ])
        html = MarkdownParser._strip_self_links(html)
        return html
