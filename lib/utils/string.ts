export class StringUtil {
	static parseStringLiteral(value: string): string | false {
		if (!value) {
			return false;
		}

		if (typeof value !== 'string') {
			return false;
		}

		const pattern = /^\s*(["'])((?:\\.|(?!\1).)*)\1\s*$/;
		const match = value.match(pattern);

		if (match?.length === 3) {
			// Unescape quotes
			const value = match[2].replace(/\\(['"])/g, '$1');
			return value;
		}

		return false;
	}
}