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
		
		Only numbers and single-element arrays can be part of operands in the
		expression. In addition, a single input can be used to check for existence 
		of values.
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
		- if: mySignal
		  then: mySignal
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
				let value: string | number | boolean = this.getValueForInput(i);

				if (operand.exists) {
					value = value !== undefined;
				}

				if (operand.empty) {
					value = !value;
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