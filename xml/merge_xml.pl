#!/usr/bin/perl

use strict;
use warnings;
use XML::LibXML;

my $dom = XML::LibXML::Document->new('1.0', 'UTF-8');

my %shorthand;

my $shorthands = $dom->createElement('shorthands');
#my $shorthand = $dom->createElement('shorthand');
#my $dictionary = $dom->createElement('dictionary');
#my $characters = $dom->createElement('characters');
#my $name = $dom->createElement('name');

#$name->appendText('waseda');
#$shorthand->appendChild($name);
#$shorthand->appendChild($dictionary);
#$shorthand->appendChild($characters);
#$dom->setDocumentElement($shorthand);

my $dictionary;
my $characters;
my $name;
my $system;

$dom->setDocumentElement($shorthands);

for my $xml (@ARGV) {
    my $dom_in = XML::LibXML->load_xml(location => $xml);
    #printf "%s\n", $dom_in->findvalue('/shorthand/name');
    $system = $dom_in->findvalue('/shorthand/name');

    if (!exists $shorthand{$system}) {
        $shorthand{$system} = $dom->createElement('shorthand');
        $name = $dom->createElement('name');
        $name->appendText($system);
        $dictionary = $dom->createElement('dictionary');
        $characters = $dom->createElement('characters');
    }

    $shorthand{$system}->appendChild($name);
    $shorthand{$system}->appendChild($dictionary);
    $shorthand{$system}->appendChild($characters);
    #$dom->setDocumentElement($shorthand{$system});
    $shorthands->appendChild($shorthand{$system});
    for my $entry ($dom_in->findnodes('//dictionary/entry')) {
        $dictionary->appendChild($entry);
    }
    for my $character ($dom_in->findnodes('//characters/character')) {
        $characters->appendChild($character);
    }
}

print $dom->toString();

