import re
import markdown2

class MarkdownParser:

    @staticmethod
    def _strip_self_links(html: str) -> str:
        def replacer(match):
            url = match.group(1)
            # Remove http:// or https:// from the beginning
            stripped_url = re.sub(r'^https?://', '', url)
            return f'<a href="{url}">{stripped_url}</a>'
        
        return re.sub(
            r'<a\s+href=["\'](https?://[^"\']+)["\']>\s*\1\s*</a>',
            replacer,
            html
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
