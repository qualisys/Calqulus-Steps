import { NumberUtil } from './number';

/**
 * Parses a logical expression and returns a list of operands. If the expression
 * does not contain any operators it returns an empty array.
 * @param exp The expression to parse.
 * @returns 
 */
export const parseExpressionOperands = (exp: string) => {
	const logicalOperators = ['!', '<', '>', '<=', '>=', '==', '!=', '&&', '\\|\\|'];
	const regexOperators = [];

	for (const op of logicalOperators) {
		regexOperators.push('(?:[\\w\\s]' + op + '[\\w\\s])');
	}

	const regexpStr = regexOperators.join('|');
	const regexp = new RegExp(regexpStr);

	if (exp.match(regexp)) {
		const result = exp.replace(/[()]/g, '').split(regexp).map(v => NumberUtil.isNumeric(v) ? parseFloat(v) : v);

		return result;
	}
	else {
		return [];
	}
};