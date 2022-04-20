from cv2 import GaussianBlur, Mat, addWeighted


def sharpen(source: Mat, radius: int = 3):
    blur = GaussianBlur(source, (0, 0), radius)
    return addWeighted(source, 1.5, blur, -0.5, 0)
