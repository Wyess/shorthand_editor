class Char {
  static dict = {};

  constructor(name, kana, model, headType, tailType, color, bold, offset, right) {
    this.name           = name;
    this.model          = model;
    this.kana           = kana;
    this.description    = "";
    this.key            = "";
    this.update         = 0;

    this.paths          = "";
    this.pathsExtra     = "";

    this.pdp            = p(0, 0);
    this.dp             = p(0, 0);
    this.offset         = offset ?? p(1, 0);  // Offset from CharSpace
    this.right          = right ?? 0;  // Horizontal offset to CharSpace

    this.headType       = headType;
    this.tailType       = tailType;

    this.color          = color;

    this.pos            = p(0, 0);
    this.prev           = null;
    this.next           = null;

    this.thickness      = 0.3543307 * 1.2 * (bold ? 1.8 : 1);
    this.thicknessExtra = this.thickness;
    this.speed          = 30; /* mm/s */
  }

  static connectChars(chars) {
    for (let i = 1; i < chars.length; i++) {
      chars[i - 1].next = chars[i];
      chars[i].prev = chars[i - 1];
    }
    for (let i = 0; i < 2; i++) {
      for (const c of chars) {
        c.setPaths();
        c.setPathsExtra();
      }
    }
  }

  static createElements(chars, pos) {
    pos ??= {x: 5, y: 10, left: 5, right: 5, bottom: 10, row: 10};

    if (chars.length > 0) {
      pos.x += chars[0].offset.x;
      pos.y += chars[0].offset.y;
    }

    Char.connectChars(chars);

    //const groups = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const groups = document.createDocumentFragment();

    for (let i = 0, j = 0; i < chars.length; i++) {
      const c = chars[i];
      groups.append(c.createElement(pos));
      if ((i + 1 == chars.length) || ["CharNewline", "CharSpace", "CharFullWidthSpace"].includes(c.name)) {
        do {
          if (chars[j].pathsExtra.length > 0) {
            groups.append(chars[j].createElementExtra());
          }
        } while (++j <= i);
      }
    }

    return groups;
  }

  static createElementList(charsArray, pos) {
    pos ??= {x: 5, y: 10, left: 5, right: 5, bottom: 10, row: 10};
    const charsFlat = charsArray.flat();
    const groupList = []; 

    if (charsFlat.length > 0) {
      pos.x += charsFlat[0].offset.x;
      pos.y += charsFlat[0].offset.y;
    }

    Char.connectChars(charsFlat);

    for (const chars of charsArray) {
      const groups = document.createElementNS("http://www.w3.org/2000/svg", "g");

      for (let i = 0, j = 0; i < chars.length; i++) {
        const c = chars[i];
        groups.append(c.createElement(pos));
        if ((i + 1 == chars.length) || ["CharNewline", "CharSpace", "CharFullWidthSpace"].includes(c.name)) {
          do {
            const cx = chars[j];
            if (cx.pathsExtra.length > 0) {
              groups.append(cx.createElementExtra());
            }
          } while (++j <= i);
        }
      }
      groupList.push(groups);
    };
    return groupList;
  }

  updatePenPos(pos) {
    pos.x += this.dp.x + this.pdp.x;
    pos.y += this.dp.y + this.pdp.y;
  }

  * keyGen() {
    yield this.n$n;
    yield this.n$m;
    yield this.n$hm;
    yield this.n$h;
    yield this.n$x;
    yield this.m$n;
    yield this.m$m;
    yield this.m$hm;
    yield this.m$h;
    yield this.m$x;
    yield this.tm$n;
    yield this.tm$m;
    yield this.tm$hm;
    yield this.tm$h;
    yield this.tm$x;
    yield this.t$n;
    yield this.t$m;
    yield this.t$hm;
    yield this.t$h;
    yield this.t$x;
    yield this.x$n;
    yield this.x$m;
    yield this.x$hm;
    yield this.x$h;
    yield this.x$x;
  }

  getNextHeadType() {
    return this.next?.headType ?? "";
  }

  getPrevTailType() {
    return this.prev?.tailType ?? "";
  }

  getNextModel() {
    return this.next?.model ?? "";
  }

  getNextHeadModel() {
    return this.next?.model?.replace(/(\D+\d*).*/, "$1") ?? "";
  }

  getPrevModel() {
    return this.prev?.model ?? "";
  }

  getPrevTailModel() {
    return this.prev?.model?.replace(/.*?(\D+\d*)$/, "$1") ?? "";
  }

  getNextName() {
    return this.next?.name ?? "";
  }

  getPrevName() {
    return this.prev?.name ?? "";
  }

  getNextOffset() {
    return this.next?.offset ?? p(1, 0);
  }

  getPrevOffset() {
    return this.prev?.offset ?? p(1, 0);
  }

  get prevName() {
    return this.prev?.name ?? "";
  }

  get n$x() {
    return `N(${this.prevName})_X`;
  }

  get m$x() {
    return `M(${this.prevModel})_X`;
  }

  get tm$x() {
    return `TM(${this.prevTailModel})_X`;
  }

  get t$x() {
    return `T(${this.prevTailType})_X`
  }

  get x$n() {
    return `X_N(${this.nextName})`;
  }

  get x$m() {
    return `X_M(${this.nextModel})`;
  }

  get x$hm() {
    return `X_HM(${this.nextHeadModel})`;
  }

  get x$h() {
    return `X_H(${this.nextHeadType})`;
  }

  get n$n() {
    return `N(${this.prevName})_N(${this.nextName})`;
  }

  get n$m() {
    return `N(${this.prevName})_M(${this.nextModel})`;
  }

  get n$hm() {
    return `N(${this.prevName})_HM(${this.nextHeadModel})`;
  }

  get n$h() {
    return `N(${this.prevName})_H(${this.nextHeadType})`;
  }

  get m$n() {
    return `M(${this.prevModel})_N(${this.nextName})`;
  }

  get m$m() {
    return `M(${this.prevModel})_M(${this.nextModel})`;
  }

  get m$hm() {
    return `M(${this.prevModel})_HM(${this.nextHeadModel})`;
  }

  get m$h() {
    return `M(${this.prevModel})_H(${this.nextHeadType})`;
  }

  get tm$n() {
    return `TM(${this.prevTailModel})_N(${this.nextName})`;
  }

  get tm$m() {
    return `TM(${this.prevTailModel})_M(${this.nextModel})`;
  }

  get tm$hm() {
    return `TM(${this.prevTailModel})_HM(${this.nextHeadModel})`;
  }

  get tm$h() {
    return `TM(${this.prevTailModel})_H(${this.nextHeadType})`;
  }

  get t$n() {
    return `T(${this.prevTailType})_N(${this.nextName})`;
  }

  get t$m() {
    return `T(${this.prevTailType})_M(${this.nextModel})`;
  }

  get t$hm() {
    return `T(${this.prevTailType})_HM(${this.nextHeadModel})`;
  }

  get t$h() {
    return `T(${this.prevTailType})_H(${this.nextHeadType})`;
  }

  get x$x() {
    return "X_X";
  }

  get prevModel() {
    return this.prev?.model ?? "";
  }

  get prevTailModel() {
    return this.prev?.model?.replace(/.*?(\D+\d*)$/, "$1") ?? "";
  }

  get prevTailType() {
    return this.prev?.tailType ?? "";
  }

  get nextName() {
    return this.next?.name ?? "";
  }

  get nextModel() {
    return this.next?.model ?? "";
  }

  get nextHeadModel() {
    return this.next?.model?.replace(/(\D+\d*).*/, "$1") ?? "";
  }

  get nextHeadType() {
    return this.next?.headType ?? "";
  }

  get name$name() {
    return this.prevName + "_" + this.nextName;
  }

  get name$model() {
    return this.prevName + "_" + this.nextModel;
  }

  get name$headModel() {
    return this.prevName + "_" + this.nextHeadModel;
  }

  get name$head() {
    return this.prevName + "_" + this.nextHead;
  }

  get model$name() {
    return this.prevModel + "_" + this.nextName;
  }

  get model$model() {
    return this.prevModel + "_" + this.nextModel;
  }

  get model$headModel() {
    return this.prevModel + "_" + this.headModel;
  }

  get model$head() {
    return this.prevModel + "_" + this.nextHead;
  }

  get tailModel$name() {
    return this.prevTailModel + "_" + this.nextName;
  }

  get tailModel$model() {
    return this.prevTailModel + "_" + this.nextModel;
  }

  get tailModel$headModel() {
    return this.prevTailModel + "_" + this.nextHeadModel;
  }

  get tailModel$head() {
    return this.prevTailModel + "_" + this.nextHead;
  }

  get tail$name() {
    return this.prevTailType + "_" + this.nextName;
  }

  get tail$model() {
    return this.prevTailType + "_" + this.nextModel;
  }

  get tail$headModel() {
    return this.prevTailType + "_" + this.nextHeadModel;
  }

  get tail$head() {
    return this.prevTailType + "_" + this.nextHeadType;
  }

  createElement(pos) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = this.name;
    g.appendChild(title);
    g.style.strokeWidth = this.thickness;
    g.style.stroke = this.color;
    g.setAttribute("transform", `translate(${this.pdp.x + pos.x} ${this.pdp.y + pos.y})`); 

    this.pos.x = pos.x;
    this.pos.y = pos.y;
    pos.right  = pos.right < pos.x + this.right ? pos.x + this.right : pos.right;
    pos.bottom = pos.bottom < pos.y ? pos.y : pos.bottom;

    this.paths = [].concat(this.paths || []);

    for (const pathstr of this.paths) {
      for (const d of pathstr.split(/(?=M)/)) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.dataset.char = this.name;
        path.dataset.head = this.headType;
        path.dataset.newHead = '';
        path.dataset.tail = this.tailType;
        path.dataset.newTail = '';
        path.dataset.kana = this.kana;
        path.dataset.model = this.model;
        path.dataset.newModel = '';
        path.dataset.key = "";
        path.dataset.scrollY = this.scrollY ?? 0;
        path.dataset.speed = pos.speed;
        path.dataset.key = this.key;
        path.dataset.update = this.update;
        path.dataset.index = '';
        path.dataset.names = '';
        g.appendChild(path);
      }
    }

    this.updatePenPos(pos);
    return g;
  }

  createElementExtra() {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = this.name;
    g.appendChild(title);
    g.style.strokeWidth = this.thicknessExtra;
    g.style.stroke = this.color;
    g.setAttribute("transform", `translate(${this.pos.x} ${this.pos.y})`); 

    this.pathsExtra = [].concat(this.pathsExtra || []);

    for (const pathstr of this.pathsExtra) {
      for (const d of pathstr.split(/(?=M)/)) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.dataset.speed = this.speed;
        g.appendChild(path);
      }
    }
    return g;
  }

  setPaths() {}

  setPathsExtra() {}
}

