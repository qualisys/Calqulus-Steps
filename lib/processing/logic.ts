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
		
		Only numbers and single-element arrays can be part of the expression.
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

		const thenInput = this.getPropertySignalValue('then')[0];
		const elseInput = this.getPropertySignalValue('else')[0];

		if (!thenInput || !elseInput) {
			throw new ProcessingError('Missing \'then\' and/or \'else\' options.');
		}

		for (let i = 0; i < operands.length; i++) {
			if (!NumberUtil.isNumeric(operands[i])) {
				const value = this.inputs[i];

				if (value.type === SignalType.Float32) {
					expressionValues[operands[i]] = value.getNumberValue();
				}
				else if (value.type === SignalType.Uint32Array && value.length === 1) {
					expressionValues[operands[i]] = value.getUint32ArrayValue()[0];
				}
				else if (value.type === SignalType.Float32Array && value.length === 1) {
					expressionValues[operands[i]] = value.getFloat32ArrayValue()[0];
				}
				else {
					throw new ProcessingError('Unsupported type: ' + value.typeToString + '.');
				}
			}
		}

		try {
			const tokens = tokenizeExpression(exp);
			const ast = parseExpression(tokens);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const expression = printExpression(ast);
			const result = evaluateExpression(ast, expressionValues);

			this.processingLogs.push('Evaluated to: ' + result);

			return result ? thenInput : elseInput;
		}
		catch (err) {
			throw new ProcessingError('Evaluating expression failed: ' + err.message);
		}
	}
}