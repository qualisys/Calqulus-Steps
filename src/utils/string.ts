export class StringUtil {
	/**
	 * Parses a string literal on the format $'string' or $"string".
	 * The string can contain escaped quotes, e.g. $'He said, \\'Hello world\\''.
	 * @param value The string to parse.
	 * @returns The parsed string or false if the format is invalid.
	 */
	static parseStringLiteral(value: string): string | false {
		if (!value) {
			return false;
		}

		if (typeof value !== 'string') {
			return false;
		}

		const pattern = /^\s*\$(["'])((?:\\.|(?!\1).)*)\1\s*$/;
		const match = value.match(pattern);

		if (match?.length === 3) {
			// Unescape quotes
			const value = match[2].replace(/\\(['"])/g, '$1');
			return value;
		}

		return false;
	}
}