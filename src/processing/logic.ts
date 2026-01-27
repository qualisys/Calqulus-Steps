import { evaluateExpression, parseExpression, printExpression, tokenizeExpression } from 'expression-engine';
import { set } from 'lodash';

import { Signal, SignalType } from '../models/signal';
import { StepCategory, StepClass } from '../step-registry';
import { parseExpressionOperands } from '../utils/expression';
import { NumberUtil } from '../utils/number';
import { ProcessingError } from '../utils/processing-error';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';


@StepCategory({
	name: 'Logic',
	description: markdownFmt`
		These are steps that run logical expressions.
	`,
})
@StepClass({
	name: 'if',
	category: 'Logic',
	description: markdownFmt`
		Runs a logical expression. The return value is determined by the 
		result of the expression, and the ''then'' and ''else'' options.
		
		The following operators are supported:
		
		<pre><  >  >=  <=  ==  !=  &&  ||  !</pre>
		
		Parentheses can be used to influence the order of evaluation.
		
		You are able to use "functions" in the expression to validate if a 
		signal is empty or exists. The following functions are supported:

		* ''empty(signalName)'' - Returns true if the signal is empty, 
		i.e. the signal does not exist or the value is falsy but not zero
		(false, null, NaN, empty string). The value zero (0) is not
		considered empty because it is a valid value for a signal.
		* ''exists(signalName)'' - Returns true if the signal exists, 
		i.e. the signal is _defined_. This function does not validate 
		the _value_ of the signal but _only_ if the signal is defined 
		or not. The signal value could be falsy, but as long as the 
		signal is defined, this function will return true.
		
		***Note:** Due to the way YAML is parsed, you must wrap expressions
		beginning with an exclamation mark in quotes, e.g. ''"!empty(mySignal)"''.*

		***Note:** In order to be able to evaluate missing signals, this 
		step does not validate the inputs to the expression. To validate 
		a signal's existence, use the ''exists'' function.*

		***Note:** The validation of the inputs to the ''then'' and ''else'' 
		options are deferred until they are needed. This means that if the 
		expression evaluates to true, but the ''then'' option is missing, 
		the step will not fail until the ''then'' option is needed. This is 
		done to allow for the use of references to signals that may only be 
		able to be resolved in certain circumstances, e.g. when the 
		expression evaluates to true.*
	`,
	examples: markdownFmt`
		''' yaml
		- parameter: myCondition
		  steps:
		    - segment: RightFoot => rfoot
		    - segment: LeftFoot => lfoot
		    - if: 10 > 5
		      then: rfoot
		      else: lfoot
		'''
		
		''' yaml
		- if: (posY > 10 || posY < 5) && posX != 0
		  then: posY
		  else: posX
		'''

		The following example shows how you can check for the existence of values in a
		signal. If ''mySignal'' has values, the resulting signal would be ''mySignal'', otherwise
		the result is ''myDefault''.

		''' yaml
		- if: "!empty(mySignal)"
		  then: mySignal
		  else: myDefault
		'''

		The following example shows how you can check for the existence of of a
		signal. If ''mySignal'' exists, the resulting signal would be ''mySignal'', 
		otherwise the result is ''myDefault''.

		''' yaml
		- if: exists(mySignal)
		  then: mySignal
		  else: myDefault
		'''

		The following example shows how you can compare values from measurement fields.

		''' yaml
		- if: $field(My Field, measurement, numeric) > $field(My Other Field, measurement, numeric)
		  then: mySignal
		  else: myDefault
		'''

		The following example shows how to return a field value if it is not empty, otherwise return a default value.

		''' yaml
		- if: "!empty($field(My Field, measurement, numeric))"
		  then: $field(My Field, measurement, numeric)
		  else: myDefault
		'''
	`,
	inputs: [
		{ type: ['Logical expression'] },
	],
	options: [{
		name: 'then',
		type: 'any',
		typeComment: 'The value to return if the expression evaluates to true.',
		required: true,
	}, {
		name: 'else',
		type: 'any',
		typeComment: 'The value to return if the expression evaluates to false.',
		required: true,
	}],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class IfStep extends BaseStep {
	static acceptsMissingInputs = true;

	originalExpr;

	async process(): Promise<Signal> {
		if (this.inputs.length < 1) {
			throw new ProcessingError('Empty or missing if input.');
		}

		if (!this.node.originalInputString) {
			throw new ProcessingError('Found no expression in input.');
		}

		const inputExp = this.node.originalInputString;
		const { operands, expression: exp } = parseExpressionOperands(inputExp);
		const expressionValues = {};

		const thenInput = this.getPropertySignalValue('then');
		const elseInput = this.getPropertySignalValue('else');

		if (!thenInput || !elseInput) {
			throw new ProcessingError('Missing \'then\' and/or \'else\' options.');
		}

		if (thenInput.length > 1) {
			throw new ProcessingError(`Unexpected input length for 'then' option. Expected 1 input, got ${ thenInput.length }.`);
		}

		if (elseInput.length > 1) {
			throw new ProcessingError(`Unexpected input length for 'else' option. Expected 1 input, got ${ elseInput.length }.`);
		}

		for (let i = 0; i < operands.length; i++) {
			const operand = operands[i];

			if (!NumberUtil.isNumeric(operand.value)) {
				let value: string | number | boolean;

				if (operand.exists) {
					value = this.hasValueForInput(i);
				}
				else {
					value = this.getValueForInput(i);
				}

				if (operand.empty) {
					// Zeroes are not considered empty.
					if (value === 0) {
						value = false;
					}
					else {
						value = !value;
					}
				}

				set(expressionValues, operand.value, value);
			}
		}

		try {
			const tokens = tokenizeExpression(exp);
			const ast = parseExpression(tokens);
			const _expression = printExpression(ast);
			const result = evaluateExpression(ast, expressionValues);

			this.processingLogs.push('Evaluated to: ' + result);

			// Handle truthy evaluation.
			if (result) {
				if (thenInput[0] === undefined) {
					throw new Error('Unexpected undefined value for \'then\' option.');
				}

				// If the input is a string, it is a reference to a signal that could not be found.
				if (thenInput[0].type === SignalType.String) {
					throw new Error(`Could not resolve signal '${ thenInput[0].getStringValue() }' for 'then' option.`);
				}

				return thenInput[0].clone();
			}

			// Handle falsy evaluation.
			if (elseInput[0] === undefined) {
				throw new Error('Unexpected undefined value for \'else\' option.');
			}

			// If the input is a string, it is a reference to a signal that could not be found.
			if (elseInput[0].type === SignalType.String) {
				throw new Error(`Could not resolve signal '${ elseInput[0].getStringValue() }' for 'else' option.`);
			}

			return elseInput[0].clone();
		}
		catch (err) {
			throw new ProcessingError('Evaluating expression failed: ' + err.message);
		}
	}

	hasValueForInput(inputIndex: number): boolean {
		const value = this.inputs[inputIndex];

		if (!value) {
			return false;
		}

		const valueArray = value.array;

		if (!valueArray?.length || !valueArray[0]?.length) {
			return false;
		}

		return true;
	}

	getValueForInput(inputIndex: number): number | string | undefined {
		const value = this.inputs[inputIndex];

		if (!value) {
			return undefined;
		}

		if (value.type === SignalType.String) {
			return value.getStringValue();
		}

		if (value.type === SignalType.Float32) {
			return value.getNumberValue();
		}

		const valueArray = value.array;

		if (!valueArray?.length || !valueArray[0]?.length) {
			return undefined;
		}

		// Check if the value is a multi-component array.
		if (valueArray.length > 1) {
			throw new ProcessingError('Unsupported type: ' + value.typeToString + '.');
		}

		// Return value of first frame.
		return valueArray[0][0];
	}
}