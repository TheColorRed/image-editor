import asyncio
import base64
import importlib
import importlib.util
import io
import json
import string
import sys
from datetime import datetime

import websockets
from cv2 import Mat, imread

from utils.image import Images, Paths, to_image


class Main:

    images: Paths = dict()

    async def message(self, websocket):
        while True:
            try:
                socket_message = await websocket.recv()
                message: dict = json.loads(socket_message.decode('UTF-8'))
                action: str = message.get('action', None)
                path: str = message.get('path', None)
                data = message.get('data', None)

                image_data = self.get_image(path)
                b64: str = ''
                if action == 'load':
                    b64 = self.load_image(image_data)
                elif action == 'apply':
                    b64 = self.apply_state(image_data)
                elif action == 'cancel':
                    b64 = self.cancel_state(image_data)
                else:
                    b64 = self.process_image(action, image_data, data)
                await websocket.send(b64)
            except websockets.exceptions.ConnectionClosed:
                print('Client Disconnected')
                break

    def load_image(self, images: Images):
        """Loads the initial image"""
        image = images.get('original')
        # image = to_image(images.get('original'))
        return self.encode(to_image(image))

    def apply_state(self, images: Images):
        """Applies the the state to the image"""
        images['before'] = images.get('after').copy()
        return self.encode(to_image(images['before']))

    def cancel_state(self, images: Images):
        """Reverts the state back to the how the image was"""
        return self.encode(to_image(images['before']))

    def process_image(self, action: string, images: Images, data=None):
        """Processes the image"""
        print('processing: ' + action)
        d1 = datetime.now()

        module = importlib.import_module('adjustments.' + action)

        if data is None:
            module.main(images)
        else:
            module.main(images, data)

        image = images.get('after')
        formatted_image = to_image(image)

        d2 = datetime.now()
        delta = d2 - d1

        print('finished: ' + action + ' in ' +
              str(delta.total_seconds()) + ' seconds')
        return self.encode(formatted_image)

    def encode(self, image: Mat):
        """Encodes the image for for use"""
        return io.BytesIO(image)
        # return base64.b64encode(image).decode('ascii')

    def get_image(self, path: string):
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

    async def run(self):
        async with websockets.serve(self.message, 'localhost', 8082):
            await asyncio.Future()

    def import_module(self, name, package=None):
        """An approximate implementation of import."""
        absolute_name = importlib.util.resolve_name(name, package)
        try:
            return sys.modules[absolute_name]
        except KeyError:
            pass

        path = None
        if '.' in absolute_name:
            parent_name, _, child_name = absolute_name.rpartition('.')
            parent_module = import_module(parent_name)
            path = parent_module.__spec__.submodule_search_locations
        for finder in sys.meta_path:
            spec = finder.find_spec(absolute_name, path)
            if spec is not None:
                break
        else:
            msg = f'No module named {absolute_name!r}'
            raise ModuleNotFoundError(msg, name=absolute_name)
        module = importlib.util.module_from_spec(spec)
        sys.modules[absolute_name] = module
        spec.loader.exec_module(module)
        if path is not None:
            setattr(parent_module, child_name, module)
        return module


main = Main()
asyncio.run(main.run())
