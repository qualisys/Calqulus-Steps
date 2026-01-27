export class NumberUtil {

	/**
	 * Returns the value to the specified precision.
	 * @param value 
	 * @param precision 
	 */
	static toPrecision(value: number, precision: number): number {
		if ((!precision && precision !== 0) || precision < 0) {
			return value;
		}

		if (value == 0) {
			return parseFloat(value.toFixed(precision));
		}

		// If -1 <= value >= 1, return number with a decimal precision
		if (value >= 1 || value <= -1) {
			return parseFloat(value.toFixed(precision));
		}

		// If -1 > value < 1, return significant figures
		const d = Math.ceil(Math.log10(Math.abs(value)));
		const power = precision - d;
		const magnitude = Math.pow(10, power);
		const shifted = Math.round(value * magnitude);

		return shifted / magnitude;
	}

	/**
	 * Returns a boolean indicating if the specified argument is numeric.
	 * @param n The item to check
	 * @returns 
	 */
	static isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	/**
	 * Returns a string with the ordinal suffix, i.e., 
	 * 1 => 1st
	 * 2 => 2nd
	 * 3 => 3rd
	 * @param value
	 * @returns 
	 */
	static formatOrdinal(value: number) {
		const pluralRulesEn = new Intl.PluralRules('en', {type: 'ordinal'});
		const suffixes = {
			one: 'st',
			two: 'nd',
			few: 'rd',
			other: 'th',
		};

		const category = pluralRulesEn.select(value);
		const suffix = suffixes[category];
		return (value + suffix);
	}
}