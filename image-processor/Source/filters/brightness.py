from ast import Num
from tkinter import Image

from cv2 import Mat, addWeighted

# def brightnessContrast(source: Mat, brightness: int, contrast: int):
#     clone = source.copy()
#     result: Mat
#     result = brightness(source, brightness)

#     if contrast != 0:
#         f = 131 * (contrast + 127) / (127 * (131 - contrast))
#         alpha_c = f
#         gamma_c = 127 * (1 - f)

#         result = addWeighted(result, alpha_c, result, 0, gamma_c)

#     return result.clone()


def brightness(source: Mat, brightness: int):
    clone = source.copy()
    if brightness != 0:
        if brightness > 0:
            shadow = brightness
            highlight = 255
        else:
            shadow = 0
            highlight = 255 + brightness
        alpha_b = (highlight - shadow) / 255
        gamma_b = shadow

        return addWeighted(clone, alpha_b, clone, 0, gamma_b)
    else:
        return source.copy()
