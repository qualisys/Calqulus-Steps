import Qty from "js-quantities";

export class ConvertUtil {
	/**
	 * Returns a converter function.
	 * 
	 * @see http://gentooboontoo.github.io/js-quantities/
	 * 
	 * @param fromUnit 
	 * @param toUnit 
	 */
	static getConverter(fromUnit: string, toUnit: string): Qty.Converter {
		fromUnit = ConvertUtil.sanitizeUnit(fromUnit);
		toUnit   = ConvertUtil.sanitizeUnit(toUnit);

		return Qty.swiftConverter(fromUnit, toUnit);
	}

	/**
	 * Converts a unit from display units to a format that is
	 * compatible with js-quantities.
	 * @param unit 
	 */
	static sanitizeUnit(unit: string): string {
		if (!unit) return unit;

		unit = unit.trim();

		switch (unit) {
			case '°':
				unit = 'deg';
				break;
			case '°C':
				unit = 'degC';
				break;
			case '%':
				unit = 'percent';
				break;
		}

		// Replace superscript characters
		const superscriptMap = [
			['²', '2'],
			['³', '3'],
		];

		for (const sup of superscriptMap) {
			unit = unit.replace(sup[0], '^' + sup[1]);
		}

		return unit;
	}
}