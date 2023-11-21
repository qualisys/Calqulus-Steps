import { Segment } from '../models/segment';
import { PlaneSequence } from '../models/sequence/plane-sequence';
import { Signal, SignalType } from '../models/signal';
import { StepClass } from '../step-registry';
import { ProcessingError } from '../utils/processing-error';
import { markdownFmt } from '../utils/template-literal-tags';

import { BaseStep } from './base-step';

@StepClass({
	name: 'project',
	category: 'Geometry',
	description: markdownFmt`
		Orthogonally projects a point onto a plane and returns the 
		location of the projected point.

		***Note:*** *The plane will remain in the space used when 
		creating it, applying a space to the ''project'' step will 
		apply the space to the vector / segment, but the plane will 
		be left untouched.*`,
	inputs: [
		{ type: ['Scalar', 'Series (<vector> | <segment>)'] },
		{ type: ['Plane'] },
	],
	output: ['Scalar', 'Series (<vector> | <segment>)'],
})
export class ProjectStep extends BaseStep {
	async process(): Promise<Signal> {
		if (this.inputs.length < 2) {
			throw new ProcessingError('Two input signals required.');
		}

		const point = this.inputs.find(i => [SignalType.Segment, SignalType.VectorSequence].includes(i.type));
		const plane = this.inputs.find(i => i.type === SignalType.PlaneSequence);

		if (!point || !plane) {
			throw new ProcessingError('Expected one Plane and one Vector/Segment input.');
		}

		const res = PlaneSequence.project(point.getVectorSequenceValue(), plane.getPlaneSequenceValue());

		// Handle Segment input => return translated Segment.
		if (point.type === SignalType.Segment) {
			const src = point.getSegmentValue();

			return point.clone(new Segment(src.name, res, src.rotation, undefined, undefined, undefined, src.frameRate));
		}

		return point.clone(res);
	}
}