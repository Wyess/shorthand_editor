#!/usr/bin/env python3

from decimal import Decimal, ROUND_HALF_UP
import sys
from svgpathtools import parse_path

def main():
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            try:
                print(parse_path_d(arg, json=True))
            except:
                pass
    else:
        lines = [line.rstrip() for line in sys.stdin.readlines()]
        for line in lines:
            try:
                print(parse_path_d(line, json=True))
            except:
                pass

def dround(val, fmt='0.001'):
    return Decimal(val).quantize(Decimal(fmt), rounding=ROUND_HALF_UP)

def parse_path_d(d, json=False):
    path = parse_path(d)

    length = dround(path.length())

    startX = dround(path.start.real)
    startY = dround(path.start.imag)

    endX = dround(path.end.real)
    endY = dround(path.end.imag)

    bbox = path.bbox()
    minX = dround(bbox[0])
    maxX = dround(bbox[1])
    minY = dround(bbox[2])
    maxY = dround(bbox[3])

    if json:
        return f'{{"d": "{d}", "length": {length}, "startX": {startX}, "startY": {startY}, "endX": {endX}, "endY": {endY}, "minX": {minX}, "maxX": {maxX}, "minY": {minY}, "maxY": {maxY}}}'
    else:
        return {"d": d, "length": length, "startX": startX, "startY": startY, "endX": endX, "endY": endY, "minX": minX, "maxX": maxX, "minY": minY, "maxY": maxY}

if __name__ == "__main__":
    main()
