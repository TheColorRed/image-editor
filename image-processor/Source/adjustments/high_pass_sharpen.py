from blend.hard_light import hardLight
from blend.overlay import overlay
from blend.soft_light import softLight
from cv2 import addWeighted
from filters.gamma import gamma
from filters.high_pass_filter import highPassFilter
from filters.sharpen import sharpen
from numpy import zeros_like
from utils.image import Images


def main(images: Images, params: list[str, int, int]):
    blend, radius, strength = params
    image = images.get('before')
    # images['after'] = sharpen(image, radius, strength)
    if radius > 0 or strength > 0:
        hpf = highPassFilter(image, radius/100*10)
        sharp = sharpen(image, radius/100*10)

        mask = sharp >= 0.5
        ab = zeros_like(mask)

        amt = strength/100*1
        weight_strength = addWeighted(sharp, (1 - amt), hpf, amt, 50)

        if blend == 'soft light':
            result = softLight(weight_strength, hpf)
        elif blend == 'hard light':
            result = hardLight(weight_strength, hpf)
        elif blend == 'overlay':
            result = overlay(weight_strength, hpf)

        images['after'] = result
    else:
        images['after'] = image