class CharSpace extends Char {
  constructor() {
    super("CharSpace", "空白", "", "", "", "black");
  }

  updatePenPos(pos) {
    const nextName = this.getNextName();
    const prevName = this.getPrevName();
    const offset = this.getNextOffset();
    pos.x = pos.right + offset.x + (((prevName == "CharSpace") || (prevName == "CharNewline")) ? 1 : 5);
    pos.y = pos.row + offset.y;
  }
}

class CharFullWidthSpace extends Char {
  constructor() {
    super("CharFullWidthSpace", "空白", "", "", "", "black");
  }
  
  updatePenPos(pos) {
    pos.x = pos.right + 5;
    pos.y = pos.row;
  }
}

class CharUp extends Char {
  constructor(mm = 1) {
    super("CharUp", "上", "", "", "", "black", false, p(0, 0));
    this.dp = p(0, -mm);
  }
}

class CharDown extends Char {
  constructor(mm = 1) {
    super("CharDown", "下", "", "", "", "black", false, p(0, 0));
    this.dp = p(0, mm);
  }
}

class CharLeft extends Char {
  constructor(mm = 1) {
    super("CharLeft", "左", "", "", "", "black", false, p(0, 0));
    this.dp = p(-mm, 0);
  }
}

class CharRight extends Char {
  constructor(mm = 1) {
    super("CharRight", "右", "", "", "", "black", false, p(0, 0));
    this.dp = p(mm, 0);
  }
}

