const remMarkdown = require('remove-markdown');

const stripMarkdown = (text) => {
	text = remMarkdown(text);

	// Remove single new lines
	text = text.replace(/([^\n])\n([^\n*-\d])/g, '$1 $2');

	return text;
}

/**
 * Render JSON Schema for a Step (main property) 
 * or a step option property.
 * 
 * @param {*} option - Step or option to render
 * @param {*} title  - Title to use for the step / option
 */
const renderStepProperty = (option, title) => {
	const output = {
		title: title,
		description: stripMarkdown(option.description),
		additionalProperties: false,
	};

	if (option.inputs) {
		output.type = ['string', 'array', 'null'];
	}

	if (option.type) {
		// Automatically map supported typed from the documentation
		// to the corresponding JSON/YAML types.

		// Strings are always supported.
		let types = ['string']; 
		let optionTypes = (Array.isArray(option.type)) ? option.type : [option.type];

		for (const type of optionTypes) {
			switch (type.toLowerCase()) {
				case 'space': 
				case 'string': // We already expect strings
					break;
				case 'number':
					types.push('number');
					break;
				case 'boolean':
					types.push('boolean');
					break;
				case 'range':
				case '<vector>':
				case '[<x>, <y>, <z>]':
				case 'number array':
					types.push('array');
					break;
				case 'any':
				case 'sequenceoptions':
					types = [];
					break;
			}
		}

		if (option.children?.length) {
			types.push('object');
		}

		if (types && types.length) {
			// Remove duplicates
			types = types.filter(function (value, index, array) { 
				return array.indexOf(value) === index;
			});

			output.type = types;
		}
	}

	return output;
};

const renderRecursiveOptions = (options, levels = [], props = {}) => {
	for (const option of options) {
		const currLevels = [...levels, option];
		props[option.name] = renderStepProperty(option, currLevels.map(l => l.name).join(' > '));

		if (option.children) {
			props[option.name].properties = renderRecursiveOptions(option.children, currLevels);
		}
	}

	return props;
};

