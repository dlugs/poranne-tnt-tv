"""Draws icon.png (512x512): three red dynamite sticks with a lit fuse."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os
S = 512
im = Image.new("RGBA", (S, S), (27, 22, 56, 255))
d = ImageDraw.Draw(im)
def stick(x, top, w=110, h=300):
    for i in range(w):
        t = i / w
        c = (int(92 + 150 * (1 - abs(t - 0.4) * 2.2)), int(9 + 50 * max(0, 1 - abs(t - 0.4) * 3)), 7)
        d.line([(x + i, top), (x + i, top + h)], fill=c)
    d.ellipse([x, top - 14, x + w, top + 14], fill=(245, 132, 116))
    d.ellipse([x + 14, top - 8, x + w - 14, top + 8], fill=(198, 51, 38))
stick(96, 200); stick(306, 200); stick(196, 180, h=320)
d.rectangle([96, 240, 416, 270], fill=(28, 26, 33)); d.rectangle([96, 430, 416, 460], fill=(28, 26, 33))
d.rounded_rectangle([140, 300, 372, 390], 10, fill=(244, 236, 216))
try: f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", 76)
except OSError: f = ImageFont.load_default()
d.text((256, 347), "TNT", font=f, fill=(211, 25, 28), anchor="mm")
d.line([(251, 170), (246, 120), (280, 80), (330, 70)], fill=(217, 183, 122), width=12, joint="curve")
glow = Image.new("RGBA", (S, S), (0, 0, 0, 0)); g = ImageDraw.Draw(glow)
g.ellipse([290, 30, 380, 110], fill=(255, 190, 60, 200)); glow = glow.filter(ImageFilter.GaussianBlur(14))
im.alpha_composite(glow)
d = ImageDraw.Draw(im)
d.ellipse([318, 56, 346, 84], fill=(255, 250, 220))
for a, b in [((332, 70), (372, 40)), ((332, 70), (380, 78)), ((332, 70), (346, 24)), ((332, 70), (300, 36))]:
    d.line([a, b], fill=(255, 220, 100), width=4)
im.convert("RGB").save(os.path.join(os.path.dirname(__file__), "..", "icon.png"))
