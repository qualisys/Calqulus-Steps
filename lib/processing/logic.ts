import { evaluateExpression, parseExpression, printExpression, tokenizeExpression } from 'expression-engine';

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

		const exp = this.node.originalInputString;
		const operands = parseExpressionOperands(exp);
		const expressionValues = {};

		const thenInput = this.getPropertySignalValue('then');
		const elseInput = this.getPropertySignalValue('else');

		if (operands.length === 0) {
			// If there are no operands, we assume that we are checking for the
			// existence of values. If no values exist, we should get undefined
			// which will be evaluated to false.
			const value = this.getValueForInput(0);

			this.processingLogs.push('Evaluated to: ' + value);
			return isNaN(value) ? elseInput[0] : thenInput[0];
		}

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
			if (!NumberUtil.isNumeric(operands[i])) {
				expressionValues[operands[i]] = this.getValueForInput(i);
			}
		}

		try {
			const tokens = tokenizeExpression(exp);
			const ast = parseExpression(tokens);
			const _expression = printExpression(ast);
			const result = evaluateExpression(ast, expressionValues);

			this.processingLogs.push('Evaluated to: ' + result);

			return result ? thenInput[0] : elseInput[0];
		}
		catch (err) {
			throw new ProcessingError('Evaluating expression failed: ' + err.message);
		}
	}

	getValueForInput(inputIndex: number): number {
		const value = this.inputs[inputIndex];
		let result: number;

		if (value.type === SignalType.Float32) {
			result = value.getNumberValue();
		}
		else if (value.type === SignalType.Uint32Array && value.length === 1) {
			result = value.getUint32ArrayValue()[0];
		}
		else if (value.type === SignalType.Float32Array && value.length === 1) {
			result = value.getFloat32ArrayValue()[0];
		}
		else if (value.length === 0) {
			result = undefined;
		}
		else {
			throw new ProcessingError('Unsupported type: ' + value.typeToString + '.');
		}

		return result;
	}
}