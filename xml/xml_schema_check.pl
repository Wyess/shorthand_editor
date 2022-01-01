#!/usr/bin/perl

use strict;
use warnings;
use XML::LibXML;

my $schema = XML::LibXML::Schema->new(location => "shorthand.xsd");
my $parser = XML::LibXML->new(XML_LIBXML_LINENUMBERS => 1);

my $tree = $parser->parse_file($ARGV[0]);
if ($schema->validate($tree) == 0) {
    print STDERR "$ARGV[0]: Valid\n";
    exit 0;
}
else {
    print STDERR "$ARGV[0]: Invalid\n";
    exit 1;
}
