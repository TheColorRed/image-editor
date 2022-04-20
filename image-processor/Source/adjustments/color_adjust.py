from cv2 import Mat
from filters.color_adjust import adjustHSL, adjustRGB
from utils.image import Images


def main(images: Images, params):
    type = params[0]

    image = images.get('before')

    result: Mat = None
    if type == 'rgb':
        type, red, green, blue = params
        result = adjustRGB(image, red, green, blue)
    elif type == 'hsl':
        type, hue, saturation, value = params
        result = adjustHSL(image, hue, saturation, value)

    images['after'] = result