class CharMove extends Char {
  constructor(x, y) {
    super("CharMove", "移動", "", "", "", "black", false, p(0, 0));
    this.dp = p(x, y);
  }
}

CtorMove = function(x, y) {
  return function() {
    return new CharMove(x, y);
  }; 
};

class CharNewline extends Char {
  constructor() {
    super("CharNewline", "改行", "", "", "", "black");
    this.dp = p(5, 5);
  }
  
  updatePenPos(pos) {
    const offset = this.getNextOffset();
    pos.x = pos.left + offset.x;
    pos.row = pos.bottom + this.dp.y;
    pos.y = pos.row + offset.y;
    pos.right = pos.left;
  }
}


class CharNewpage extends Char {
  constructor() {
    super("CharNewpage", "改頁", "", "", "", "black");
    this.scrollY = 297;
  }

  setPaths() {
    this.paths = ["m0,0"];
  }

  updatePenPos(pos) {
    const offset = this.getNextOffset();
    pos.left  = 5;
    pos.x = pos.left + offset.x;
    pos.y = Math.ceil(pos.y / 297) * 297 + 10;
    pos.row = pos.bottom = pos.y + 5;
    pos.right = pos.left;
  }
}


class CharScroll extends Char {
  constructor(dy) {
    super("CharScroll", "スクロール", "", "", "", "black");
    this.scrollY = dy;
  }

