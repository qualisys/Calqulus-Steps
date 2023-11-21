import { isBoolean } from 'lodash';

import { PropertyType } from '../models/property';
import { Segment } from '../models/segment';
import { MatrixSequence } from '../models/sequence/matrix-sequence';
import { PlaneSequence } from '../models/sequence/plane-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal, SignalType } from '../models/signal';
import { Matrix } from '../models/spatial/matrix';
import { Vector } from '../models/spatial/vector';
import { StepCategory, StepClass } from '../step-registry';
import { AngleUtil } from '../utils/math/angle';
import { Euler, RotationOrder } from '../utils/math/euler';
import { KinematicsUtil } from '../utils/math/kinematics';
import { ProcessingError } from '../utils/processing-error';
import { markdownFmt } from '../utils/template-literal-tags';
import { TypeCheck } from '../utils/type-check';

import { BaseStep } from './base-step';

export enum CoordinatePlane {
	XY = 'xy',
	YZ = 'yz',
	XZ = 'xz'
}

export enum ExportUnit {
	Radians,
	Degrees,
}

@StepCategory({
	name: 'Angle',
	description: markdownFmt`
		The steps ''jointAngle'' and ''jointAngleVelocity'' exist for the 
		sake of backwards compatibility and offer the same functionality 
		as the ''angle'' and ''angularVelocity'' steps.
	`,
	options: [{
		name: 'project',
		enum: ['xy', 'xz', 'yz'],
		type: ['String', '<PlaneSequence>'],
		required: false,
		default: 'null',
		description: markdownFmt`
			If set to a string, the angle will be calculated in two dimensions on the 
			specified coordinate plane by ignoring the component of the 
			input signals which is not part of the plane.

			Using a PlaneSequence, projects the input vectors on the provided plane. 

			**_Note:_** _The projection is only applied for vector-based 
			angles and is ignored when calculating joint angles._
		`,
	}, {
		name: 'rotationOrder',
		enum: ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX', 'XYX', 'XZX', 'YXY', 'YZY', 'ZXZ', 'ZYZ'],
		type: 'String',
		required: false,
		default: 'XYZ',
		description: markdownFmt`
			The rotation order to use for calculating the Euler angle. 
			Possible rotation orders are:

			Cardan sequence:
			- XYZ
			- YZX
			- ZXY
			- XZY
			- YXZ
			- ZYX
			
			Euler sequence:
			- XYX
			- XZX
			- YXY
			- YZY
			- ZXZ
			- ZYZ
		`,
	}, {
		name: 'unwrap',
		type: ['Boolean', 'Event', 'Number'],
		required: false,
		default: 'XYZ',
		description: markdownFmt`
			When set to ''true'', an event, or a numeric value, the unwrap option 
			shifts the angle phases in order to achieve a continuous curve, i.e., 
			it tries to detect when an angle crosses over its available range 
			(-PI to PI for radians, -180 to 180 degrees).

			This allows for tracking angles on movements that goes outside of the
			typical angle range.

			To do this, it looks for jumps between consecutive angles. If the jump
			is greater than a threshold of half the range (PI for radians, 180 for 
			degrees), the angle is shifted by adding multiples of of the range until 
			the jump no longer crosses the threshold.

			The unwrap algorithm is run over all available components.

			If set to ''true'' or ''0'', the algorithm aligns the unwrap to the start 
			of the sequence. I.e., it assumes the first frame is correct in being 
			within the original range and the following angles are moved to follow 
			suit.
			
			If set to an ''Event'' or a ''Number'', the algorithm will assume that
			the corresponding frame is correct in being within the original range. 
			All other angles will be shifted to follow suit. This enables tracking 
			a rotational movement where the angle for a specific event is intended
			to be within the standard range (-PI to PI for radians, -180 to 180 
			degrees).

			IF a supplied event has more than one instance, the first instance is used.

			**_Note:_** _The unwrap algorithm is sensitive to noise, which may 
			introduce unexpected artifacts. Please consider filtering the signal(s) 
			before calculating its angle using unwrap._
		`,
	}],
})
@StepClass({
	name: 'angle',
	category: 'Angle',
	description: markdownFmt`
		The angle step performs slightly different operation depending on 
		the type and number of inputs.
		
		**_Note:_** _For cases where multiple inputs are given of varying 
		lengths, the returning array will be the maximum length and the 
		last value will be repeated for the shorter inputs to fill the gap._
		
		**One input**: ''<segment>''   
		Computes the euler angle of the specified segment, in degrees.
		
		**Two inputs**: ''(<segment>, <segment>) | (<vector>, <vector>)''   
		Given two segments: Computes the relative (euler) angle between 
		the specified segments, in degrees.
		
		Given two vectors: Computes relative angle between the 
		specified vectors, in radians.
		
		**Three inputs**: ''<vector>, <vector>, <vector>''   
		Computes the angle between the two vectors defined by the 
		specified points (''v0 -> v1'', ''v1 -> v2''), in radians. 
		The points can be specified as arrays or with named
		vector signals (ie markers).
		
		Given the inputs ''v1'', ''v2'' and ''v3'', the resulting angle 
		is given by:
		
		''' javascript
		angleBetween(v1 - v0, v1 - v2)
		'''
		
		**Four inputs**: ''<vector>, <vector>, <vector>, <vector>''   
		Computes the angle between the two lines formed by 
		(''v0 -> v1'', ''v2 -> v3''), in radians. The points can be 
		specified as arrays or with named vector signals (ie markers).`,
	examples: markdownFmt`
		''' yaml
		- angle: [EdgeMarker1, OriginMarker, EdgeMarker2]
		  project: xy
		'''
		
		_Calculates the angle for the three markers, projected 
		on the XY coordinate plane by ignoring the z components 
		of the input signals._`,
	inputs: [
		{ type: ['Scalar', 'Series'] },
		{ type: ['Scalar', 'Series'], optional: true },
		{ type: ['Scalar', 'Series'], optional: true },
		{ type: ['Scalar', 'Series'], optional: true },
	],
	output: ['Scalar', 'Series'],
})
export class AngleStep extends BaseStep {
	coordinatePlane: CoordinatePlane;
	projectionPlane: PlaneSequence;
	rotationOrder: RotationOrder;
	unwrapIndex: number;

