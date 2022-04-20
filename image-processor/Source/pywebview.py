import base64

import numpy
import webview

from utils.image import ImageManager


class Application:

    manager = ImageManager()

    def load(self, path: str):
        image = self.manager.load_image(path)
        image = self.manager.to_image(image)
        return self.encode(image)

    def action(self, name: str, path: str, data: any = None):
        image = self.manager.process_image(name, path, data)
        image = self.manager.to_image(image)
        return self.encode(image)

    def apply(self, path: str):
        """Applies the the state to the image"""
        image = self.manager.apply_image(path)
        image = self.manager.to_image(image)
        return self.encode(image)

    def cancel(self, path: str):
        """Reverts the state back to the how the image was"""
        image = self.manager.cancel_image(path)
        image = self.manager.to_image(image)
        return self.encode(image)

    def encode(self, image: numpy.ndarray):
        """Encodes the image for for use"""
        return base64.b64encode(image).decode('ascii')


if __name__ == '__main__':
    window = webview.create_window('Image Editor', 'http://localhost:4200', width=1800, height=1000)

    app = Application()

    window.expose(app.action, app.load, app.apply, app.cancel)

    webview.start(debug=True)