  setPaths() {
    this.paths = ["m0,0"];
  }
}

class CharSpeed extends Char {
  constructor(speed) {
    super("CharSpeed", "スピード", "", "", "", "black");
    this.speed = speed;
    this.paths = ["m0,0"];
  }

  updatePenPos(pos) {
    pos.speed = this.speed;
  }
}

class CharDottedLine extends Char {
  constructor() {
    super("CharDottedLine", "点線", "E8", "E", "E", "black");
  }

  setPaths() {
    this.dp = p(8, 0);
    this.paths = [
      "m0,0h1.2",
      "m2.3,0h1.2",
      "m4.5,0h1.2",
      "m6.8,0h1.2"
    ];
  }
}

class CharTofu extends Char {
  constructor(inputText) {
    super("CharTofu", "豆腐", "", "", "", "black");
  }

  setPaths() {
    this.dp = p(6, 0);
    this.paths = ["m 1,2 h 4 v -4 h -4 v 4 l 4 -4 m -4,0 l 4,4"];
  }
}

class CharText extends Char {
  constructor(inputText) {
    super("CharText", "文字列", "", "", "", "black");
    this.inputText = inputText;
  }

  createElement(pos) {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "text");
    p.style.fill = "black";
    p.style.strokeWidth = "0";
    p.style.fontFamily = "sans-serif";
    p.style.fontSize = "5";
    p.style.fontWeight = "lighter";
    p.style.whiteSpace = "pre";
    p.setAttribute("x", pos.x);
    p.setAttribute("y", pos.y + 2.5);
    p.textContent = this.inputText;
    this.updatePenPos(pos);
    return p;
  }

  updatePenPos(pos) {
    pos.x += 5 * this.inputText.length;
  }
}


class CharPoint extends Char {
  constructor() {
    super("CharPoint", "点", "P", "P", "P", "black", false, p(0.0, -0.1));
  }

  setPaths() {
    switch (this.nextHeadType) {
      case "":
        this.dp = p(0, 0.1);
        this.paths = ["m 0 0 v 0.1"];
        return;

      default:
        this.dp = p(0, 0);
        this.paths = [];
        break;
    }
  }
}


class CharDottedCircle extends Char {
  constructor() {
    super("CharDottedCircl", "まる", "C", "C", "C", "black", false, p(6.8, 0.0));
  }

