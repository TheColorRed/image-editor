from cv2 import GaussianBlur, Mat


def highPassFilter(source: Mat, radius: int = 10):
    return (source - GaussianBlur(source, (0, 0), radius) + 127).copy()
