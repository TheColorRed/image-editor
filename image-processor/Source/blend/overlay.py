from cv2 import Mat, merge, split
from numpy import uint8, zeros_like


def overlay(a: Mat, b: Mat):
    a = a.astype(float) / 255
    b = b.astype(float) / 255

    mask = a >= 0.5
    ab = zeros_like(a)

    ab[~mask] = (2 * a * b)[~mask]
    ab[mask] = (1 - 2 * (1 - a) * (1 - b))[mask]

    return (ab * 255).astype(uint8)