  setPaths() {
    switch (this.nextHeadType) {
      default:
        this.dp = p(0, 0);
        this.paths = ["m 0 0 c 0 0.29 -0.0364 0.572 -0.1051 0.841", "m -0.4168 1.63 c -0.1371 0.249 -0.3046 0.48 -0.4977 0.686", "m -1.5662 2.858 c -0.2366 0.152 -0.4933 0.274 -0.7651 0.364", "m -3.1649 3.383 c -0.0746 0.005 -0.1499 0.007 -0.2257 0.007 c -0.2117 0 -0.4189 -0.019 -0.6198 -0.056", "m -4.8186 3.076 c -0.2586 -0.12 -0.4996 -0.272 -0.7178 -0.451", "m -6.1206 2.011 c -0.1671 -0.226 -0.3066 -0.474 -0.4138 -0.739", "m -6.7514 0.452 c -0.0197 -0.148 -0.0299 -0.299 -0.0299 -0.452 c 0 -0.134 0.0077 -0.265 0.0227 -0.395", "m -6.5563 -1.217 c 0.1027 -0.267 0.2382 -0.518 0.4015 -0.747", "m -5.5805 -2.589 c 0.2152 -0.182 0.4534 -0.338 0.7097 -0.463", "m -4.0672 -3.323 c 0.2187 -0.045 0.4449 -0.068 0.6766 -0.068 c 0.0567 0 0.113 0.001 0.169 0.004", "m -2.3873 -3.24 c 0.2741 0.085 0.5334 0.203 0.7729 0.351", "m -0.9535 -2.358 c 0.1966 0.204 0.368 0.431 0.5092 0.679", "m -0.1197 -0.897 c 0.0732 0.268 0.1144 0.549 0.1193 0.839"];
        break;
    }
  }
}


class CharSmallCircle extends Char {
  constructor() {
    super("CharSmallCircle", "小円", "C1", "C", "C", "black", false, p(1.2, 0.0));
  }

  setPaths() {
    switch (this.nextHeadType) {
      default:
        this.dp = p(0, 0);
        this.paths = ["m 0 0 c -1e-06 0.34137 -0.276739 0.61811 -0.618112 0.61811 c -0.341373 0 -0.618111 -0.27674 -0.618112 -0.61811 c 1e-06 -0.34137 0.276739 -0.61811 0.618112 -0.61811 c 0.341373 0 0.618111 0.27674 0.618112 0.61811"];
        break;
    }
  }
}

class CharSeparator extends Char {
  constructor() {
    super("CharSeparator", "", "-", "-", "-", "black", false, p(0, 0));
  }

  setPaths() {
    this.paths = [""];
    this.model = this.getNextModel();
    this.headType = this.getNextHeadType();
    this.tailType = this.getPrevTailType();
  }
}


class CharDottedVerticalLine extends Char {
  constructor() {
    super("CharDottedVerticalLine", "…↓", "S8", "S", "S", "black", false, p(0.0, 1.5));
  }

  setPaths() {
    this.dp = p(0, 3);
    this.paths = [
      "m 0 0 l 0 1",
      "m 0 -2 l 0 1",
      "m 0 -4 l 0 1",
      "m 0 -6 l 0 1",
      "m 0 2 l 0 1"
    ];
  }
}



class CharDottedLineDownRight extends Char {
  constructor() {
    super("CharDottedLineDownRight", "…↓→", "SE8", "SE", "SE", "black", false, p(0.0, -3.3));
  }

  setPaths() {
    this.dp = p(4.5886, 6.5532);
    this.paths = ["m 0 0 c 0 0 0.0803 0.1147 0.2197 0.3139", "m 0.7077 1.0107 c 0.077 0.11 0.1586 0.2266 0.2442 0.3487", "m 1.4394 2.0557 c 0.0798 0.114 0.1612 0.2303 0.2438 0.3482", "m 2.1712 3.1008 c 0.0811 0.1158 0.1624 0.232 0.2435 0.3478", "m 2.9028 4.1457 c 0.0824 0.1176 0.1636 0.2337 0.2433 0.3475", "m 3.6339 5.1898 c 0.0852 0.1216 0.1665 0.2378 0.2433 0.3474", "m 4.3652 6.2342 c 0.1417 0.2023 0.2234 0.319 0.2234 0.319"];
  }
}


class CharDottedLineDownLeft extends Char {
  constructor() {
    super("CharDottedLineDownLeft", "…↓←", "SW8", "SW", "SW", "black", false, p(2.7, -3.7));
  }

