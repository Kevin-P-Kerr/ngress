var pre2post = function (input) {
     // regex := <branch>{<branch}>...
     // branch := {<factor> {|<factor>}} | { <factor> '|' <factor> }
     // factor := <single> | ( <branch> ) {repitition}
     // single := <identifier>{<repition>}
     // identifer := <valid_identifer> | <escaped char>
     // valid_identifer := [A-Za-z0-9!@#$%^&.,<>;:"'[]{}=-~`]
     // escaped_char := \{<any char>}
     // repitition := [?+*|]
     //
     var reverse = function (arr) {
       var ret_arr = [];
       var len = arr.length;
       while (len--) {
        ret_arr.push(arr[len]);
       }
       return ret_arr;
     };

     var parse_regex = function (exp) {
       var parsed_regex = '';
       var tmp;
       while ((tmp = parse_branch(exp)) && tmp.remaining !== 'EOF') {
        parsed_regex += tmp.parsed;
        exp = tmp.remaining;
       }
      return parsed_regex;
     };

   // move this
  var put_together = function (factors) {
     while (factors.length > 1) {
       var tmp1 = factors.shift();
       var tmp2 = factors.shift();
       if (tmp2 === '|') {
         var tmp2 = put_together(factors);
         factors.unshift(tmp1 + tmp2 + '|');
       }
       else {
         factors.unshift(tmp1 + tmp2 + '.');
       }
     }
     return factors.pop();
   };

   var parse_branch = function (exp) {
     if (!exp.length) {
       return {remaining : 'EOF'};
     }
     var tmp;
     var factors = [];
     var nc = 0;
     while ((tmp = parse_factor(exp)) && tmp.remaining !== 'EOF') {
      factors.push(tmp.parsed);
      exp = tmp.remaining;
      if (exp[0] === '|') {
        factors.push('|');
        exp = exp.slice(1);
      }
     }
     //factors = reverse(factors);
     var parsed_branch = put_together(factors)
     if (tmp._remaining) {
       exp = tmp._remaining;
     }
     return {parsed: parsed_branch, remaining: exp};
   };

  var parse_factor = function (exp) {
    var nc = 0;

    if (exp[nc] === '(') {
      var branch = parse_branch(exp.slice(1));
      exp = branch.remaining;
      if (repitition(exp[nc])) {
        branch.parsed = branch.parsed += exp[nc];
        branch.remaining = branch.remaining.slice(1);
      }
      return branch;
    }
    if (exp[nc]  === ')') {
      exp = exp.slice(1);
      return {remaining : 'EOF', _remaining : exp.length ? exp : 'EOF'}
    }
   if (exp.length) {
     var single = parse_single(exp);
     return single;
   }
   return {parsed : '', remaining : 'EOF'};
  };

  var parse_single = function (exp) {
    if (!identifier(exp)) {
      throw new Error('*** parse *** not a valid identifier: ' + exp[0]);
    }
    else {
      var ident = parse_ident(exp);
      exp = ident.remaining;
      if (exp[0]) {
        if (repitition(exp[0])) {
          return {parsed : ident.parsed+exp[0], remaining : exp.slice(1)};
        }
      }
      return {parsed : ident.parsed, remaining : exp}
    }
  };

  var identifier = function (exp) {
    if (valid_identifier(exp[0]) || escaped_char(exp[0])) {
      return true;
    }
    return false;
  };

  var valid_identifier = function (c) {
    if (c.match(/[A-Za-z0-9]/)) {
      return true;
    }
    if (c === '!' || c === '@') {
      return true;
    }
    if (c === '#' || c === '$') {
      return true;
    }
    if (c === '$' || c === '%') {
      return true;
    }
    if (c === '^' || c === '&') {
      return true;
    }
    if (c === '.' || c === ',') {
      return true;
    }
    if (c === '<' || c === '>') {
      return true;
    }
    if (c === ';' || c === ':') {
      return true;
    }
    if (c === '"' || c === "'") {
      return true;
    }
    if (c === '[' || c === ']') {
      return true;
    }
    if (c === '{' || c === '}') {
      return true;
    }
    if (c === '=' || c === '~') {
      return true;
    }
    if (c === '`') {
      return true;
    }
    return false;
  };

  var escaped_char = function (c) {
    return c === '\\';
  };

  var parse_ident = function (exp) {
    if (valid_identifier(exp[0])) {
      return {parsed : exp[0], remaining : exp.slice(1)};
    }
    if (escaped_char(exp[0])) {
      return {parsed : '\\'+exp[1], remaining : exp.slice(2)};
    }
    throw new Error('*** parse *** not a valid ident: ' + exp);
  };

  var repitition = function (c) {
    if (c === '*' || c === '+' || c === '?') {
      return true;
    }
    return false;
  };

  return parse_regex(input);

};

console.log(pre2post("a(bb)+a") === "abb.+.a.");
console.log(pre2post("a|(bb)+") === "abb.+|");
console.log(pre2post("a\\?") === "a\\?.");
console.log(pre2post("a(bb(dd)+)+gf+") === "abb.dd.+.+.g.f+.");
console.log(pre2post("a?|ab*") === "a?ab*.|");
console.log(pre2post("a(df)+|g") === "adf.+.g|");
console.log(pre2post("a") === "a");
console.log(pre2post("ab") === "ab.");
console.log(pre2post("a|b") === "ab|");
console.log(pre2post("abba") === "ab.b.a.");
console.log(pre2post("ab?|bb+")  === "ab?.bb+.|");

exports.in2post = pre2post;