	exportUnit: ExportUnit = ExportUnit.Degrees;

	init() {
		super.init();

		// Handle 'rotationOrder' input
		const rotOrderInput = this.getPropertyValue<string>('rotationOrder', PropertyType.String, false);

		if (rotOrderInput) {
			if (rotOrderInput.toUpperCase() in RotationOrder) {
				this.rotationOrder = rotOrderInput.toUpperCase() as RotationOrder;
			}
			else {
				throw new ProcessingError(`Unrecognized value for rotation order: ${ rotOrderInput }.`);
			}
		}
		else {
			this.rotationOrder = RotationOrder.XYZ;
		}

		const projectionOptionInput = this.getPropertySignalValue('project', undefined, false);		
		
		if (projectionOptionInput && projectionOptionInput.length) {
			// Handle unknown project option input
			if (projectionOptionInput[0].type !== SignalType.PlaneSequence && projectionOptionInput[0].type !== SignalType.String) {
				throw new ProcessingError('Unexpected type for project option.');
			}
			
			// Handle projection plane input
			if (projectionOptionInput[0].type === SignalType.PlaneSequence) {
				this.projectionPlane = projectionOptionInput[0].getPlaneSequenceValue();
			}

			// Handle coordinate plane input
			else if (projectionOptionInput[0].type === SignalType.String) {
				switch (projectionOptionInput[0].getStringValue().toLowerCase()) {
					case CoordinatePlane.XY:
						this.coordinatePlane = CoordinatePlane.XY;
						break;
					case CoordinatePlane.YZ:
						this.coordinatePlane = CoordinatePlane.YZ;
						break;
					case CoordinatePlane.XZ:
						this.coordinatePlane = CoordinatePlane.XZ;
						break;
					default:
						throw new ProcessingError('Unrecognized value for project option.');
				}
			} 	
		}

		// Handle unwrap option. If set to anything but false, unwrap should be applied.
		const unwrapInput = this.getPropertyValue('unwrap', undefined, false);

		if (unwrapInput !== undefined) {
			if (unwrapInput === true) {
				this.unwrapIndex = 0;
			} 
			else if (TypeCheck.isArrayLike(unwrapInput)) {
				if (unwrapInput.length) {
					this.unwrapIndex = unwrapInput[0];
				}
			}
			else if (typeof unwrapInput === 'number' && !Number.isNaN(unwrapInput)) {
				this.unwrapIndex = unwrapInput as number;
			}
			else {
				throw new ProcessingError('Unrecognized value for unwrap option.');
			}
		}
	}

