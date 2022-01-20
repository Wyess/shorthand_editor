#!/usr/bin/env python3

from Cocoa import NSPasteboard, NSString, NSUTF8StringEncoding

pb = NSPasteboard.generalPasteboard()
data = pb.dataForType_("image/svg+xml")
svg = NSString.alloc().initWithData_encoding_(data, NSUTF8StringEncoding)
print(svg)

