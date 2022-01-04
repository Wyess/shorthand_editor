#import <Cocoa/Cocoa.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSPasteboard *pboard = [NSPasteboard generalPasteboard];
        NSData *data = [pboard dataForType:@"image/svg+xml"];
        NSString *svg = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        
        if (data == nil) return 1;
    
        printf("%s", [svg UTF8String]);
    }
    
    return 0;
}