  setPaths() {
    this.dp = p(-2.73616, 7.5176);
    this.paths = ["m 0 0 c 0 0 -0.05336 0.146606 -0.145176 0.398871", "m -0.435722 1.19715 c -0.046001 0.12639 -0.094686 0.26014 -0.14557 0.39995", "m -0.871972 2.39574 c -0.04771 0.13109 -0.096351 0.26473 -0.145648 0.40016", "m -1.30842 3.59489 c -0.04842 0.13304 -0.09695 0.26636 -0.14533 0.39928", "m -1.74467 4.79348 c -0.04937 0.13565 -0.09804 0.26935 -0.1457 0.40032", "m -2.18116 5.99273 c -0.05106 0.14029 -0.09975 0.27406 -0.14555 0.39991", "m -2.61791 7.19271 c -0.07524 0.20672 -0.11825 0.32489 -0.11825 0.32489"];
  }
}

class CharDottedLineUpRight extends Char {
  constructor() {
    super("CharDottedLineUpRight", "…↑→", "NE8", "NE", "NE", "black", false, p(0.0, 3.7));
  }

  setPaths() {
    this.dp = p(2.7362, -7.5176);
    this.paths = ["m 0 0 c 0 0 0.0366 -0.1007 0.1014 -0.2788", "m 0.3922 -1.0777 c 0.0456 -0.1253 0.0943 -0.259 0.1454 -0.3995", "m 0.8281 -2.2754 c 0.0476 -0.1307 0.0962 -0.2643 0.1456 -0.3999", "m 1.2644 -3.4741 c 0.0483 -0.1327 0.0968 -0.2659 0.1452 -0.3988", "m 1.7002 -4.6713 c 0.0492 -0.1352 0.0978 -0.2688 0.1456 -0.4", "m 2.1361 -5.869 c 0.0507 -0.1393 0.0993 -0.2728 0.1453 -0.3993", "m 2.5724 -7.0677 c 0.0697 -0.1915 0.12 -0.3297 0.1453 -0.3991", "m 2.7362 -7.5176"];
  }
}

Char.dict = {
  "\u0020": CharSpace,
  "\u3000": CharSpace,
  "\u3040": CharFullWidthSpace,
  "↑": CharUp,
  "↓": CharDown,
  "←": CharLeft,
  "→": CharRight,
  "\n": CharNewline,
  "newpage": CharNewpage,
  "scroll": CharScroll,
  "scroll": CharSpeed,
  "…": CharDottedLine,
  "・": CharPoint,
  "○": CharDottedCircle,
  "。": CharSmallCircle,
  "/": CharSeparator,
  "／": CharSeparator,
  "…↓": CharDottedVerticalLine,
  "…↓→": CharDottedLineDownRight,
  "…↓←": CharDottedLineDownLeft,
  "…↑→": CharDottedLineUpRight
}

class CharBase extends Char {
  constructor(name, table) {
    super(name);
    this.table     = table;
    this.model     = this.table.model?.[name] ?? "";
    this.headType  = this.table.head?.[name] ?? "";
    this.tailType  = this.table.tail?.[name] ?? "";
    this.headModel = this.table.headModel?.[name] ?? "";
    this.tailModel = this.table.tailModel?.[name] ?? "";
    this.color     = this.table.color?.[name] ?? "black";
    this.bold      = this.table.bold?.[name] ?? false;
    this.offset.x  = this.table.offsetX?.[name] ?? 0
    this.offset.y  = this.table.offsetY?.[name] ?? 0;
    this.right     = this.table.right?.[name] ?? 0;
  }

  get prevName() {
    const name = this.table.sub?.name?.[this.name]?.['prevName'] ?? this.name;
    return this.table?.sub?.prevName?.[name]?.[this.prev?.name] ?? this.prev?.name ?? "";
  }

  get prevModel() {
    const name = this.table.sub?.name?.[this.name]?.['prevModel'] ?? this.name;
    return this.table?.sub?.prevModel?.[name]?.[this.prev?.model] ?? this.prev?.model ?? "";
  }

