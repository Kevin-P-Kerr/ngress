     // regex := <branch>{<branch>}...
     // branch := <factor> {'|' <regex> }
     // factor := <single> | ( <regex> ) {repitition}
     // single := <identifier>{<repition>}
     // identifer := <valid_identifer> | <escaped char>
     // valid_identifer := [A-Za-z0-9!@#$%^&.,<>;:"'[]{}=-~`]
     // escaped_char := \{<any char>}
     // repitition := [?+*|]

var in2post = function (input) {

	var Operator = function (symbol) {
		this.symbol = symbol;
	
		if (symbol === '?' || symbol === '*' || symbol === '+') {
			this.precedence = 2;
		}
		else if (symbol === '.') {
			this.precedence = 1;
		}
		else if (symbol === '|') {
			this.precdence = 0;
		}
		else if (symbol === '(') {
			this.precedence = 3;
		}
		else {
			throw new Error('*** Operator *** invalid operator: ' + symbol);
		}
		return this;
	};
	
	var shunt = function (input) {
		var output = [];
		var operators = [];
		var id, tmp1, tmp2, op, out = '';

		while (input.length) {
			if (ident(input[0])) {
				id = parse_ident(input);
				input = id.remaining;
				output.push(id.parsed);
				if (input.length && (ident(input[0]) || input[0] === '(')) {
					input = '.'+input;
				}
			}
			else if (operator(input[0])) {
				op = new Operator(input[0]);
				input = input.slice(1);
				while (operators.length && op.precedence <= operators[operators.length-1].precedence) {
					tmp1 = operators.pop();
					output.push(tmp1.symbol);
				}
				operators.push(op);
			}
			else if (input[0] === '(') {
				operators.push(new Operator(input[0]));
				input = input.slice(1);
			}
			else if (input[0] === ')') {
				input = input.slice(1);
				while (operators.length && operators[operators.length-1].symbol !== '(') {
					tmp1 = operators.pop()
					output.push(tmp1.symbol);
				}
				if (!operators.length ||operators[operators.length-1].symbol === '(') {
					operators.pop();
				}
				else {
					throw new Error('*** shunt *** unbalanced parens: ' + input);
				}
			}
			else {
				throw new Error('*** bad parse***: ' + input);
			}
		}
		while (operators.length) {
			tmp1 = operators.pop();
			output.push(tmp1.symbol);
		}
		while (output.length) {
			tmp1 = output.shift();
			out += tmp1;
		}
		return out;
	};

	var ident = function(c) {
		if (c.match(/\?|\*|\+|\||\(|\)/) || c === '.') {
			return false;
		}
		return true;
	};

	var parse_ident = function (input) {
		var id = {};
		if (input[0] === '\\') {
			input = input.slice(1);
			id.parsed = input[0];
			input = input.slice(1);
			id.remaining = input;
		}
		else {
			id.parsed = input[0];
			input = input.slice(1);
			id.remaining = input;
		}
		return id;
	};

	var operator = function (c) {
		if (c.match(/\*|\+|\?|\|/) || c === '.') {
			return true;
		}
		return false;
	};

	return shunt(input);
};


console.log(in2post("a(bb)+a"))// "abb.+.a.");
console.log(in2post("a|(bb)+") === "abb.+|");
console.log(in2post("a\\?") === "a\\?.");
console.log(in2post("a(bb(dd)+)+gf+") === "abb.dd.+.+.g.f+.");
console.log(in2post("a?|ab*") === "a?ab*.|");
console.log(in2post("a?|(ab*)") === "a?ab*.|");
console.log(in2post("a(df)+|g") === "adf.+.g|");
console.log(in2post("a") ===  "a");
console.log(in2post("ab") === "ab.");
console.log(in2post("a|b") === "ab|");
console.log(in2post("abba") === "abba...");
console.log(in2post("ab?|bb+")  === "ab?.bb+.|");
