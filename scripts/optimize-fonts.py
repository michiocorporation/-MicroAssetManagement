"""Build a local Noto Sans JP subset. No text or fonts are uploaded.

Usage: python scripts/optimize-fonts.py path/to/NotoSansJP.ttf
Requires fonttools and brotli. Keep the official full font outside public/.
"""
import hashlib
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'public' / 'fonts'


class PageText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = False

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip = True
        for key, value in attrs:
            if key in ('aria-label', 'alt', 'title', 'placeholder', 'data-topic') and value:
                self.parts.append(value)

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip = False

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


parser = PageText()
parser.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
text = ''.join(parser.parts) + (ROOT / 'script.js').read_text(encoding='utf-8')
text += ''.join(chr(c) for c in range(32, 127)) + '　「」『』。、・：；！？（）［］【】％＆＋−×÷＝→←↑↓↗©'
characters = {ord(c) for c in text if ord(c) >= 32}

font = TTFont(sys.argv[1])
original_cmap = font.getBestCmap()
options = subset.Options()
options.flavor = 'woff2'
options.notdef_glyph = True
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=characters)
subsetter.subset(font)
if 'fvar' in font:
    font = instantiateVariableFont(font, {'wght': (400, 700)}, inplace=True)
assert characters.intersection(original_cmap) <= set(font.getBestCmap()), 'Missing supported characters'
font.flavor = 'woff2'
temporary = OUTPUT / 'noto-site.pending.woff2'
font.save(temporary)
data = temporary.read_bytes()
name = 'noto-site-' + hashlib.sha256(data).hexdigest()[:12] + '.woff2'
temporary.replace(OUTPUT / name)

# Reuse the existing official Inter Latin font, covering future English labels too.
inter = OUTPUT / 'font-007.woff2'
assert inter.read_bytes()[:4] == b'wOF2'
css = '/* Local site subset. Regenerate with scripts/optimize-fonts.py after text changes. */\n'
for family, filename in [('Noto Sans JP', name), ('Inter', inter.name)]:
    css += f"@font-face{{font-family:'{family}';font-style:normal;font-weight:400 700;font-display:swap;src:url('./{filename}') format('woff2')}}\n"
(OUTPUT / 'fonts.css').write_text(css, encoding='utf-8', newline='\n')
report = {'Noto Sans JP': {'file': name, 'bytes': len(data), 'characters': len(font.getBestCmap())}, 'Inter': {'file': inter.name, 'bytes': inter.stat().st_size}, 'fonts.css': {'bytes': len(css.encode())}}
(OUTPUT / 'SOURCE.txt').write_text('Noto Sans JP: official Google Fonts full variable font, locally subset with fontTools.\nSource: https://github.com/google/fonts/tree/main/ofl/notosansjp\nInter: original official Latin WOFF2 subset (font-007.woff2), unchanged.\nSource: https://fonts.google.com/specimen/Inter\nSIL Open Font Licenses are included. No site text was sent to a font service.\nRegenerate locally with scripts/optimize-fonts.py; unused original subsets are retained for old cached pages.\n\n' + json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
