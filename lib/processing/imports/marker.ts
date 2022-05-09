import { Marker } from '../../models/marker';
import { IStepNode } from '../../models/node-interface';
import { Signal, SignalType } from '../../models/signal';
import { StepClass } from "../../step-registry";
import { getReferenceSignal } from '../../utils/reference-signal';
import { markdownFmt } from '../../utils/template-literal-tags';
import { VectorInputParser } from '../../utils/vector-input-parser';

import { BaseImportStep } from './base-import';

@StepClass({
	name: 'marker',
	category: 'Import',
	description: markdownFmt`
		Imports a marker series by name or creates a new signal 
		with a custom origin.
	`,
	examples: markdownFmt`
		Import existing marker as-is.
		''' yaml
		- marker: RFoot
		'''
		
		Create a new marker signal using the x-component of an existing marker and fixed y- and z- coordinates.
		''' yaml
		- marker:
          origin: [RFoot.x, 0, 0]
		'''
	`,
	inputs: [
		{ type: ['Series'] },
	],
	options: [{
		name: 'origin',
		type: ['<vector>', '[<x>, <y>, <z>]'],
		required: false,
		default: 'N/A',
		description: markdownFmt`
			This option can be used to create a new marker signal, 
			with a custom x, y and z coordinate.
		`,
	}],
	output: ['Series'],
})
export class MarkerStep extends BaseImportStep {
	static prepareNode(node: IStepNode) {
		node.in = node.in.map(name => ((typeof name === 'string') && !(name as string).startsWith('marker://')) ? 'marker://' + name : name);
	}

	async process() {
		if (this.node.hasProperty('origin')) {
			const originSignal = this.getPropertySignalValue('origin');
			const origin = VectorInputParser.parse('origin', originSignal)[0];
			let referenceSignal = getReferenceSignal(originSignal, [SignalType.Segment, SignalType.VectorSequence, SignalType.Float32Array], true);

			if (!referenceSignal) {
				referenceSignal = getReferenceSignal(this.inputs, [SignalType.Segment, SignalType.VectorSequence], true);
			}

			const out = referenceSignal ? referenceSignal.clone(false) : new Signal();
			out.setValue(Marker.fromArray(referenceSignal ? referenceSignal.name : '', [origin.x, origin.y, origin.z]));

			return out;
		}
		else {
			return this.inputs[0];
		}
	}
}