	// Override BaseStep's implementation. This is an optimization that avoids
	// space converting signals when it's not needed.
	applySpace() {
		if (this.inputs.length === 1 && this.inputs[0] !== undefined) {
			this.inputs[0].convertToTargetSpace();
		}
	}

	async process(): Promise<Signal> {
		if (this.inputs.includes(undefined)) throw new ProcessingError('Undefined parameter.');

		if (!this.inputs || !this.inputs.length) {
			throw new ProcessingError('No valid inputs.');
		}

		const result: Signal = this.inputs[0].clone(false);

		if (this.inputs.length === 1) {
			if (this.inputs[0].type === SignalType.Segment) {
				const segment: Segment = this.inputs[0].getSegmentValue();
				const angles: VectorSequence = AngleUtil.computeEulerAngle(segment.rotation, this.rotationOrder);
				
				this.exportUnit = ExportUnit.Degrees;
				result.setValue<VectorSequence>(angles);
			}
			else {
				throw new ProcessingError(`Expected segment input, got ${ this.inputs[0].typeToString }.`);
			}
		}
		else if (this.inputs.length === 2) {
			// Compute relative angle. Space does not matter for relative angles.

			// Segments
			if (this.inputs[0].type == SignalType.Segment && this.inputs[1].type == SignalType.Segment) {
				const segment1: Segment = this.inputs[0].getSegmentValue();
				const segment2: Segment = this.inputs[1].getSegmentValue();
				const angles: VectorSequence = AngleUtil.computeRelativeEulerAngle(segment1.rotation, segment2.rotation, this.rotationOrder);

				this.exportUnit = ExportUnit.Degrees;
				result.setValue<VectorSequence>(angles);
			}
			// Compute relative angle between two vectors.
			else {
				const inputs = this.inputs
					.map(input => {
						if (input.type === SignalType.Float32Array) {
							const a = input.getFloat32ArrayValue();

							if (a.length === 3) {
								return new VectorSequence(new Float32Array([a[0]]), new Float32Array([a[1]]), new Float32Array([a[2]]));
							}
							else {
								throw new ProcessingError(`Expected array of length 3, got array of length ${ a.length }.`);
							}
						}
						else if (input.type === SignalType.VectorSequence) {
							return input.getVectorSequenceValue();
						}
						else {
							throw new ProcessingError(`Expected Segment or array of length 3, got ${ input.typeToString }.`);
						}
					})
					.map(vs => this.applyProjection(vs))
				;

				const angle = AngleUtil.computeAngleBetweenVectors(inputs[0], inputs[1])[0];
				this.exportUnit = ExportUnit.Radians;

				result.setValue<number>(angle);
			}
		}
		else if (this.inputs.length === 3 || this.inputs.length === 4) {
			// Compute angle between the two vectors formed by three points (or markers)
			// or compute the relative angle between two lines formed by four points A->B and C->D. 
			const inputs = this.inputs
				.map(input => {
					if (input.type === SignalType.Float32Array) {
						const a = input.getFloat32ArrayValue();

						if (a.length === 3) {
							return new VectorSequence(new Float32Array([a[0]]), new Float32Array([a[1]]), new Float32Array([a[2]]));
						}
						else {
							throw new ProcessingError(`Expected array of length 3, got array of length ${ a.length }.`);
						}
					}
					else if (input.type === SignalType.VectorSequence) {
						return input.getVectorSequenceValue();
					}
					else if (input.type === SignalType.Segment) {
						return input.getSegmentValue().position;
					}
					else {
						throw new ProcessingError(`Expected array of length 3 or Marker or Segment. Got ${ input.typeToString }.`);
					}
				})
				.map(vs => this.applyProjection(vs))
			;

			this.exportUnit = ExportUnit.Radians;

			if (this.inputs.length === 3) {
				const v1 = inputs[1].subtract(inputs[0]);
				const v2 = inputs[1].subtract(inputs[2]);
				const angles = AngleUtil.computeAngleBetweenVectors(v1, v2);

				result.setValue<Float32Array>(angles);
			}
			else {
				// Normalize lines AB and CD
				const ab = inputs[1].subtract(inputs[0]);
				const cd = inputs[3].subtract(inputs[2]);
				const angles = AngleUtil.computeAngleBetweenVectors(ab, cd);

				result.setValue<Float32Array>(angles);
			}
		}
		else {
			throw new ProcessingError('Unexpected amount of inputs.');
		}

		if (this.unwrapIndex !== undefined) {
			// Apply unwrap to the resulting signal
			const range = (this.exportUnit === ExportUnit.Degrees) ? 360 : 2 * Math.PI;

			let signalArray = result.array;
			signalArray = signalArray.map(comp => AngleUtil.unwrapAngles(comp, this.unwrapIndex, range, range / 2));

			result.setValue(Signal.typeFromArray(result.type, signalArray));
		}
		
		return result;
	}

