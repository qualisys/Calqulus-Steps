import * as base64 from 'base-64';

import { NumberUtil } from './number';

export interface IExpressionOperand {
	originalValue: string | number;
	value: string | number;
	isInverted: boolean;
	exists: boolean;
	empty: boolean;
}

/**
 * Parses a logical expression and returns a list of operands. If the expression
 * does not contain any operators it returns an empty array.
 * @param exp The expression to parse.
 * @returns 
 */
export const parseExpressionOperands = (exp: string): { operands: IExpressionOperand[], expression: string } => {
	// Remove any excess whitespace from the expression.
	exp = exp.replace(/\s+/g, ' ');
	exp = exp.trim();

	if (!exp) return { operands: [], expression: exp };

	if (/=>/.test(exp)) {
		// The expression contains an output.
		// This cannot be parsed as an expression.
		return { operands: [], expression: exp };
	}

	// Define the logical operators that we want to match.
	const logicalOperators = [
		'<=', 
		'>=', 
		'==', 
		'!=', 
		'&&', 
		'\\|\\|',
		// The following must be ordered after the others to avoid 
		// matching parts of the above operators.
		// '!', 
		'<', 
		'>', 
	];

	// Create a regular expression that matches any of the operators.
	const regexOperators = [];
	for (const op of logicalOperators) {
		regexOperators.push('(?:[\\s]*' + op + '[\\s]*)');
	}

	const functionPattern = /^!*?[^\w!]*(!*)(empty|exists|\$field|\$prev)\(([^)]+\))\)*$/gi;

	const regexpStr = regexOperators.join('|');
	const regexp = new RegExp(regexpStr);

	const result: IExpressionOperand[] = exp
		// Split the expression by the operators.
		.split(regexp)
		// Remove any empty or undefined values.
		.filter(v => v !== undefined && v !== '')
		// Parse any numeric values as floats.
		// Check if the expression is inverted.
		// Package the result in an object.
		.map(v => v.trim())
		// Extract any function calls (empty and exists)
		// or variables, that are using parenthesis as part
		// of their syntax.
		// Encode them in a way that avoids parenthesis (b64).
		.map(v => {
			functionPattern.lastIndex = 0;
			const functionMatches = functionPattern.exec(v);

			if (functionMatches && functionMatches.length === 4) {
				const [_, exclamationMarks, functionName, signal] = functionMatches;
				let cleanedSignal = signal;

				if (signal.indexOf('(') > -1) {
					cleanedSignal = signal;
				}
				else {
					cleanedSignal = signal.replace(/[)]/g, '');
				}

				const formattedString = `${ exclamationMarks }${ functionName }(${ cleanedSignal })`;
				return '$$B64$$' + base64.encode(formattedString);
			}

			return v;
		})
		// Remove any parentheses.
		// Also remove any exclamation marks 
		// that are adjacent to parentheses.
		.map(v => v.replace(/!?[()]/g, ''))
		.map((v, index) => {
			if (NumberUtil.isNumeric(v)) {
				return {
					originalValue: parseFloat(v),
					value: parseFloat(v),
					isInverted: false,
					empty: false,
					exists: false,
				};
			}

			v = v.trim();

			// Decode any encoded function calls.
			if (v.startsWith('$$B64$$')) {
				v = base64.decode(v.substring(7));
			}

			v = v.trim();

			// Replace extraneous exclamation marks (since two 
			// exclamation marks cancels out).
			v = v.replace(/!!/g, '');

			const isInverted = v.startsWith('!');

			if (isInverted) {
				v = v.substring(1).trim();
			}

			// Detect encoded function calls.
			let empty = v.startsWith('empty(');
			let exists = v.startsWith('exists(');

			// Clean up function calls from the expression.
			const functionMatches = v.match(/^(empty|exists)\((.*)\)$/);

			if (functionMatches && functionMatches.length === 3) {
				v = functionMatches[2];
				empty = functionMatches[1] === 'empty';
				exists = functionMatches[1] === 'exists';
			}

			const originalValue = v;

			// Clean up field calls from the expression.
			const fieldMatches = v.match(/^\$field\((.*)\)$/);

			if (fieldMatches && fieldMatches.length === 2) {
				v = '$field_' + fieldMatches[1].split(',').join('_');
			}

			// Clean up $prev calls from the expression.
			const prevMatches = v.match(/^\$prev\((.*)\)$/);

			if (prevMatches && prevMatches.length === 2) {
				v = '$prev_' + prevMatches[1].split(',').join('_');
			}

			// Remove any whitespace from the operands.
			if (/\s/.test(v)) {
				v = v.replace(/\s/g, '');
				v = 'operand_' + index + '_' + v;
			}

			// Remove any quotes from the operands.
			v = v.replace(/['"]/g, '');

			return {
				originalValue: originalValue,
				value: v,
				isInverted: isInverted,
				exists: exists,
				empty: empty,
			};
		})
	;

	// Clean up function calls from the expression.
	const functionCleanPattern = /(!*)(empty|exists)\((.*?)\)/gi;
	exp = exp.replace(functionCleanPattern, '$1$3');

	// Replace the operands in the expression with their encoded values.
	for (const operand of result) {
		if (typeof operand.value === 'number') continue;
		if (typeof operand.originalValue === 'number') continue;
		if (operand.originalValue === operand.value) continue;

		exp = exp.replace(operand.originalValue, operand.value);
	}

	return {
		operands: result,
		expression: exp,
	};
};