import { Marker } from '../models/marker';
import { PropertyType } from '../models/property';
import { Segment } from '../models/segment';
import { ISequence } from '../models/sequence/sequence';
import { SignalType } from '../models/signal';
import { StepCategory, StepClass } from '../step-registry';
import { Arithmetic, ArithmeticOp } from '../utils/math/arithmetic';
import { ProcessingError } from '../utils/processing-error';
import { getReferenceSignal } from '../utils/reference-signal';
import { SequenceUtil } from '../utils/sequence';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

export enum FrameSequenceOperandOrder {
	Forward = 'forward',
	Reverse = 'reverse',
	None = 'none',
}

@StepCategory({
	name: 'Arithmetic',
	description: markdownFmt`
		These are steps that takes a list of any kind of input (scalar / 
		series / events / numbers), i.e., _operands_, then runs a defined 
		arithmetic function over them and outputs the result. 
		
		The type of the result is of the same type as the first operand, 
		or a vector sequence if the result is an array with three elements.
	`,
	examples: markdownFmt`
		''' yaml
		- subtract: [5, 2]
		'''
		_Performs the operation ''5 - 2'' and returns ''3''._
		
		''' yaml
		- add: [1, 2, 3, 4, 5]
		'''
		
		''' yaml
		- add: [[myMarker.x, 5, 1], [10, 0, 1]]
		'''
		
		_Adds the ''x'' component of ''myMarker'', ''5'' and ''1'' with 
		the corresponding item in the second operand for all frames in 
		''myMarker''. Given ''myMarker.x = [3, 6, 12]'', the result is the 
		vector sequence ''{ x: [13, 16, 22], y: [5, 5, 5], z: [2, 2, 2]''._
		
		''' yaml
		- multiply: [[1, 2, 3], 2]
		'''
		_Multiplies every item of the first operand with 2, returning a 
		vector ''{ x: 2, y: 4, z: 6 }''._
		
		''' yaml
		- multiply: [[1, 2, 3], [1, 2, 3]]
		'''
		_Multiplies every item of the first operand with the corresponding 
		item from the second, returning a vector ''{ x: 1, y: 4, z: 9 }''._
		
		''' yaml
		- divide: [Hips, 2]
		'''
		_Divides every component of the ''Hips'' segment, for all 
		frames with 2._
		
		''' yaml
		- multiply: [Hips, [1, 0, 1]]
		'''
		_Multiplies the ''x'', ''y'', and ''z'' components of the ''Hips'' 
		segment, for all frames with the corresponding item from the 
		second operand._
	`,
	options: [{
		name: 'frameSequenceOrder',
		type: 'String',
		enum: ['none', 'forward', 'reverse'],
		required: false,
		default: 'none',
		description: markdownFmt`
			If set to any value but ''none'', the input signals will pass 
			through a function which returns a list of signals where each 
			value is from a frame greater than or equal to the frame of the 
			corresponding value from the preceding Signal.

			If set to ''forward'', it will start from the first value of the 
			first (leftmost) input signal (operand) and the algorithm will 
			look at subsequent operands (to the right) one "row" at a time.
			
			Conversely, if set to ''reverse'', the event sequencing uses 
			the reverse order of operands and goes from right to left.
			
			If a full "row" of values could not be matched, it is not 
			included in the result, i.e., all operands will be of the 
			same length. 
			
			This is useful, for example, when calculating the distance 
			between two signals at a certain event.
			
			The function will only apply if ***all*** input signals have 
			applied a [Frames](../../inputs-and-outputs.md#frames) filter, 
			otherwise the signals are left untouched.

			### Example

			''' yaml
			- subtract: [LeftFoot.y@LFS, RightFoot.y@RFS]
              frameSequenceOrder: reverse
			'''

			_Creates an event sequence from the inputs, starting from the 
			second operand (RFS event) and creates event pairs RFS -> LFS 
			out of the values. It then subtracts each frame from the 
			''RightFoot'' from the corresponding ''LeftFoot'' frame._

			_If ''frameSequenceOrder'' had been set to ''forward'', it 
			would have created pairs going from LFS -> RFS instead._
			
			_Using the ''frameSequenceOrder'' option ensures that the 
			operands starts with the intended event and that both operands 
			have the same length._
		`,
	}],
})
export class BaseArithmeticStep extends BaseStep {
	frameSequenceOrder: FrameSequenceOperandOrder;