	applyProjection(vector: VectorSequence) {
		if (!this.coordinatePlane && !this.projectionPlane) {		
			return vector;
		};
		
		if (this.projectionPlane) {
			return PlaneSequence.project(vector, this.projectionPlane, true);
		} 

		const replacement = new Float32Array(vector.length).fill(0);

		switch (this.coordinatePlane) {
			case CoordinatePlane.XY:
				return new VectorSequence(vector.x, vector.y, replacement);
			case CoordinatePlane.XZ:
				return new VectorSequence(vector.x, replacement, vector.z);
			case CoordinatePlane.YZ:
				return new VectorSequence(replacement, vector.y, vector.z);
		}
	}
}

@StepClass({
	name: 'jointAngle',
	category: 'Angle',
	description: markdownFmt`
		Performs the same computation as ''angle'', but does not handle 
		three or four inputs.
	`,
	inputs: [
		{ type: ['Scalar', 'Series'] },
		{ type: ['Scalar', 'Series'], optional: true },
	],
	output: ['Scalar', 'Series'],
})
export class JointAngleStep extends AngleStep {
	async process(): Promise<Signal> {
		if (this.inputs.length === 1 || this.inputs.length === 2) {
			return super.process();
		}
		else {
			throw new ProcessingError(`Expected 1 or 2 inputs, got ${ this.inputs.length }.`);
		}
	}
}

