import re
import markdown2
import bs4

from bs4 import BeautifulSoup, Tag

def wrap_tables_and_images(dom):
    # Wrap tables
    for table in dom.find_all('table'):
        wrapper = dom.new_tag('div', **{'class': 'md-table'})
        table.replace_with(wrapper)
        wrapper.append(table)

    # Wrap images
    for img in dom.find_all('img'):
        wrapper = dom.new_tag('div', **{'class': 'md-image'})
        img.replace_with(wrapper)
        wrapper.append(img)

def simplify_anchor_text(dom):
    for a in dom.find_all('a', href=True):
        href = a['href'].strip()
        text = a.get_text(strip=True)

        if text == href:
            if href.startswith('http://'):
                a.string = href[len('http://'):]
            elif href.startswith('https://'):
                a.string = href[len('https://'):]

class MarkdownParser:
    
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
            "header-ids",
            "code-friendly",
            "code-color",
            "tables",
            "cuddled-lists",
            "target-blank-links"
        ])
        dom = BeautifulSoup(html, 'html.parser')
        wrap_tables_and_images(dom)
        simplify_anchor_text(dom)
        return str(dom)
