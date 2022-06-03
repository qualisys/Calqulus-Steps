import { Signal, SignalType } from './signal';

/**
 * Available types for YAML property values.
 */
export enum PropertyType {
	Boolean,
	String,
	Number,
	Array,
	Map,
	Duration,
	Any,
}

export class Property {
	/**
	 * Returns a string version of the given [[PropertyType]].
	 * @param type 
	 */
	static typeToString(type: PropertyType): string {
		switch (type) {
			case PropertyType.Boolean:
				return 'Boolean';
			case PropertyType.String:
				return 'String';
			case PropertyType.Number:
				return 'Number';
			case PropertyType.Array:
				return 'Array';
			case PropertyType.Map:
				return 'Map';
			case PropertyType.Duration:
				return 'Duration';
			case PropertyType.Any:
				return 'Any';
			default:
				return 'Invalid type';
		}
	}

	/**
	 * Returns true if the specified [[SignalType]] corresponds to any of the
	 * given [[PropertyType]], false otherwise.
	 * @param signalType 
	 * @param propertyTypes 
	 */
	static validateSignalType(signalType: SignalType, propertyTypes: PropertyType | PropertyType[]): boolean {
		const validPropertyTypes = Array.isArray(propertyTypes) ? propertyTypes : [propertyTypes];

		if (validPropertyTypes.includes(PropertyType.Any)) {
			return true;
		}

		const signalTypeToPropertyType = {};

		signalTypeToPropertyType[SignalType.Float32] = PropertyType.Number;
		signalTypeToPropertyType[SignalType.Float32Array] = PropertyType.Array;
		signalTypeToPropertyType[SignalType.Float32ArrayArray] = PropertyType.Array;
		signalTypeToPropertyType[SignalType.String] = PropertyType.String;
		signalTypeToPropertyType[SignalType.Uint32Array] = PropertyType.Array;

		let valid = false;

		for (const propertyType of validPropertyTypes) {
			if (signalTypeToPropertyType[signalType] && signalTypeToPropertyType[signalType] === propertyType) {
				valid = true;
				break;
			}
		}

		return valid;
	}

	/**
	 * Returns true if all specified signals corresponds to any of the given
	 * property types, false otherwise.
	 * @param signals 
	 * @param propertyTypes 
	 */
	static validateSignalTypes(signals: Signal[], propertyTypes: PropertyType | PropertyType[]): boolean {
		for (const signal of signals) {
			if (!Property.validateSignalType(signal.type, propertyTypes)) {
				return false;
			}
		}

		return true;
	}
}