@StepClass({
	name: 'angularVelocity',
	category: 'Angle',
	description: markdownFmt`
		This step calculates the joint angular velocity based on the 
		textbook Research Methods in Biomechanics (2nd Edition). 
		
		You can visit http://www.kwon3d.com/theory/euler/avel.html for 
		more details.

		This is different from calculating the first-order derivate of 
		the joint angle because each axis of the joint angle are 
		different from the axes of the segment coordinate systems.

		**Please consider which implementation would be correct to use 
		in your instance**.
	`,
	examples: markdownFmt`
		A first example when using the segment coordinate system
		'''
		- parameter: Pitching_Elbow_Ang_Vel
		  where: 
		    name: Pitching*
		  steps:
		    - angularVelocity: [RightArm, RightForeArm, RightArm, RightForeArm]
		'''
		
		A second example when using the Euler/Cardan sequence
		'''
		- parameter: Pitching_Shoulder_Ang_Vel
		  where: 
		    name: Pitching*
		  steps:
		    - angularVelocity: [RightShoulder, RightArm, Spine2, RightArm]
		      useRotationOrder: true
		      rotationOrder: zyz
		'''
	`,
	inputs: [
		{ type: ['Scalar', 'Series'], description: 'the parent segment' },
		{ type: ['Scalar', 'Series'], description: 'the segment' },
		{ type: ['Scalar', 'Series'], description: 'the reference segment' },
		{ type: ['Scalar', 'Series'], description: 'the resolution segment' },
	],
	options: [{
		name: 'useRotationOrder',
		type: 'Boolean',
		required: false,
		default: 'false',
		description: markdownFmt`
			If set to false it means that the angular velocity between the 
			segment and refernce segment is transformed to be expressed 
			into the resolution coordinate system.

			If set to true it means that angular velocity between the segment
			and refernce segment is transformed to be expressed into the 
			joint coordinate system using the Euler/Cardan sequence.
		`,
	}],
	output: ['Scalar', 'Series']
})
export class AngularVelocityStep extends AngleStep {
	useRotationOrder: boolean;
	rotationOrder: RotationOrder;

	init() {
		super.init();

		// Read options input
		const rotationOrderInput = this.getPropertyValue<string>('rotationOrder', PropertyType.String, false);
		this.useRotationOrder = this.getPropertyValue<boolean>('useRotationOrder', PropertyType.Boolean, false);

		if (this.useRotationOrder == undefined) {
			this.useRotationOrder = false;
		}
		else if (!isBoolean(this.useRotationOrder)) {
			throw new ProcessingError('Unrecognized value for useRotationOrder option: should be true or false.');
		}

		if (!this.useRotationOrder) {
			if (rotationOrderInput != undefined && rotationOrderInput.toUpperCase() in RotationOrder) {
				throw new ProcessingError('Cannot specify rotationOrder if useRotationOrder is false or missing.');
			}
		}

		if (this.useRotationOrder && rotationOrderInput == undefined) {
			this.rotationOrder = RotationOrder.XYZ;
		}
		else if (this.useRotationOrder && rotationOrderInput.toUpperCase() in RotationOrder) {
			this.rotationOrder = rotationOrderInput.toUpperCase() as RotationOrder;
		}
	}

