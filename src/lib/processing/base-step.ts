import { Inputs } from '../models/inputs';
import { IStepNode } from '../models/node-interface';
import { Property, PropertyType } from '../models/property';
import { Signal, SignalType } from '../models/signal';
import { ProcessingError } from '../utils/processing-error';

import { Space } from './space';

/**
 * Base class for running processing steps.
 */
export class BaseStep {
	static acceptsMissingInputs = false;

	name: string;
	space: Space;
	inputs: Signal[];

	processingWarnings: string[] = [];
	processingLogs: string[] = [];

	constructor(public node: IStepNode, public allInputs?: Inputs) {
		this.inputs = allInputs ? allInputs.main : [];

		if (this.inputs.length > 0 && this.inputs[0] !== undefined) {
			this.space = this.inputs[0].targetSpace;
		}

		this.name = this.constructor.name;

		this.init();
	}

	// Init function called after instantiation.
	init() {
		this.applySpace();
	}

	applySpace() {
		for (const input of this.inputs) {
			if (input) {
				input.convertToTargetSpace();
			}
		}
	}

	/**
	 * Gets the value of the specified property (also referred to as `option`).
	 * 
	 * This method looks up the property in the step's internal
	 * Inputs instance, where options are stored as [[Signal]] objects.
	 * 
	 * In contrast to `getPropertValue`, this method returns the retrieved
	 * Signals as is, without unpacking into primitive values.
	 * 
	 * @param key 
	 * @param expectedType 
	 * @returns the requested option's input signals
	 */
	getPropertySignalValue(key: string, expectedType: PropertyType | PropertyType[] = PropertyType.Any, required = true): Signal[] {
		const expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];

		if (this.allInputs?.options) {
			const optionSignals = this.allInputs.options.get(key);

			if (optionSignals && optionSignals.length > 0) {
				if (Property.validateSignalTypes(optionSignals, expectedTypes)) {
					return optionSignals;
				}
				else {
					// If we're expecting a number, but the signals are a series with one value, we can convert them.
					if (expectedTypes.length === 1 && expectedTypes[0] === PropertyType.Number) {
						const convertedSignals = [];
						for (const signal of optionSignals) {
							if (signal.type === SignalType.Float32) {
								convertedSignals.push(signal);
							}
							else if (signal.type === SignalType.Float32Array && signal.length === 1) {
								const value = signal.clone(signal.getValue()[0]);
								convertedSignals.push(value);
							}
						}

						if (convertedSignals.length === optionSignals.length) {
							// We could successfully convert all signals.
							return convertedSignals;
						}
					}
				}

				if (required) {
					throw new ProcessingError(`Error retrieving signals for property ${ key }. Expected all signals to match these types: [${ expectedTypes.map(t => Property.typeToString(t)).join(', ') }].`);
				}
			}
			else if (required) {
				throw new ProcessingError(`Error retrieving signals for property ${ key }`);
			}
		}
		else if (required) {
			throw new ProcessingError(`Error retrieving signals for property ${ key }, no options found.`);
		}

		return undefined;
	}

	/**
	 * Gets the value of the specified property (also referred to as `option`).
	 * 
	 * This method first tries to look up the property in the step's internal
	 * Inputs instance, where options are stored as [[Signal]] objects. If that
	 * fails it falls back to parsing the YAML node.
	 * 
	 * In contrast to `getPropertySignalValue`, this method tries to unpack the
	 * underlying signal into primitive values.
	 * 
	 * @param key 
	 * @param expectedType 
	 * @param required 
	 * @param defaultValue 
	 * @returns 
	 */
	getPropertyValue<T>(key: string, expectedType: PropertyType | PropertyType[] = PropertyType.Any, required?: boolean, defaultValue?: T): T {
		const expectedTypes = Array.isArray(expectedType) ? expectedType : [expectedType];

		try {
			const optionSignals = this.getPropertySignalValue(key, expectedType, false);
			const unpackedSignals = optionSignals.map(s => s.getValue());
			const result = expectedTypes.includes(PropertyType.Array) || unpackedSignals.length > 1 ? unpackedSignals : unpackedSignals[0];
			
			if (result === undefined) throw 'Try property value';
			
			return result as unknown as T;
		}
		catch (e) {
			return this.node.getPropertyValue<T>(key, expectedTypes, required, defaultValue);
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static prepareNode(node: IStepNode) {
		return;
	}

	// Abstract
	async process(): Promise<Signal> {
		return Promise.reject(new Error('The process function cannot be called on the Step base class.'));
	}
}