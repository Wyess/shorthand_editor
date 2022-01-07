all: pbsvg_objc

pbsvg_objc: pbsvg.m
	clang -framework Cocoa -O3 $^ -o pbsvg

pbsvg_swift: pbsvg.swift
	swiftc $^ -o pbsvg
