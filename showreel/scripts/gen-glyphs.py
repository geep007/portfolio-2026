#!/usr/bin/env python3
"""Rasterise A-Z into 16x16 bitmaps for src/sig/glyphs.ts (Arial Bold, thresholded)."""
import string
from PIL import Image, ImageDraw, ImageFont

G = 16
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"

rows = []
for ch in string.ascii_uppercase:
    f = ImageFont.truetype(FONT, 28)
    probe = ImageDraw.Draw(Image.new("L", (64, 64)))
    bb = probe.textbbox((0, 0), ch, font=f)
    w, h = bb[2] - bb[0], bb[3] - bb[1]
    im = Image.new("L", (w + 4, h + 4), 0)
    ImageDraw.Draw(im).text((-bb[0] + 2, -bb[1] + 2), ch, fill=255, font=f)
    scale = min(G / w, G / h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    glyph = im.crop((2, 2, 2 + w, 2 + h)).resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("L", (G, G), 0)
    canvas.paste(glyph, ((G - nw) // 2, (G - nh) // 2))
    px = canvas.load()
    bits = "".join("1" if px[x, y] > 110 else "0" for y in range(G) for x in range(G))
    rows.append(f'  {ch}: "{bits}",')

print("\n".join(rows))
