import { Inputs } from '../lib/models/inputs';
import { IStepNode } from '../lib/models/node-interface';
import { PropertyType } from '../lib/models/property';
import { Signal } from '../lib/models/signal';
import { BaseStep } from '../lib/processing/base-step';
import { StepRegistry } from '../lib/step-registry';
import { InputDuration } from '../lib/utils/input-duration';
import { TypeCheck } from '../lib/utils/type-check';

/**
 * Shorthand for creating a Float32Array. All arguments will 
 * be included in the generated array.
 * @param arr 
 */
export const f32 = (...arr: number[]) => Float32Array.from(arr);

/**
 * Shorthand for creating a Uint32Array. All arguments will 
 * be included in the generated array.
 * @param arr 
 */
export const i32 = (...arr: number[]) => Uint32Array.from(arr);

/**
 * Instantiates a specified step class by passing in data
 * emulated as if they had been read by the YAML node
 * parsers.
 * 
 * If the inputs is a key-value pair object, the keys is
 * used as the original name for the inputs. Otherwise,
 * names are automatically generated.
 * 
 * Options whose value is a Signal array are provided using
 * the Inputs object, as in real-world usage.
 * 
 * @param stepClass The step class to instantiate
 * @param inputs Primary inputs (as an array or as a key-value pair object)
 * @param options The options to populate for the step (as a key-value pair object, where the key is the option name and the value is a Signal array or any value.)
 * @param originalInputString The original string used for the input. This property is used by the IfStep to get the original input string after the expression has been broken down into imports.
 */
export const mockStep = <S extends BaseStep>(stepClass: { new (node: IStepNode, allInputs?: Inputs): S }, inputs: Signal[] | { [id: string]: Signal } = [], options?: { [id: string]: Signal[] | unknown }, originalInputString?: string): S => {
	// Isolate just the import signals (if it is an object).
	const inputSignals = Array.isArray(inputs) ? inputs : Object.values(inputs);
	// Get the input names or generate new ones if none was provided.
	const inputNames = Array.isArray(inputs) ? inputs.map((_, i) => 'Input ' + (i + 1)) : Object.keys(inputs);

	const stepAcceptsMissingInputs = (stepClass as unknown as typeof BaseStep).acceptsMissingInputs;
	
	// Find options whose value is an array of Signals, then create a Map.
	// These are used to mock the `Inputs` object for the step class.
	const optionSignals = Object
		.entries(options || {})
		.map(entry => (Array.isArray(entry[1]) && entry[1][0] instanceof Signal) ? entry : [entry[0], [(!stepAcceptsMissingInputs || (entry[1] !== undefined && entry[1][0] !== undefined)) ? new Signal(entry[1]) : undefined]]) as [string, Signal[]][]
	;
	const optionSignalsMap = new Map(optionSignals);

	// Generate a new map but where the keys are filtered so that only the first
	// part of a multi-level accessor name is used. For example:
	// 'abc.def' => 'abc'
	const optionSignalsMapFiltered = new Map(
		optionSignals.map(entry => { 
			// For multi-level accessors, only store the first level.
			entry[0] = entry[0].split('.')[0];
			return entry;
		})
	);

	// Make a Map out of options that are primitives (not an array of Signals).
	// These are used to mock the `getPropertyValue` of the node.
	const optionValues = Object
		.entries(options || {})
		.filter(entry => !(Array.isArray(entry[1]) && entry[1][0] instanceof Signal)) as [string, unknown][]
	;
	const optionValuesMap = new Map(optionValues);

	const optionValuesMapFiltered = new Map(
		optionValues.map(entry => { 
			// For multi-level accessors, only store the first level.
			entry[0] = entry[0].split('.')[0];
			return entry;
		})
	);
	
	// Prepare the Inputs class.
	const inpSignals = new Inputs(
		inputSignals, // Inputs
		optionSignalsMap // Options
	);

	// Find the node name by looking for the step class in the StepRegistry.
	const stepEntry = [...StepRegistry.steps.entries()].find((stepEntry) => stepEntry[1] as unknown === stepClass);
	const stepName = (stepEntry) ? stepEntry[0] : 'unknown';

	// Define a mock StepNode implementation.
	const node: IStepNode = {
		node: undefined,
		name: stepName,
		set: undefined,
		in: inputNames,
		out: undefined,
		mainInputs: inputNames,
		exp: undefined,
		space: undefined,
		originalInputString,
		
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		getProperty: (name: string) => undefined,
		getPropertyValue: <T>(key: string, expectedTypes: PropertyType | PropertyType[], required?: boolean, defaultValue?: T): T => {
			if (!optionValuesMap.has(key) && required) {
				// TODO: Throw error, required parameter missing
			}
			
			if (!optionValuesMap.has(key)) return defaultValue || undefined;

			if (!Array.isArray(expectedTypes)) {
				expectedTypes = [expectedTypes];
			}

			const value = optionValuesMap.get(key);
			const propertyType = propertyTypeFromPrimitive(value);

			if (!expectedTypes.includes(PropertyType.Any)) {
				if (!expectedTypes.includes(propertyType)) {
					// TODO: log type error.
				}
			}
			
			// Handle duration type
			if (expectedTypes.includes(PropertyType.Duration) && (typeof value === 'string' || typeof value === 'number')) {
				const inpDuration = new InputDuration(value);

				if (inpDuration.isValidDuration()) return inpDuration as unknown as T;

				if (expectedTypes.length === 1) return defaultValue || undefined;
			}

			return value as unknown as T;
		},
		hasProperty: (name: string) => {
			return optionSignalsMapFiltered.has(name) || optionValuesMapFiltered.has(name);
		},
	};

	(stepClass as unknown as typeof BaseStep).prepareNode(node);

	return new stepClass(node, inpSignals);
};

/**
 * Performs similar type checking as when reading YAML properties, 
 * but with JS primitives instead.
 * @param value 
 */
const propertyTypeFromPrimitive = (value): PropertyType => {
	if (TypeCheck.isArrayLike(value)) return PropertyType.Array;

	switch (typeof value) {
		case 'number': return PropertyType.Number;
		case 'string': return PropertyType.String;
		case 'boolean': return PropertyType.Boolean;
		case 'object': return PropertyType.Map;
	}

	return undefined;
};