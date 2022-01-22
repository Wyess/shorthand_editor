#!/usr/bin/env python3

from Cocoa import NSPasteboard, NSString, NSUTF8StringEncoding, NSData

__pb = NSPasteboard.generalPasteboard()

def get_svg_from_pasteboard():
    global __pb
    data = __pb.dataForType_("image/svg+xml")
    return NSString.alloc().initWithData_encoding_(data, NSUTF8StringEncoding)

def set_svg_to_pasteboard(svg):
    global __pb
    data = NSString.stringWithString_(svg).nsstring().dataUsingEncoding_(NSUTF8StringEncoding)
    __pb.clearContents()
    __pb.setData_forType_(data, "image/svg+xml")

if __name__ == "__main__":
    svg = get_svg_from_pasteboard()
    if svg:
        print(svg)
