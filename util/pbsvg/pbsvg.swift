import Cocoa

let svgType = NSPasteboard.PasteboardType(rawValue:"image/svg+xml")
guard let svgData = NSPasteboard.general.data(forType:svgType) else {exit(1)}
let svg = String(decoding:svgData, as:UTF8.self)
print(svg)

