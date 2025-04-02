import { StepRegistry } from '../step-registry';
import { markdownFmt } from '../utils/template-literal-tags';

// Register global step options
StepRegistry.globalStepDocs = {
	description: markdownFmt`
		A step node takes an input and some options and outputs a value.
	`,
	// Options that are available for all steps:
	options: [{
		name: 'export',
		type: 'String',
		required: false,
		default: 'undefined',
		description: markdownFmt`
			If this option is set, the result of this step will be exposed 
			on the global scope, as well as being exported to the resulting 
			JSON file.

			The value of this option will be the name of the exported data 
			and can be used to load the resulting data in other steps.
		`,
	}, {
		name: 'output',
		type: 'String',
		required: false,
		default: 'undefined',
		description: markdownFmt`
			If this option is set, the result of this step will be exposed 
			on the local scope.

			The value of this option will be the name of the output data 
			and can be used to load the resulting data in other steps 
			_within the same output node_.
			
			You can also use the short-form "arrow syntax" to define 
			an output.
		`,
	}, {
		name: 'set',
		type: 'String',
		required: false,
		default: 'null',
		description: markdownFmt`
			Used to specify which _set_ the exported parameter will use. 
			In most cases, this will be either ''left'' or ''right''.

			This option is only used in two cases; where there is also 
			an ''export'' option set, or on the last step in a list. 
			In the latter case, the step's ''set'' is used only if 
			there's no ''set'' defined on the parent output node.
			
			If this option is not set, the JSON output will use set: null.
		`,
	}, {
		name: 'space',
		type: 'Space',
		required: false,
		default: 'null',
		description: markdownFmt`
			This option lets you reference a space where you want the input 
			data for the step to be translated into.

			All named inputs will automatically be converted.
			
			**_NOTE:_** _This is **not yet implemented** for segments._
		`,
	}]
};

// Angle
export * from './angle';

// Aggregation
export * from './aggregation';
export * from './rms';

// Arithmetic
export * from './arithmetic';

// Geometry
export * from './distance';
export * from './unit-vector';
export * from './plane';
export * from './project';

// Algorithms
export * from './algorithms/abs';
export * from './algorithms/convert';
export * from './algorithms/derivative';
export * from './algorithms/diff';
export * from './algorithms/filter';
export * from './algorithms/gap-fill';
export * from './algorithms/negate';
export * from './algorithms/power';
export * from './algorithms/root';
export * from './algorithms/round';
export * from './algorithms/trigonometry';
export * from './algorithms/integral';
export * from './dot-product';
export * from './cumulative-distance';

// Logic
export * from './logic';

// Imports
export * from './imports/event';
export * from './imports/generic-import';
export * from './imports/marker';
export * from './imports/segment';

// Events
export * from './events/event-duration';
export * from './events/event-mask';
export * from './events/event-time';
export * from './events/peak-finder';
export * from './events/refine-event';
export * from './events/threshold';

// Data structures
export * from './concatenate';
export * from './vector';
