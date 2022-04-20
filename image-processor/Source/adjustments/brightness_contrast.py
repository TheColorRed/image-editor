from typing import Dict

from filters.brightness import brightness
from filters.contrast import contrast
from utils.image import Images


def main(images: Images, params: list[int, int]):
    bright, cont = params
    image = images.get('before')

    b = brightness(image, bright)
    result = contrast(b, cont)

    images['after'] = result
