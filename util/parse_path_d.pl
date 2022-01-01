#!/usr/local/bin/perl

use strict;
use warnings;
use List::Util qw/max min/;
use Image::SVG::Path qw/extract_path_info/;
use JSON;
use Math::Round qw/nearest nearest_ceil nearest_floor/;
use Math::Trig 'pi';
use Data::Dumper;

#my $path = "m 0,0 c 1.45511,0.7737 4.4654412,1.7816485 4.4654412,0.048994";

my $path_d = shift;
if ($path_d eq '') {
    print_as_json({
        path_d => 'M0,0',
        length => 0,
        minX   => 0,
        maxX   => 0,
        minY   => 0,
        maxY   => 0,
        startX => 0,
        startY => 0,
        endX   => 0,
        endY   => 0,
        bbox   => '',
        angle  => []
    });
    exit;
}

#print STDERR "<$path_d>\n";
my @path_info = extract_path_info($path_d, {absolute => 1, no_smooth => 1});
my $path_data = parse_path_info(@path_info);

print_as_json($path_data);

######################################################################

sub print_as_json {
    my $dat = shift;
    print encode_json({
        d      => $dat->{'path_d'},
        length => nearest(0.001, $dat->{'length'}),
        startX => nearest(0.001, $dat->{'startX'}),
        startY => nearest(0.001, $dat->{'startY'}),
        endX   => nearest(0.001, $dat->{'endX'}),
        endY   => nearest(0.001, $dat->{'endY'}),
        minX   => nearest_floor(0.001, $dat->{'minX'}),
        maxX   => nearest_ceil(0.001, $dat->{'maxX'}),
        minY   => nearest_floor(0.001, $dat->{'minY'}),
        maxY   => nearest_ceil(0.001, $dat->{'maxY'}),
        bbox   => $dat->{'bbox'},
        angle  => [map {nearest(0.1, $_)} @{$dat->{'angle'}}]
    }), "\n";
}

sub parse_path_info {
    my @path_info = @_;
    my $pos = [0, 0];
    my $angle = 0;
    my $cnt = 0;
    my $res = {
        path_d => '',
        length => 0,
        minX   => "Inf",
        maxX   => -"Inf",
        minY   => "Inf",
        maxY   => -"Inf",
        startX => 0,
        startY => 0,
        endX   => 0,
        endY   => 0,
        bbox   => ''
    };

    for my $cmd (@path_info) {
        for ($cmd->{'svg_key'}) {
            if (/M/) {
                if ($cnt == 0) {
                    $res->{'startX'} = $cmd->{'point'}->[0];
                    $res->{'startY'} = $cmd->{'point'}->[1];
                }
                $res->{'path_d'} .= sprintf('%sM %f %f',
                    $cnt++ == 0 ? '' : ' ',
                    $cmd->{'point'}->[0] - $res->{'startX'},
                    $cmd->{'point'}->[1] - $res->{'startY'}
                );
                $pos->[0] = $cmd->{'point'}->[0];
                $pos->[1] = $cmd->{'point'}->[1];
            }
            elsif (/C/) {
                my $parsed = parse_cubic_bezier(
                    $pos,
                    $cmd->{'control1'},
                    $cmd->{'control2'},
                    $cmd->{'end'}
                );
                $res->{'minX'} = min($res->{'minX'}, $parsed->{'minX'});
                $res->{'maxX'} = max($res->{'maxX'}, $parsed->{'maxX'});
                $res->{'minY'} = min($res->{'minY'}, $parsed->{'minY'});
                $res->{'maxY'} = max($res->{'maxY'}, $parsed->{'maxY'});
                $res->{'length'} += $parsed->{'length'};
                $res->{'path_d'} .= sprintf(' c %f %f %f %f %f %f',
                    $cmd->{'control1'}->[0] - $pos->[0],
                    $cmd->{'control1'}->[1] - $pos->[1],
                    $cmd->{'control2'}->[0] - $pos->[0],
                    $cmd->{'control2'}->[1] - $pos->[1],
                    $cmd->{'end'}->[0] - $pos->[0],
                    $cmd->{'end'}->[1] - $pos->[1]
                );
                push @{$res->{'angle'}}, $parsed->{'angle'};
                $pos->[0] = $cmd->{'end'}->[0];
                $pos->[1] = $cmd->{'end'}->[1];
            }
            elsif (/L/) {
                my $parsed = parse_line(
                    $pos,
                    $cmd->{'point'}
                );
                $res->{'minX'} = min($res->{'minX'}, $parsed->{'minX'});
                $res->{'maxX'} = max($res->{'maxX'}, $parsed->{'maxX'});
                $res->{'minY'} = min($res->{'minY'}, $parsed->{'minY'});
                $res->{'maxY'} = max($res->{'maxY'}, $parsed->{'maxY'});
                $res->{'length'} += $parsed->{'length'};
                $res->{'path_d'} .= sprintf(' l %f %f',
                    $cmd->{'point'}->[0] - $pos->[0],
                    $cmd->{'point'}->[1] - $pos->[1]
                );
                push @{$res->{'angle'}}, $parsed->{'angle'};
                $pos->[0] = $cmd->{'point'}->[0];
                $pos->[1] = $cmd->{'point'}->[1];
            }
            elsif (/H/) {
                my $parsed = parse_horizontal_line(
                    $pos,
                    $cmd->{'x'}
                );
                $res->{'minX'} = min($res->{'minX'}, $parsed->{'minX'});
                $res->{'maxX'} = max($res->{'maxX'}, $parsed->{'maxX'});
                $res->{'minY'} = min($res->{'minY'}, $parsed->{'minY'});
                $res->{'maxY'} = max($res->{'maxY'}, $parsed->{'maxY'});
                $res->{'length'} += $parsed->{'length'};
                $res->{'path_d'} .= sprintf ' h %f', $cmd->{'x'} - $pos->[0];
                push @{$res->{'angle'}}, $parsed->{'angle'};
                $pos->[0] = $cmd->{'x'};
            }
            elsif (/V/) {
                my $parsed = parse_vertical_line(
                    $pos,
                    $cmd->{'y'}
                );
                $res->{'minX'} = min($res->{'minX'}, $parsed->{'minX'});
                $res->{'maxX'} = max($res->{'maxX'}, $parsed->{'maxX'});
                $res->{'minY'} = min($res->{'minY'}, $parsed->{'minY'});
                $res->{'maxY'} = max($res->{'maxY'}, $parsed->{'maxY'});
                $res->{'length'} += $parsed->{'length'};
                $res->{'path_d'} .= sprintf ' v %f', $cmd->{'y'} - $pos->[1];
                push @{$res->{'angle'}}, $parsed->{'angle'};
                $pos->[1] = $cmd->{'y'};
            }
        }
    }

    $res->{'endX'} = $pos->[0] - $res->{'startX'};
    $res->{'endY'} = $pos->[1] - $res->{'startY'};

    $res->{'minX'} -= $res->{'startX'};
    $res->{'maxX'} -= $res->{'startX'};
    $res->{'minY'} -= $res->{'startY'};
    $res->{'maxY'} -= $res->{'startY'};
    $res->{'bbox'} = sprintf("M %.3f %.3f H %.3f V %.3f H %.3f Z",
        $res->{'minX'},
        $res->{'minY'},
        $res->{'maxX'},
        $res->{'maxY'},
        $res->{'minX'}
    );

    $res->{'startX'} = 0;
    $res->{'startY'} = 0;

    return $res;
}