const renderJsonSchema = (globalProps, categories, steps) => {
	// Make a list of all global options.
	const globalOptions = globalProps.options.reduce((all, option) => {
		all['globalOption ' + option.name] = renderStepProperty(option, option.name + ' (global option)');
		all['globalOption ' + option.name].name = option.name;
		return all;
	}, {});

	// Make a list of all category options.
	const categoryOptions = {};
	categories.forEach((category) => {
		if (!category.options) return;

		for (const option of category.options) {
			const key = 'categoryOption ' + category.name + ' ' + option.name;
			categoryOptions[key] = renderStepProperty(option, option.name + ` (${ category.name } category option)`);
			categoryOptions[key].name = option.name;
			categoryOptions[key].category = category.name;
		}
	});

	// Make a list of all step names (along with aliases) and 
	// reference the original step (as a tuple).
	const stepMappings = steps.reduce((all, curr) => {
		all.push([curr.name, curr]);

		if (curr.alias) {
			if (Array.isArray(curr.alias)) {
				for (const alias of curr.alias) {
					all.push([alias, curr]);
				}
			} else {
				all.push([curr.alias, curr]);
			}
		}

		return all;
	}, []);

	// Generate schema for steps.
	const stepSchema = stepMappings.map(([stepName, step]) => {
		let props = {};

		// Add "main" step property.
		props[stepName] = renderStepProperty(step, stepName + ' step');

		// Add step options
		if (step.options && step.options.length) {
			const optionProps = renderRecursiveOptions(step.options, [step]);
			props = {...props, ...optionProps};
		}

		// Add global options
		if (globalOptions) {
			for (const optionId in globalOptions) {
				props[globalOptions[optionId].name] = { '$ref': '#/$defs/' + optionId};
			} 
		}

		// Add category options
		if (categoryOptions) {
			for (const optionId in categoryOptions) {
				if (categoryOptions[optionId].category === step.category) {
					props[categoryOptions[optionId].name] = { '$ref': '#/$defs/' + optionId};
				}
			} 
		}

		// Figure out required options from documentation.
		const requiredOptions = (step.options) ? step.options.filter(o => o.required).map(o => o.name) : undefined;
		const required = [stepName];

		if (requiredOptions && requiredOptions.length) {
			required.push(...requiredOptions);
		}

		return {
			type: 'object',
			title: 'Step: ' + step.name,
			description: stripMarkdown(step.description),
			properties: props,
			required: required,
		};
	});

	/**
	 * Output JSON Schema. Top level nodes are hard coded, while
	 * steps and their options are generated.
	 */
	const doc = {
		$schema: "https://json-schema.org/draft/2020-12/schema",
		line_endings: "unix",
		$id: "https://qualisys.com/schemas/calqulus-pipeline",
		title: "Qualisys Calqulus Pipeline",
		description: "A document describing calculations to be done on biomechanical data for presentation in a report.",
		type: "array",

		// Top-level items in the array should be one of 
		// the object types referenced below.
		items: {
			oneOf: [
				{ "$ref": "#/$defs/Parameter Node" },
				{ "$ref": "#/$defs/Space Node" },
				{ "$ref": "#/$defs/Event Node" },
				{ "$ref": "#/$defs/Marker Node" },
				{ "$ref": "#/$defs/Segment Node" },
			],
		},

		/**
		 * Definitions of nodes and properties.
		 */
		$defs: {
			/**
			 * Top-level node properties
			 */
			parameter: {
				title: "Parameter node",
				description: "A parameter node defines steps used to calculate a value or a sequence of values. The result is exported to the global scope and exported in the resulting JSON file.",
				type: "string",
			},
			space: {
				title: "Space node",
				description: "A parameter node defines steps used to calculate a value or a sequence of values. The result is exported to the global scope and exported in the resulting JSON file.",
				type: "string",
			},
			event: {
				title: "Event node",
				description: "A parameter node defines steps used to calculate a value or a sequence of values. The result is exported to the global scope and exported in the resulting JSON file.",
				type: "string",
			},
			marker: {
				title: "Marker node",
				description: "A parameter node defines steps used to calculate a value or a sequence of values. The result is exported to the global scope and exported in the resulting JSON file.",
				type: "string",
			},
			segment: {
				title: "Marker node",
				description: "A parameter node defines steps used to calculate a value or a sequence of values. The result is exported to the global scope and exported in the resulting JSON file.",
				type: "string",
			},
			steps: {
				title: "Node steps",
				description: "A step node takes an input and some options and outputs a value.					",
				type: "array",
				additionalItems: false,

				items: {
					oneOf: stepSchema
				},
			},
			where: {
				title: "Measurement filtering",
				description: "When importing a signal or defining an output node, you can specify a measurement from which the signal should be imported – or for which measurement an output node should run.\n\nYou can filter measurements by name and by field values and you can use wildcard characters `*` to formulate patterns to match partial values. The matching of values is case-insensitive.\n\nWhen using a measurement filter, a list of matching measurements is created. By specifying the `index` option, you can define which of the matching measurements should apply.",
				type: "object",
				properties: {
					name: {
						title: "Name filter",
						description: "Target a measurement by name",
						type: "string",
					},
					index: {
						title: "Index filter",
						description: "Out of a number of matching measurements, pick the nth match. Either a 1-based index, or the values `first` or `last` to select the first or last match, respectively.",
						type: ["integer", "string"],

						if: {
							type: "string"
						},
						then: {
							enum: ["first", "last"]
						}
					},
					fields: {
						title: "Field filter",
						description: "Target a measurement by a field value.",
						type: "object",
						additionalProperties: {
							title: "Field to match against",
							type: "string",
						}
					}
				},
				additionalProperties: false,
			},
			set: {
				title: "Output set",
				description: "Used to specify which _set_ the exported parameter will use. In most cases, this will be either `left` or `right`.\n\nIf not set, the JSON output will use set: null.",
				type: "string",
			},

			/**
			 * Space node properties
			 */
			spaceOrigin: {
				title: "Origin",
				description: "Sets the origin of a custom coordinate system.",
				type: ['string', 'array'],
			},
			spacePrimaryAxis: {
				title: "Primary axis",
				description: `Sets the primary axis of a custom coordinate system. The primary axis of the custom coordinate system will always be a unit vector with the same direction as this vector.
				
If more than one vectors is given, for example [myMarker1, myMarker2], the vector difference between the first two vectors is used as the primary axis.`,
				type: ['string', 'array'],
			},
			spaceSecondaryAxis: {
				title: "Secondary axis",
				description: `Sets the secondary axis of a custom coordinate system. The actual secondary axis of the custom coordinate system might differ from the vector specified, since the secondary axis must be a unit vector perpendicular to the primary axis.
				
If more than one vectors is given, for example [myMarker1, myMarker2], the vector difference between the first two vectors is used as the secondary axis.`,
				type: ['string', 'array'],
			},
			spaceOrder: {
				title: "Order",
				description: `Defines what axis the primary and secondary axis corresponds to. The first letter defines the name of the primary axis, and the second letter defines the name of the secondary axis.
				
Possible values:
xy - Primary axis: x, secondary axis: y
yx - Primary axis: y, secondary axis: x
xz - Primary axis: x, secondary axis: z
yz - Primary axis: y, secondary axis: z
zy - Primary axis: z, secondary axis: y`,
				type: 'string',
				enum: [
					'xy',
					'yx',
					'xz',
					'yz',
					'zy',
				]
			},
			spaceAlignWithSegment: {
				title: "Align with segment",
				description: `Used to create a space that aligns with the specified segment. The resulting space will be rotated in 90 degree increments relative to the world space.

The rotation is based on the average orientation of the segment during a mesurement.`,
				type: ['string'],
			},
			
			/**
			 * Top-level node objects
			 */
			"Parameter Node": {
				title: "Parameter node",
				description: `A parameter node defines steps used to calculate a value or a sequence of values. The result is exported to the global scope and exported in the resulting JSON file.`,
				type: "object",
				properties: {
					parameter: { "$ref": "#/$defs/parameter" },
					steps: { "$ref": "#/$defs/steps" },
					where: { "$ref": "#/$defs/where" },
					set: { "$ref": "#/$defs/set" },
				},
				required: ['parameter', 'steps'],
				additionalProperties: false,
			},
			"Space Node": {
				type: "object",
				properties: {
					space: { "$ref": "#/$defs/space" },
					origin: { "$ref": "#/$defs/spaceOrigin" },
					primaryAxis: { "$ref": "#/$defs/spacePrimaryAxis" },
					secondaryAxis: { "$ref": "#/$defs/spaceSecondaryAxis" },
					order: { "$ref": "#/$defs/spaceOrder" },
					alignWithSegment: { "$ref": "#/$defs/spaceAlignWithSegment" },
					steps: { "$ref": "#/$defs/steps" },
					where: { "$ref": "#/$defs/where" },
					set: { "$ref": "#/$defs/set" },
				},
				oneOf: [
					{ required: ['space', 'alignWithSegment'] },
					{ required: ['space','primaryAxis', 'secondaryAxis'] },
				],
				additionalProperties: false,
			},
			"Event Node": {
				type: "object",
				properties: {
					event: { "$ref": "#/$defs/event" },
					steps: { "$ref": "#/$defs/steps" },
					where: { "$ref": "#/$defs/where" },
					set: { "$ref": "#/$defs/set" },
				},
				required: ['event', 'steps'],
				additionalProperties: false,
			},
			"Marker Node": {
				type: "object",
				properties: {
					marker: { "$ref": "#/$defs/marker" },
					steps: { "$ref": "#/$defs/steps" },
					where: { "$ref": "#/$defs/where" },
					set: { "$ref": "#/$defs/set" },
				},
				required: ['marker', 'steps'],
				additionalProperties: false,
			},
			"Segment Node": {
				type: "object",
				properties: {
					segment: { "$ref": "#/$defs/segment" },
					steps: { "$ref": "#/$defs/steps" },
					where: { "$ref": "#/$defs/where" },
					set: { "$ref": "#/$defs/set" },
				},
				required: ['segment', 'steps'],
				additionalProperties: false,
			},

			/**
			 * Global options (available for all steps)
			 */
			...globalOptions,

			/**
			 * Category options (available for all steps in a certain category)
			 */
			...categoryOptions,
		}
	};

	return doc;
}

module.exports = {
	renderJsonSchema,
}