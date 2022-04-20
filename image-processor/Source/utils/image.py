import base64
import importlib
import io
from datetime import datetime
from typing import Dict, TypedDict

import cv2
import numpy
from cv2 import Mat, imencode, imread


class Images(TypedDict):
    original: Mat
    before: Mat
    after: Mat


Paths = Dict[str, Images]


class ImageManager:

    images: Paths = dict()

    def load_image(self, path: str):
        """Loads the initial image"""
        images = self.get_image(path)
        image = images.get('original')
        # return self.get_quadrants(image)
        # rgba = cv2.cvtColor(image, COLOR_BGR2RGBA)

        # flat = rgba.flatten('F')
        # return flat
        # r, g, b, a = cv2.split(rgba)
        # return r.tolist()
        # print(r.size)
        # return to_image(image).tolist()
        return image

    def process_image(self, name: str, path: str, data: any = None):
        print('processing: ' + name)
        d1 = datetime.now()

        images = self.get_image(path)
        module = importlib.import_module('adjustments.' + name)

        if data is None:
            module.main(images)
        else:
            module.main(images, data)

        image = images.get('after')
        # formatted_image = self. to_image(image)
        # quads = self.get_quadrants(image)

        d2 = datetime.now()
        delta = d2 - d1

        print('finished: ' + name + ' in ' + str(delta.total_seconds()) + ' seconds')
        return image

    def get_image(self, path: str):
        image_data = self.images.get(path, None)
        if image_data is None:
            image_data = self.images[path] = dict()
            # The original image without changes
            image_data['original'] = imread(path)
            # The current state of the image before changes
            image_data['before'] = imread(path)
            # The state of the image after changes
            image_data['after'] = imread(path)
        return image_data

    def apply_image(self, path: str):
        """Applies the the state to the image"""
        images = self.get_image(path)
        images['before'] = images.get('after').copy()
        return images['before']

    def cancel_image(self, path: str):
        """Reverts the state back to the how the image was"""
        images = self.get_image(path)
        return images['before']

    def to_image(self, image: Mat, ext='.jpg', quality=100) -> numpy.ndarray:
        retval, buffer = imencode(ext, image, [
            int(cv2.IMWRITE_JPEG_QUALITY), quality,
            int(cv2.IMWRITE_PNG_COMPRESSION), max(int(quality/100*10), 1),
            int(cv2.IMWRITE_WEBP_QUALITY), quality
        ])
        return buffer

    def get_quadrants(self, image: Mat):
        height, width, other = image.shape
        # [rows, columns]
        q1 = image[0:int(height/2), 0:int(width/2)].copy()
        q2 = image[0:int(height/2), int(width/2):int(width)].copy()
        q3 = image[int(height/2):int(height), 0:int(width/2)].copy()
        q4 = image[int(height/2):int(height), int(width/2):int(width)].copy()

        return [
            # Top left
            {'x': 0, 'y': 0, 'i': self.to_image(q1)},
            # Top right
            {'x': int(width/2), 'y': 0, 'i': self.to_image(q2)},
            # # Bottom left
            {'x': 0, 'y': int(height/2), 'i': self.to_image(q3)},
            # # Bottom right
            {'x': int(width/2), 'y': int(height/2), 'i': self.to_image(q4)}
        ]
