import math
import tkinter
from tkinter import BOTH, NW, Canvas, Frame, PhotoImage
from tkinter.messagebox import YES

import PIL.ImageTk
from cv2 import COLOR_BGR2RGB, INTER_AREA, Mat, cvtColor, imread, resize
from PIL.Image import PhotoImage

canvasX = 1800
canvasY = 900
img = imread('C:/Users/untun/Documents/Corel PaintShop Pro/2022/Samples/Emu.jpg')
img = cvtColor(img, COLOR_BGR2RGB)
height, width, no_channels = img.shape


class ResizeCanvas(Canvas):
    def __init__(self, parent, **kwargs):
        Canvas.__init__(self, parent, **kwargs)
        self.bind("<Configure>", self.on_resize)
        self.height = self.winfo_reqheight()
        self.width = self.winfo_reqwidth()

    def on_resize(self, event):
        # determine the ratio of old width/height to new width/height
        canvasX = float(event.width)/self.width
        canvasY = float(event.height)/self.height
        self.width = event.width
        self.height = event.height
        # resize the canvas
        self.config(width=self.width, height=self.height)
        # rescale all the objects tagged with the "all" tag
        self.scale("all", 0, 0, canvasX, canvasY)


def scale(img: Mat, width: int = math.inf, height: int = math.inf):
    h, w, c = img.shape

    ratio = min(float(width) / float(w), float(height) / float(h))
    newWidth = round(w * ratio)
    newHeight = round(h * ratio)
    dim = (newWidth, newHeight)

    # resize image
    return resize(img, dim, interpolation=INTER_AREA).copy()


def draw_canvas(img: Mat, frame: Frame, width: int, height: int):
    img = scale(img, width=canvasX, height=canvasY)
    canvas = ResizeCanvas(frame, width=canvasX, height=canvasY, highlightthickness=0)
    canvas.pack(fill=BOTH, expand=YES)
    canvas.addtag_all('all')

    photo = PhotoImage(image=PIL.Image.fromarray(img))

    canvas.create_image(0, 0, image=photo, anchor=NW)


def test(event):
    pass
    # draw_canvas(img, frame, canvasX, canvasY)


if __name__ == '__main__':

    window = tkinter.Tk()

    frame = Frame(window)
    frame.pack(fill=BOTH, expand=YES)

    frame.bind('<Configure>', test)
    draw_canvas(img, frame, canvasX, canvasY)

    # img = scale(img, width=canvasX, height=canvasY)
    # canvas = ResizingCanvas(
    #     frame, width=canvasX, height=canvasY, highlightthickness=0)
    # canvas.pack(fill=BOTH, expand=YES)
    # canvas.addtag_all('all')

    # photo = PIL.ImageTk.PhotoImage(image=PIL.Image.fromarray(img))

    # canvas.create_image(0, 0, image=photo, anchor=NW)

    window.mainloop()
