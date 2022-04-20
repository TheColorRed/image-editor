from cv2 import Mat
from cv2.xphoto import createGrayworldWB


def whiteBalance(source: Mat):
    clone = source.copy()
    wb = createGrayworldWB()
    # wb = cv2.xphoto.createSimpleWB()
    # wb.setSaturationThreshold(params)
    # wb.setOutputMax(0)
    return wb.balanceWhite(clone)
