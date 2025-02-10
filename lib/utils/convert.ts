import Qty from 'js-quantities';
import { startCase } from 'lodash';

export class ConvertUtil {
	static unitReplacements = {
		'°': 'deg',
		'°C': 'degC',
		'%': 'percent',
	};
	
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

		// Replace unit replacements
		if (unit in ConvertUtil.unitReplacements) {
			unit = ConvertUtil.unitReplacements[unit];
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

	static unitsDocMD()	{
		let doc = '';
		const kinds = Qty.getKinds();
		kinds.sort();

		for (const kind of kinds) {
			const units = Qty.getUnits(kind);
			units.sort();

			if (units.length === 0) continue;

			doc += `### ${ startCase(kind) }\n\n`;
			doc += '| Unit | Aliases |\n';
			doc += '|------|------|\n';

			for (const unit of units) {
				const aliases = Qty
					.getAliases(unit)
					// Remove the unit itself from the aliases
					.filter(v => v !== unit);
				;
				
				for (const replacement in ConvertUtil.unitReplacements) {
					const searchValue = ConvertUtil.unitReplacements[replacement];
					if (unit === searchValue || aliases.includes(searchValue)) {
						aliases.unshift(replacement);
					}
				}

				doc += `| \`${ unit }\` | ${ aliases.map(v => '`' + v + '`').join(', ') } |\n`;
			}

			doc += '\n';
		}

		return doc;
	}
}