  get prevTailModel() {
    const name = this.table.sub?.name?.[this.name]?.['prevTailModel'] ?? this.name;
    return this.table?.sub?.prevTailModel?.[this.name]?.[this.prev?.tailModel] ?? this.prev?.tailModel ?? this.prev?.model?.replace(/.*?(\D+\d*)$/, "$1") ?? "";
;
  }

  get prevTailType() {
    const name = this.table.sub?.name?.[this.name]?.['prevTail'] ?? this.name;
    return this.table.sub?.prevTail?.[name]?.[this.prev?.tailType] ?? this.prev?.tailType ?? "";
  }

  get nextName() {
    const name = this.table.sub?.name?.[this.name]?.['nextName'] ?? this.name;
    return this.table?.sub?.nextName?.[name]?.[this.next?.name] ?? this.next?.name ?? "";
  }

  get nextModel() {
    const name = this.table.sub?.name?.[this.name]?.['nextModel'] ?? this.name;
    return this.table?.sub?.nextModel?.[this.name]?.[this.next?.model] ?? this.next?.model ?? "";
  }

  get nextHeadModel() {
    const name = this.table.sub?.name?.[this.name]?.['nextHeadModel'] ?? this.name;
    return this.table?.sub?.nextHeadModel?.[name]?.[this.next?.headModel] ?? this.next?.headModel ?? this.next?.model?.replace(/(\D+\d*).*/, "$1") ?? "";
;
  }

  get nextHeadType() {
    const name = this.table.sub?.name?.[this.name]?.['nextHeadType'] ?? this.name;
    return this.table?.sub?.nextHead?.[name]?.[this.next?.headType] ?? this.next?.headType ?? "";
  }

  * keyGen() {
    if (true) {
      yield this.n$n;
      yield this.n$m;
      yield this.n$hm;
      yield this.n$h;
      yield this.n$x;
    }

    if (true) {
      yield this.m$n;
      yield this.m$m;
      yield this.m$hm;
      yield this.m$h;
      yield this.m$x;
    }

    if (true) {
      yield this.tm$n;
      yield this.tm$m;
      yield this.tm$hm;
      yield this.tm$h;
      yield this.tm$x;
    }

    if (true) {
      yield this.t$n;
      yield this.t$m;
      yield this.t$hm;
      yield this.t$h;
      yield this.t$x;
    }

    yield this.x$n;
    yield this.x$m;
    yield this.x$hm;
    yield this.x$h;
    yield "X_X";
  }


  setPaths() {
    const names = {};
    const nameSubTable = this.table.sub?.name;
    const params = [
      'paths',
      'pathsExtra',
      'entryX',
      'entryY',
      'exitX',
      'exitY',
      'model',
      'tailType',
      'tailModel',
      'headType',
      'headModel'
    ];
    for (const param of params) {
      names[param] = nameSubTable[this.name]?.[param] ?? this.name;
    }

    for (let key of this.keyGen()) {
      key = this.table.sub?.key?.[names['paths']]?.[key] ?? key;

      if (this.table.path?.[names['paths']]?.[key]) {
        this.paths      = this.table.path?.[names['paths']]?.[key];
        this.pathsExtra = this.table.pathExtra?.[names['pathsExtra']]?.[key] ?? this.table.pathExtra?.[names['pathsExtra']]?.['X_X'] ?? "";
        this.pdp.x      = this.table.entryX?.[names['entryX']]?.[key] ?? 0;
        this.pdp.y      = this.table.entryY?.[names['entryY']]?.[key] ?? 0;
        this.dp.x       = this.table.exitX?.[names['exitX']]?.[key] ?? 0;
        this.dp.y       = this.table.exitY?.[names['exitY']]?.[key] ?? 0;
        this.model      = this.table.newModel?.[names['model']]?.[key] ?? this.model;
        this.tailType   = this.table.newTail?.[names['tailType']]?.[key] ?? this.tailType;
        this.tailModel  = this.table.newTailModel?.[names['tailModel']]?.[key] ?? this.tailModel;
        this.headType   = this.table.newHead?.[names['headType']]?.[key] ?? this.headType;
        this.headModel  = this.table.newHeadModel?.[names['headModel']]?.[key] ?? this.headModel;
        this.key        = key;
        break;
      }
    }
  }
}

