

from cv2 import COLOR_BGR2HSV, COLOR_HSV2BGR, Mat, add, cvtColor, merge, split
from numpy import mod, number, uint8


def adjustRGB(source: Mat, red: number, green: number, blue: number):
    clone = source.copy()
    b, g, r = split(clone)

    r2 = add(r, red)
    g2 = add(g, green)
    b2 = add(b, blue)

    return merge([b2, g2, r2])


def adjustHSL(source: Mat, hue: number, saturation: number, value: number):
    clone = source.copy()
    i = cvtColor(clone, COLOR_BGR2HSV)
    h, s, v = split(i)

    frac = saturation / 100.0
    if frac > 1:
        frac = 1
    elif frac < -1:
        frac = -1

    h2 = mod(h + (hue / 2), 180).astype(uint8)
    v2 = (v + (value / 100.0) * (255.0 - v) * (v / 255.0)).astype(uint8)

    if frac > 0:
        s2 = (s + frac * (255.0 - s) * (s / 255.0)).astype(uint8)
    elif frac < 0:
        s2 = (s + frac * s).astype(uint8)
    else:
        s2 = s

    return cvtColor(merge([h2, s2, v2]), COLOR_HSV2BGR)