sub dist {
    my ($z0, $z1) = @_;
    return sqrt(($z1->[0] - $z0->[0]) ** 2 + ($z1->[1] - $z0->[1]) ** 2);
}

sub cubic_bezier {
    my ($z0, $z1, $z2, $z3, $t) = @_;
    my @c = (
        (1 - $t) ** 3,
        3 * (1 - $t) ** 2 * $t,
        3 * (1 - $t) * $t ** 2,
        $t ** 3
    );
    return [
        $c[0] * $z0->[0] + $c[1] * $z1->[0] + $c[2] * $z2->[0] + $c[3] * $z3->[0],
        $c[0] * $z0->[1] + $c[1] * $z1->[1] + $c[2] * $z2->[1] + $c[3] * $z3->[1]
    ];
}

sub parse_cubic_bezier {
    my ($z0, $z1, $z2, $z3) = @_;
    my $len = 0;
    my $n = 1000;
    my $minX = "Inf";
    my $maxX = -"Inf";
    my $minY = "Inf";
    my $maxY = -"Inf";
    my $angle = get_tail_angle_of_cubic_bezier($z2, $z3);

    for my $i (0 .. $n - 1) {
        my $p0 = cubic_bezier($z0, $z1, $z2, $z3, $i / $n);
        my $p1 = cubic_bezier($z0, $z1, $z2, $z3, ($i + 1) / $n);
        $minX = min($p0->[0], $p1->[0], $minX);
        $maxX = max($p0->[0], $p1->[0], $maxX);
        $minY = min($p0->[1], $p1->[1], $minY);
        $maxY = max($p0->[1], $p1->[1], $maxY);
        $len += dist($p0, $p1);
    }

    return {
        length => $len,
        minX   => $minX,
        maxX   => $maxX,
        minY   => $minY,
        maxY   => $maxY,
        angle  => $angle
    };
}

sub parse_line {
    my ($z0, $z1) = @_;
    my $len   = dist($z0, $z1);
    my $minX  = min($z0->[0], $z1->[0]);
    my $maxX  = max($z0->[0], $z1->[0]);
    my $minY  = min($z0->[1], $z1->[1]);
    my $maxY  = max($z0->[1], $z1->[1]);
    my $angle = get_angle($z1->[0] - $z0->[0], $z1->[1] - $z0->[1]);

    return {
        length => $len,
        minX   => $minX,
        maxX   => $maxX,
        minY   => $minY,
        maxY   => $maxY,
        angle  => $angle
    };
}

sub parse_horizontal_line {
    my ($z0, $x) = @_;
    my $len = abs($z0->[0] - $x);

    return {
        length => $len,
        minX   => min($z0->[0], $x),
        maxX   => max($z0->[0], $x),
        minY   => $z0->[1],
        maxY   => $z0->[1],
        angle  => 0
    };
}

sub parse_vertical_line {
    my ($z0, $y) = @_;
    my $len = abs($z0->[1] - $y);

    return {
        length => $len,
        minX   => $z0->[1],
        maxX   => $z0->[1],
        minY   => min($z0->[1], $y),
        maxY   => max($z0->[1], $y),
        angle  => -90
    };
}

sub get_angle {
    my ($dx, $dy ) = @_;
    return atan2($dy, $dx) * 180 / pi;
}

sub get_tail_angle_of_cubic_bezier {
    # dP(t) / dt = -3(1-t)^2 * P0 
    #              + 3(1-t)^2 * P1 - 6t(1-t) * P1 
    #              - 3t^2 * P2 + 6t(1-t) * P2 
    #              + 3t^2 * P3 
    # dP(t)/dt = 3 * (P3 - P2) when t = 1
    my ($p2, $p3) = @_;
    return get_angle(3 * ($p3->[0] - $p2->[0]), 3 * ($p3->[1] - $p2->[1]));
}
