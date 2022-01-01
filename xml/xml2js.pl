#!/usr/bin/perl

use strict;
use warnings;
use XML::LibXML;
use JSON;
use Data::Dumper;
use feature 'say';

binmode STDOUT, ':utf8';

my $filename = shift;
my $dom_root = XML::LibXML->load_xml(location => $filename);

my $table = {};

for my $dom ($dom_root->findnodes('/shorthands/shorthand')) {
    my $system = $dom->findvalue('./name');

    for my $index ($dom->findnodes('.//dictionary/entry/index')) {
        my $characterNames = $index->findvalue('../characterNames');
        my @indices = split /\s+/, $index->to_literal;
        for my $index (@indices) {
            $table->{$system}->{'dictionary'}->{$index} = $characterNames;
        }
    }

    for my $type (qw/model head tail headModel tailModel color/) {
        for my $param ($dom->findnodes(".//character/$type")) {
            my $charname = $param->findvalue('../name');
            $table->{$system}->{$type}->{$charname} = $param->to_literal();
        }
    }

    for my $type (qw/offsetX offsetY right/) {
        for my $param ($dom->findnodes(".//character/$type")) {
            my $charname = $param->findvalue('../name');
            $table->{$system}->{$type}->{$charname} = 0 + ($param->to_literal() || 0);
        }
    }

    for my $type (qw/bold/) {
        for my $param ($dom->findnodes(".//character/$type")) {
            my $charname = $param->findvalue('../name');
            $table->{$system}->{$type}->{$charname} = $param->to_literal() eq "true" ? JSON::true : JSON::false;
        }
    }

    for my $type (qw/refKey path pathExtra/) {
        for my $param ($dom->findnodes(".//character/glyph/$type")) {
            my $keys = $param->findvalue('../key');
            for my $key (split /\s+/, $keys) {
                my $charname = $param->findvalue('../../name');
                $table->{$system}->{$type}->{$charname}->{$key} = $param->to_literal();
            }
        }
    }

    for my $type (qw/model head tail headModel tailModel/) {
        for my $param ($dom->findnodes(".//character/glyph/$type")) {
            my $keys = $param->findvalue('../key');
            for my $key (split /\s+/, $keys) {
                my $charname = $param->findvalue('../../name');
                $table->{$system}->{'new' . ucfirst $type}->{$charname}->{$key} = $param->to_literal();
            }
        }
    }

    for my $type (qw/entryX entryY exitX exitY length/) {
        for my $param ($dom->findnodes(".//character/glyph/$type")) {
            my $keys = $param->findvalue('../key');
            for my $key (split /\s+/, $keys) {
                my $charname = $param->findvalue('../../name');
                $table->{$system}->{$type}->{$charname}->{$key} = 0 + $param->to_literal();
            }
        }
    }

    for my $substitute ($dom->findnodes(".//character/*[self::substitution or self::sub]")) {
        my $type = $substitute->findvalue('./type');
        my $by = $substitute->findvalue('./by');
        my $charname = $substitute->findvalue('../name');
        for my $target ($substitute->findnodes('./target')) {
            $table->{$system}->{'sub'}->{$type}->{$charname}->{$target->to_literal()} = $by;
        }
    }
}

my $json = JSON->new->allow_nonref;
my $content = $json->encode($table);
print "const table = $content;";
