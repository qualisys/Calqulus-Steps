import { IStepNode } from '../../models/node-interface';
import { PropertyType } from '../../models/property';
import { Segment } from '../../models/segment';
import { MatrixSequence } from '../../models/sequence/matrix-sequence';
import { QuaternionSequence } from '../../models/sequence/quaternion-sequence';
import { Signal, SignalType } from '../../models/signal';
import { Quaternion } from '../../models/spatial/quaternion';
import { StepClass } from '../../step-registry';
import { ProcessingError } from '../../utils/processing-error';
import { getReferenceSignal } from '../../utils/reference-signal';
import { markdownFmt } from '../../utils/template-literal-tags';
import { VectorInputParser } from '../../utils/vector-input-parser';

import { BaseImportStep } from './base-import';

@StepClass({
	name: 'segment',
	category: 'Import',
	description: markdownFmt`
		Imports a segment series by name.
	`,
	inputs: [
		{ type: ['Series'] },
	],
	output: ['Series'],
})
export class SegmentStep extends BaseImportStep {
	static prepareNode(node: IStepNode) {
		node.in = node.in.map(name => ((typeof name === 'string') && !(name as string).startsWith('segment://')) ? 'segment://' + name : name);
	}

	async process() {
		if (!this.node.hasProperty('origin') && !this.node.hasProperty('primaryAxis') && !this.node.hasProperty('secondaryAxis')) {
			return this.inputs[0];
		}

		if (this.node.hasProperty('origin') && !this.node.hasProperty('primaryAxis')) {
			throw new ProcessingError('Property \'origin\' will not work on it\'s own, it requires \'primaryAxis\' to work.');
		}

		if (this.node.hasProperty('origin') && !this.node.hasProperty('secondaryAxis')) {
			throw new ProcessingError('Property \'origin\' will not work on it\'s own, it requires \'secondaryAxis\' to work.');
		}

		if (this.node.hasProperty('primaryAxis') && !this.node.hasProperty('secondaryAxis')) {
			throw new ProcessingError('Property \'primaryAxis\' will not work on it\'s own, it requires \'secondaryAxis\' to work.');
		}

		if (this.node.hasProperty('secondaryAxis') && !this.node.hasProperty('primaryAxis')) {
			throw new ProcessingError('Property \'secondaryAxis\' will not work on it\'s own, it requires \'primaryAxis\' to work.');
		}

		const originSignals = this.getPropertySignalValue('origin');
		const primaryAxisSignals = this.getPropertySignalValue('primaryAxis');
		const secondaryAxisSignals = this.getPropertySignalValue('secondaryAxis');
		const referenceSignal = getReferenceSignal(originSignals.concat(primaryAxisSignals, secondaryAxisSignals), [SignalType.Segment, SignalType.VectorSequence, SignalType.Float32Array], false);

		const origin = VectorInputParser.parse('origin', originSignals)[0];
		const primaryAxisVectors = VectorInputParser.parse('primaryAxis', primaryAxisSignals);
		const secondaryAxisVectors = VectorInputParser.parse('secondaryAxis', secondaryAxisSignals);
		const order = this.node.getPropertyValue<string>('order', PropertyType.String, false, 'xy');

		const primaryAxis = primaryAxisVectors.length > 1
			? primaryAxisVectors[1].subtract(primaryAxisVectors[0])
			: primaryAxisVectors[0];

		const secondaryAxis = secondaryAxisVectors.length > 1
			? secondaryAxisVectors[1].subtract(secondaryAxisVectors[0])
			: secondaryAxisVectors[0];

		const rotationMatrix = MatrixSequence.fromVectors(primaryAxis, secondaryAxis, order);
		const nFrames = Math.max(rotationMatrix.length, origin.length);
		const quats = new QuaternionSequence(new Float32Array(nFrames), new Float32Array(nFrames), new Float32Array(nFrames), new Float32Array(nFrames));
		const quatTmp = Quaternion.tmpQuat1;

		for (let i = 0; i < nFrames; i++) {
			Quaternion.fromRotationMatrix(quatTmp, rotationMatrix.getMatrixAtFrame(i + 1));

			quats.x[i] = quatTmp.x;
			quats.y[i] = quatTmp.y;
			quats.z[i] = quatTmp.z;
			quats.w[i] = quatTmp.w;
		}

		const out = referenceSignal ? referenceSignal.clone(false) : new Signal();
		out.setValue(Segment.fromArray(referenceSignal ? referenceSignal.name : '', [origin.x, origin.y, origin.z, quats.x, quats.y, quats.z, quats.w]));

		return out;
	}
}
