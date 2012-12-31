var pre2post = function (input) {
     // regex := <branch>{<branch>}...
     // branch := <factor> {'|' <regex> }
     // factor := <single> | ( <regex> ) {repitition}
     // single := <identifier>{<repition>}
     // identifer := <valid_identifer> | <escaped char>
     // valid_identifer := [A-Za-z0-9!@#$%^&.,<>;:"'[]{}=-~`]
     // escaped_char := \{<any char>}
     // repitition := [?+*|]
	
	var parse_regex = function(input) {
		var branch;
		var branches = [];
	
		while ((branch = parse_branch(input)).remaining) {
			branches.push(branch.parsed);
			input = branch.remaining;
			if (input[0] === ')') { // end of input
				input = input.slice(1);
				branch.remaining = input;
				branch.parsed = undefined; // it's already been pushed /HACK
				break;
			}
		}
		if (branch.parsed && !branch.remaining) {
			branches.push(branch.parsed);
		}
		return {parsed: assemble_branches(branches), remaining : branch.remaining}
	};

	var assemble_branches = function(branches) {
		while (branches.length > 1) {
			var b1 = branches.shift();
			var b2 = branches.shift();
			branches.unshift(b1+b2+'.');
		}
		return branches[0];
	};

	var parse_branch = function(input) {
		var factor1 = parse_factor(input);
		
		input = factor1.remaining;
		var ret;
		if (input && input[0] === '|') {
			var right_regex = parse_regex(input.slice(1));
			var disj = assemble_disj(factor1.parsed, right_regex.parsed);
			ret =  {parsed : disj, remaining : right_regex.remaining}
		}
		else {
			ret = factor1;
		}
		return ret;
	};

	var assemble_disj = function (right, left) {
		return right+left+'|';
	};

	var parse_factor = function(input) {
		var ret;
		if (input[0] === '(') {
			input = input.slice(1);
			if (!input) {
				throw new Error('*** parse_factor*** there was an error in input: ' + input);
			}
			var regex2 = parse_regex(input);
			if (repitition(regex2.remaining[0])) {
				regex2.parsed += regex2.remaining[0];
				regex2.remaining = regex2.remaining.slice(1);
			}
			ret = regex2;
		}
		else if (input[0] === ')') {
			input = input.slice(1);
			ret = {};
			if (!input) {
				ret.parsed = '';
				ret.remaining = undefined;
			}
		}
		else {
			var single = parse_single(input);
			ret = single;
		}
		return ret;
	};

	var repitition = function (c) {
		if (c === '*' || c === '?' || c === '+') {
			return true;
		}
		return false;
	};

	var parse_single = function (input) {
		var ret = {};
		if (valid_identifier(input[0])) {
			var single = input[0];
			input = input.slice(1);
			if (!input) {
				ret.remaining = undefined;
			}
			else if (repitition(input[0])) {
				single += input[0];
				input = input.slice(1);
				if (!input) {
					ret.remaining = undefined;
				}
				else {
					ret.remaining = input;
				}
			}
			else {
				ret.remaining = input;
			}
			ret.parsed = single;
		}
		else if (escaped_char(input[0])) {
			input = input.slice(1);
			if (!input) {
				throw new Error('*** parse single *** expecting escaped char: got EOF');
			}
			var single = '\\' + input[0];
			input = input.slice(1);
			if (!input) {
				ret.remaining = undefined;
			}
			else if (repitition(input[0])) {
				single += input[0];
				input = input.slice(1);
				if (!input) {
					ret.remaining = undefined;
				}
				else {
					ret.remaining = input;
				}
			}
			else {
				ret.remaining = input;
			}
			ret.parsed = single;
		}
		else {
			throw new Error('*** parse single *** neither a valid identifier nor an escaped character: ' + input);
		}
		return ret;
	};

	var valid_identifier = function (c) {
		if (c.match(/\+|\*|\?|\(|\)|\\/)) {
			return false;
		}
		return true;
	};

	var escaped_char = function (c) {
		if (c  === "\\") {
			return true;
		}
		return false;
	};

	return parse_regex(input).parsed;
};

console.log(pre2post("a(bb)+a") === "abb.+.a.");
console.log(pre2post("a|(bb)+") === "abb.+|");
console.log(pre2post("a\\?") === "a\\?.");
console.log(pre2post("a(bb(dd)+)+gf+") === "abb.dd.+.+.g.f+.");
console.log(pre2post("a?|ab*") === "a?ab*.|");
console.log(pre2post("a?|(ab*)") === "a?ab*.|");
console.log(pre2post("a(df)+|g") === "adf.+.g|");
console.log(pre2post("a") ===  "a");
console.log(pre2post("ab") === "ab.");
console.log(pre2post("a|b") === "ab|");
console.log(pre2post("abba") === "abba...");
console.log(pre2post("ab?|bb+")  === "ab?.bb+.|");

exports.in2post = pre2post;
