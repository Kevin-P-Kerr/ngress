// 2 * (3 + 2)

var Op = function (symbol) {
  this.s = symbol;
  if (symbol === '|') {
    this.p = 0;
  }
  else if (symbol === '.') {
    this.p = 1;
  }
  else if (symbol === '+' || symbol === '?' || symbol === '*') {
    this.p = 2;
  }
};

var ident = function (c) {
  if (c.match(/\+|\?|\*|\.|\||\(|\)/)) {
    return false;
  }
  return true;
};

var parse_ident = function (input) {
    var id = {};
    if (input[0] === "\\") {
      input = input.slice(1);
    }
    id.parsed = input[0];
    input = input.slice(1);
    id.remaining = input;
    return id;
};

var op = function (c) {
  if (c.match(/\+|\*|\?|\.|\|/)) {
    return true;
  }
  return false;
};

var shunt = function (input) {
  var id, tmp1, tmp2, output = [], ops = [], nop, fop, out = '';
   while (input.length) {
     if (ident(input[0])) {
       id = parse_ident(input);
       input = id.remaining;
       output.push(id.parsed);
       if (input.length && (ident(input[0]) || input[0] === '(')) {
         input = '.' + input;
       }
     }
     else if (op(input[0])) {
       nop = new Op(input[0]);
       input = input.slice(1);
       if (nop.p === 2 && input.length && ident(input[0])) {
         input = '.' + input;
       }
         while (ops.length && ops[ops.length-1] !== '(' && nop.p <= ops[ops.length-1].p) {
           fop = ops.pop();
           output.push(fop.s);
         }
         ops.push(nop);
     }
     else if (input[0] === '(') {
       ops.push(input[0]);
       input = input.slice(1);
     }
     else if (input[0] === ')') {
       input = input.slice(1);
       if (input.length && ident(input[0])) {
         input = '.' + input;
       }
       while (ops.length && ops[ops.length-1] !== '(') {
        fop = ops.pop();
        output.push(fop.s);
       }
       if (!ops.length || ops[ops.length-1] !== '(') {
         console.log(ops);
         console.log(output);
         throw new Error('*** parse *** unbalanced parens');
       }
       else {
        ops.pop();
       }
     }
     else {
      throw new Error('*** parse *** unrecognized symbol');
     }
   }
   while (ops.length) {
     fop = ops.pop();
     output.push(fop.s);
   }
  while (output.length) {
    out = out + output.shift();
  }
  return out;
};

console.log(shunt("ab?"));
console.log(shunt("a((b|c)d)+e"));

exports.shunt = shunt;
