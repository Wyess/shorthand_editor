class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  pmove(r, deg) {
    this.x += r * Math.cos(deg * Math.PI / 180);
    this.y += r * Math.sin(deg * Math.PI / 180);
    return this;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
  }

  add(pt) {
    this.x += pt.x;
    this.y += pt.y
    return this;
  }

  scale(sx, sy) {
    this.x *= sx;
    if (typeof(sy) != 'undefined') {
      this.y *= sy
    }
    return this;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  pset(r, deg) {
    this.x = r * Math.cos(deg * Math.PI / 180);
    this.y = r * Math.sin(deg * Math.PI / 180);
    return this;
  }

  toString() {
    return this.x + "," + this.y;
  }

  m() {
    return "m" + this.x + "," + this.y;
  }
}

p = function(x, y) {
  return new Point(x, y);
};

pp = function(r, deg) {
  return new Point(r * Math.cos(deg * Math.PI / 180), r * Math.sin(deg * Math.PI / 180));
};
