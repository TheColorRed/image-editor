from cv2 import Mat

from blend.overlay import overlay


def hardLight(a: Mat, b: Mat):
    return overlay(b, a)
