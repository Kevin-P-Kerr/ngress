var State = function (c, out, out1, lastlist) {
  this.c = c;
  this.out = out;
  this.out1 = out1;
  this.lastlist = lastlist;
};

var Frag = function (start, out) {
  this.start = start;
  this.out = out;
};

var post2nfa = function (input) {
  var frag_stack = [];
  var  p = 0;
  var nc = '';
  var len = input.length;
  for (nc = input[p]; p<len; p++) {
    if (nc === '.') {
      var e2 = frag_stack.pop();
      var e1 = frag_stack.pop();
      patch(e1.out, e2.start);
      push(new Frag(e1.start, e2.out));
    } 
    else if (nc === '|') {
      var e2 = frag_stack.pop();
      var e1 = frag_stack.pop();
      var s = new State(SPLIT, e2.out, e1.out);
      frag_stack.push(new Frag(s, append(e2.out, e1.out)));
    }
    else if (nc === '?') {
      var e = frag_stack.pop();
      var s = new State(SPLIT, e.start, null);
      frag_stack.push(new Frag(s.start, append(e.out, s.out2)));
    }
    else if (nc === '*') {
      var e = frag_stack.pop();
      var s = new State(SPLIT, e.start, null);
      patch(e.out, s);
      frag_stack.push(new Frag(s, list1(s.out1)));
    }
    else if (nc === '+') {
      var e = frag_stack.pop();
      var s = new State(SPLIT, e.start, null);

