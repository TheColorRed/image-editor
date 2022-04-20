from filters.white_balance import whiteBalance
from numpy import number
from utils.image import Images


def main(images: Images, params: number):
    image = images.get('before')
    images['after'] = whiteBalance(image)