	async process(): Promise<Signal> {
		if (this.inputs.length != 4) {
			throw new ProcessingError(`Expected 4 inputs, got ${ this.inputs.length }.`);
		}

		for (let index = 0; index < this.inputs.length; index++) {
			if (this.inputs[index].type != SignalType.Segment) {
				throw new ProcessingError(`Expected segment input, got ${ this.inputs[index].typeToString }.`);
			}
			else if (this.inputs[index].frameRate == undefined) {
				throw new ProcessingError('Frame rate attached to the input is undefined.');
			}
		}

		// Get time period and number of frames
		const dt = 1 / this.inputs[0].frameRate;
		const nFrames = this.inputs[0].length;

		// Get segment data
		const sPar = this.inputs[0].getSegmentValue();
		const sSeg = this.inputs[1].getSegmentValue();
		const sRef = this.inputs[2].getSegmentValue();
		const sRes = this.inputs[3].getSegmentValue();

		// Create rotation matrices
		const rPar = MatrixSequence.createEmpty(nFrames);
		const rSeg = MatrixSequence.createEmpty(nFrames);
		const rRef = MatrixSequence.createEmpty(nFrames);
		const rRes = MatrixSequence.createEmpty(nFrames);
		const rParTemp = Matrix.identity();
		const rSegTemp = Matrix.identity();
		const rRefTemp = Matrix.identity();
		const rResTemp = Matrix.identity();

		for (let frame = 0; frame < nFrames; frame++) {
			Matrix.fromQuaternion(rParTemp, sPar.rotation.getQuaternionAtFrame(frame + 1));
			rPar.setMatrixAtFrame(frame + 1, Matrix.transpose(rParTemp, rParTemp));
			Matrix.fromQuaternion(rSegTemp, sSeg.rotation.getQuaternionAtFrame(frame + 1));
			rSeg.setMatrixAtFrame(frame + 1, Matrix.transpose(rSegTemp, rSegTemp));
			Matrix.fromQuaternion(rRefTemp, sRef.rotation.getQuaternionAtFrame(frame + 1));
			rRef.setMatrixAtFrame(frame + 1, Matrix.transpose(rRefTemp, rRefTemp));
			Matrix.fromQuaternion(rResTemp, sRes.rotation.getQuaternionAtFrame(frame + 1));
			rRes.setMatrixAtFrame(frame + 1, Matrix.transpose(rResTemp, rResTemp));
		}

		// Calculate the rotation matrix derivatives
		const rSegDiff = MatrixSequence.fromRotationMatrixValues(
			KinematicsUtil.finiteDifference(rSeg.m00, dt, 1),
			KinematicsUtil.finiteDifference(rSeg.m01, dt, 1),
			KinematicsUtil.finiteDifference(rSeg.m02, dt, 1),
			KinematicsUtil.finiteDifference(rSeg.m10, dt, 1),
			KinematicsUtil.finiteDifference(rSeg.m11, dt, 1),
			KinematicsUtil.finiteDifference(rSeg.m12, dt, 1),
			KinematicsUtil.finiteDifference(rSeg.m20, dt, 1),
			KinematicsUtil.finiteDifference(rSeg.m21, dt, 1),
			KinematicsUtil.finiteDifference(rSeg.m22, dt, 1)
		);

		const rRefDiff = MatrixSequence.fromRotationMatrixValues(
			KinematicsUtil.finiteDifference(rRef.m00, dt, 1),
			KinematicsUtil.finiteDifference(rRef.m01, dt, 1),
			KinematicsUtil.finiteDifference(rRef.m02, dt, 1),
			KinematicsUtil.finiteDifference(rRef.m10, dt, 1),
			KinematicsUtil.finiteDifference(rRef.m11, dt, 1),
			KinematicsUtil.finiteDifference(rRef.m12, dt, 1),
			KinematicsUtil.finiteDifference(rRef.m20, dt, 1),
			KinematicsUtil.finiteDifference(rRef.m21, dt, 1),
			KinematicsUtil.finiteDifference(rRef.m22, dt, 1)
		);

		// Calculate joint velocity
		const qdot = new VectorSequence(
			new Float32Array(nFrames).fill(NaN),
			new Float32Array(nFrames).fill(NaN),
			new Float32Array(nFrames).fill(NaN), this.inputs[0].frameRate);

		for (let frame = 0; frame < nFrames; frame++) {
			const rSegFrameTrans = new Matrix();
			const rRefFrameTrans = new Matrix();
			const omegaRSegFrame = new Matrix();
			const omegaRRefFrame = new Matrix();
			const rParFrame = rPar.getMatrixAtFrame(frame + 1);
			const rSegFrame = rSeg.getMatrixAtFrame(frame + 1);
			const rRefFrame = rRef.getMatrixAtFrame(frame + 1);
			const rResFrame = rRes.getMatrixAtFrame(frame + 1);

			Matrix.multiply(omegaRSegFrame, Matrix.transpose(rSegFrameTrans, rSegFrame), rSegDiff.getMatrixAtFrame(frame + 1));
			Matrix.multiply(omegaRRefFrame, Matrix.transpose(rRefFrameTrans, rRefFrame), rRefDiff.getMatrixAtFrame(frame + 1));

			const omegaSegFrame = new Vector(omegaRSegFrame._m[9], omegaRSegFrame._m[2], omegaRSegFrame._m[4]);
			const omegaRefFrame = new Vector(omegaRRefFrame._m[9], omegaRRefFrame._m[2], omegaRRefFrame._m[4]);

			const omegaSegRefFrame = new Vector(omegaSegFrame.x - omegaRefFrame.x, omegaSegFrame.y - omegaRefFrame.y, omegaSegFrame.z - omegaRefFrame.z);

			if (this.useRotationOrder) {
				const { i, j, k } = Euler.getNumericRotationOrder(this.rotationOrder);
				const components = ['x', 'y', 'z'];

				const vProx = new Vector(rParFrame.get(i, 0), rParFrame.get(i, 1), rParFrame.get(i, 2));
				const vDist = new Vector(rSegFrame.get(k, 0), rSegFrame.get(k, 1), rSegFrame.get(k, 2));
				const vFloat = new Vector(NaN, NaN, NaN);
				Vector.cross(vFloat, vDist, vProx);
				const vFloatNorm = Vector.norm(vFloat);
				vFloat.x = vFloat.x / vFloatNorm;
				vFloat.y = vFloat.y / vFloatNorm;
				vFloat.z = vFloat.z / vFloatNorm;

				const out = new Vector(NaN, NaN, NaN);
				if (i == k) {
					out.x = Vector.dot(vProx, omegaSegRefFrame);
					out.y = Vector.dot(vFloat, omegaSegRefFrame);
					out.z = Vector.dot(vDist, omegaSegRefFrame);
				}
				else {
					out[components[i]] = Vector.dot(vProx, omegaSegRefFrame);
					out[components[j]] = Vector.dot(vFloat, omegaSegRefFrame);
					out[components[k]] = Vector.dot(vDist, omegaSegRefFrame);
				}

				qdot.x[frame] = out.x * 180 / Math.PI;
				qdot.y[frame] = out.y * 180 / Math.PI;
				qdot.z[frame] = out.z * 180 / Math.PI;
			}
			else {
				const qdotFrame = new Vector(NaN, NaN, NaN);
				Vector.transformMatrix(qdotFrame, omegaSegRefFrame, rResFrame);
				qdot.x[frame] = qdotFrame.x * 180 / Math.PI;
				qdot.y[frame] = qdotFrame.y * 180 / Math.PI;
				qdot.z[frame] = qdotFrame.z * 180 / Math.PI;
			}
		}

		const result: Signal = this.inputs[0].clone(false);
		result.setValue<VectorSequence>(qdot);
		return result;
	}
}

