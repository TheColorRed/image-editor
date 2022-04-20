from cv2 import LUT, Mat
from numpy import array, clip, empty, power, round, uint8


def gamma(source: Mat, g: int):
    lookUpTable = empty((1, 256), uint8)
    for i in range(256):
        lookUpTable[0, i] = clip(pow(i / 255.0, g) * 255.0, 0, 255)
    return LUT(source, lookUpTable)
    # gamma_table = [power(x / 255.0, g) * 255.0 for x in range(256)]
    # gamma_table = round(array(gamma_table)).astype(uint8)
    # return LUT(source, gamma_table)