	init() {
		super.init();

		const frameSequenceOrderInput = this.getPropertyValue<string>('frameSequenceOrder', PropertyType.String, false);

		if (frameSequenceOrderInput && typeof frameSequenceOrderInput === 'string') {
			switch (frameSequenceOrderInput.toLowerCase()) {
				case FrameSequenceOperandOrder.Forward:
					this.frameSequenceOrder = FrameSequenceOperandOrder.Forward;
					break;
				case FrameSequenceOperandOrder.Reverse:
					this.frameSequenceOrder = FrameSequenceOperandOrder.Reverse;
					break;
				case FrameSequenceOperandOrder.None:
					this.frameSequenceOrder = FrameSequenceOperandOrder.None;
					break;
				default:
					throw new ProcessingError(`Unrecognized value for frameSequenceOrder option.`);
			}
		}
		else {
			this.frameSequenceOrder = FrameSequenceOperandOrder.None;
		}
	}

	async calculate(operation: ArithmeticOp) {
		if (this.inputs.includes(undefined)) throw new ProcessingError('Missing parameter in Arithmetic step');

		let inputs = this.inputs;

		if (this.frameSequenceOrder && this.frameSequenceOrder !== FrameSequenceOperandOrder.None) {
			if (this.frameSequenceOrder === FrameSequenceOperandOrder.Reverse) {
				// Temporarily reverse input order.
				inputs.reverse();
			}

			inputs = SequenceUtil.sequenceByFrameMap(...inputs);

			if (this.frameSequenceOrder === FrameSequenceOperandOrder.Reverse) {
				// Restore input order.
				inputs.reverse();
			}
		}

		const operands = inputs.map(input => (input as ISequence).array).filter(a => !!a).map(a => a.length === 1 ? a[0] : a);

		if (!operands.length) throw new ProcessingError('No operands given.');

		let res: number | TypedArray | TypedArray[] = operands[0];
		if (operands.length > 1) {
			for (let i = 1; i < operands.length; i++) {
				res = Arithmetic.applyOp(res, operands[i], operation);
			}

			const referenceInput = getReferenceSignal(this.inputs, [SignalType.Segment, SignalType.VectorSequence]);
			const out = referenceInput.clone(false);
			const originalType = referenceInput.type;
			switch (originalType) {
				case SignalType.VectorSequence:
					out.setValue(Marker.fromArray(referenceInput.name, res as TypedArray[]));
					break;
				case SignalType.Segment:
					out.setValue(Segment.fromArray(referenceInput.name, res as TypedArray[]));
					break;
				default:
					out.setValue(res);
			}

			return out;
		}
		else {
			throw new ProcessingError(`At least 2 operands expected, got ${ operands.length }.`);
		}
	};
}

@StepClass({
	name: 'add',
	category: 'Arithmetic',
	description: markdownFmt`
		Adds the input operands.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class AdditionStep extends BaseArithmeticStep {
	process() {
		return this.calculate(ArithmeticOp.Add);
	}
}

@StepClass({
	name: 'divide',
	category: 'Arithmetic',
	description: markdownFmt`
		Divides the input operands.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class DivisionStep extends BaseArithmeticStep {
	process() {
		return this.calculate(ArithmeticOp.Divide);
	}
}

@StepClass({
	name: 'multiply',
	category: 'Arithmetic',
	description: markdownFmt`
		Multiplies the input operands.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class MultiplyStep extends BaseArithmeticStep {
	process() {
		return this.calculate(ArithmeticOp.Multiply);
	}
}

@StepClass({
	name: 'subtract',
	category: 'Arithmetic',
	description: markdownFmt`
		Subtracts the input operands.
	`,
	inputs: [
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
		{ type: ['Scalar', 'Series', 'Event', 'Number'] },
	],
	output: ['Scalar', 'Series', 'Event', 'Number'],
})
export class SubtractionStep extends BaseArithmeticStep {
	process() {
		return this.calculate(ArithmeticOp.Subtract);
	}
}
