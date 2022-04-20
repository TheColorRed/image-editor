
from cv2 import Mat, addWeighted


def contrast(source: Mat, contrast):
    clone = source.copy()
    f = 131 * (contrast + 127) / (127 * (131 - contrast))
    alpha_c = f
    gamma_c = 127 * (1 - f)

    return addWeighted(clone, alpha_c, clone, 0, gamma_c)
