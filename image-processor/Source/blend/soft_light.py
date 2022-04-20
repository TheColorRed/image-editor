from cv2 import Mat, merge, split
from numpy import uint8, zeros_like


def softLight(a: Mat, b: Mat):
    a = a.astype(float) / 255
    b = b.astype(float) / 255

    mask = a >= 0.5
    ab = zeros_like(a)

    ab[~mask] = (2 * a * b + pow(a, 2) * (1 - 2 * b))[~mask]
    ab[mask] = (2 * a * (1 - b) + (a ** 2) * (2 * b - 1))[mask]

    return (ab * 255).astype(uint8)