@StepClass({
	name: 'jointAngleVelocity',
	category: 'Angle',
	description: markdownFmt`
		Performs the same computation as ''angularVelocity''.
	`,
	examples: markdownFmt`
		A first example when using the segment coordinate system
		'''
		- parameter: Pitching_Elbow_Ang_Vel
		  where: 
		    name: Pitching*
		  steps:
		    - angularVelocity: [RightArm, RightForeArm, RightArm, RightForeArm]
		'''
		
		A second example when using the Euler/Cardan sequence
		'''
		- parameter: Pitching_Shoulder_Ang_Vel
		  where: 
		    name: Pitching*
		  steps:
		    - angularVelocity: [RightShoulder, RightArm, Spine2, RightArm]
		      useRotationOrder: true
		      rotationOrder: zyz
		'''
	`,
	inputs: [
		{ type: ['Scalar', 'Series'], description: 'the parent segment' },
		{ type: ['Scalar', 'Series'], description: 'the segment' },
		{ type: ['Scalar', 'Series'], description: 'the reference segment' },
		{ type: ['Scalar', 'Series'], description: 'the resolution segment' },
	],
	options: [{
		name: 'useRotationOrder',
		type: 'Boolean',
		required: false,
		default: 'false',
		description: markdownFmt`
			If set to false it means that the angular velocity between the 
			segment and refernce segment is transformed to be expressed 
			into the resolution coordinate system.

			If set to true it means that angular velocity between the segment
			and refernce segment is transformed to be expressed into the 
			joint coordinate system using the Euler/Cardan sequence.
		`,
	}],
	output: ['Scalar', 'Series'],
})
export class JointAngleVelocityStep extends AngularVelocityStep {
}