import { mean } from 'lodash';

import { Inputs } from '../models/inputs';
import { ISpaceNode } from '../models/node-interface';
import { PropertyType } from '../models/property';
import { Segment } from '../models/segment';
import { MatrixSequence } from '../models/sequence/matrix-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { SignalType } from '../models/signal';
import { Matrix } from '../models/spatial/matrix';
import { Quaternion } from '../models/spatial/quaternion';
import { Vector } from '../models/spatial/vector';
import { StepClass } from '../step-registry';
import { ProcessingError } from '../utils/processing-error';
import { VectorInputParser } from '../utils/vector-input-parser';

import { BaseStep } from './base-step';

@StepClass({ name: 'space' })
export class Space extends BaseStep {
	protected _quaternion: Quaternion;
	protected _rotationMatrix: MatrixSequence;
	protected _primaryAxis: VectorSequence;
	protected _secondaryAxis: VectorSequence;
	protected origin: VectorSequence = new VectorSequence(new Float32Array([0]), new Float32Array([0]), new Float32Array([0]));
	private stringValue = undefined;
	
	constructor(public readonly node: ISpaceNode, public allInputs?: Inputs) {
		super(node, allInputs);

		this.name = node.name;

		if (node.hasProperty('alignWithSegment')) {
			const alignSegment = this.getPropertySignalValue('alignWithSegment.segment');

			if (alignSegment && alignSegment[0].type === SignalType.Segment) {
				this.createRotationMatrixAndQuaternionFromSegment(alignSegment[0].getSegmentValue());
			}
		}
		else {
			if (node.hasProperty('origin') && !node.hasProperty('primaryAxis')) {
				throw new ProcessingError('Property \'origin\' will not work on it\'s own, it requires \'primaryAxis\' to work.');
			}

			if (node.hasProperty('origin') && !node.hasProperty('secondaryAxis')) {
				throw new ProcessingError('Property \'origin\' will not work on it\'s own, it requires \'secondaryAxis\' to work.');
			}

			if (node.hasProperty('primaryAxis') && !node.hasProperty('secondaryAxis')) {
				throw new ProcessingError('Property \'primaryAxis\' will not work on it\'s own, it requires \'secondaryAxis\' to work.');
			}

			if (node.hasProperty('secondaryAxis') && !node.hasProperty('primaryAxis')) {
				throw new ProcessingError('Property \'secondaryAxis\' will not work on it\'s own, it requires \'primaryAxis\' to work.');
			}

			if (node.hasProperty('primaryAxis') && node.hasProperty('secondaryAxis')) {
				if (node.hasProperty('origin')) {
					this.origin = VectorInputParser.parse('origin', this.getPropertySignalValue('origin'))[0];
				}

				const primaryAxisVectors = VectorInputParser.parse('primaryAxis', this.getPropertySignalValue('primaryAxis'));
				const secondaryAxisVectors = VectorInputParser.parse('secondaryAxis', this.getPropertySignalValue('secondaryAxis'));
				const order = this.node.getPropertyValue<string>('order', PropertyType.String, false, 'xy');

				this._primaryAxis = primaryAxisVectors.length > 1
					? primaryAxisVectors[1].subtract(primaryAxisVectors[0])
					: primaryAxisVectors[0];

				this._secondaryAxis = secondaryAxisVectors.length > 1
					? secondaryAxisVectors[1].subtract(secondaryAxisVectors[0])
					: secondaryAxisVectors[0];

				this.rotationMatrix = MatrixSequence.fromVectors(this._primaryAxis, this._secondaryAxis, order);
			}
		}
	}

	// Computes a rotation matrix that can be used to get coordinates in this
	// space and a quaternion that can be used to compute angles relative to
	// this space.
	// Expects segment to have Y - forward, X - to the right and Z - up.
	createRotationMatrixAndQuaternionFromSegment(segment: Segment) {
		const avgQuat = new Quaternion(
			mean(segment.rotation.x),
			mean(segment.rotation.y),
			mean(segment.rotation.z),
			mean(segment.rotation.w)
		);

		const y = new Vector(0, 1, 0);
		const vector = new Vector(0, 0, 0);

		Vector.transformQuat(y, avgQuat, vector);

		vector.z = 0;

		const angle = Vector.angle(y, vector) * 180 / Math.PI;

		this._quaternion = new Quaternion(0, 0, 0, 1);

		if (angle > 45 && angle <= 135) {
			if (vector.x > 0) {
				// Segment points in positive X.
				this.rotationMatrix = Space.getRotationMatrixAroundZ(90);
				this._quaternion = Quaternion.fromRotationMatrix(Matrix.fromRotationMatrix(0, -1, 0, 1, 0, 0, 0, 0, 1), this._quaternion);
				this.stringValue = 'Forward direction: Positive X. Rotation around world Z = 90 deg';
			}
			else {
				// Segment points in negative X.
				this.rotationMatrix = Space.getRotationMatrixAroundZ(-90);
				this._quaternion = Quaternion.fromRotationMatrix(Matrix.fromRotationMatrix(0, 1, 0, -1, 0, 0, 0, 0, 1), this._quaternion);
				this.stringValue = 'Forward direction: Negative X. Rotation around world Z = -90 deg';
			}
		}
		else {
			if (vector.y > 0) {
				// Segment points in positive Y.
				this.rotationMatrix = Space.getRotationMatrixAroundZ(0);
				this._quaternion = Space.getDefaultQuaternion();
				this.stringValue = 'Forward direction: Positive Y. Rotation around world Z = 0 deg';
			}
			else {
				// Segment points in negative Y.
				this.rotationMatrix = Space.getRotationMatrixAroundZ(180);
				this._quaternion = Quaternion.fromRotationMatrix(Matrix.fromRotationMatrix(-1, 0, 0, 0, -1, 0, 0, 0, 1), this._quaternion);
				this.stringValue = 'Forward direction: Negative Y. Rotation around world Z = 180 deg';
			}
		}
	}

	public static getDefaultQuaternion(): Quaternion {
		return Quaternion.fromRotationMatrix(Matrix.fromRotationMatrix(1, 0, 0, 0, 1, 0, 0, 0, 1), new Quaternion(0, 0, 0, 1));
	}

	public static getRotationMatrixAroundZ(deg: number) {
		const radians = deg / 180 * Math.PI;
		const sin = Math.sin(radians);
		const cos = Math.cos(radians);

		return new MatrixSequence(
			new Float32Array([cos]),
			new Float32Array([-sin]),
			new Float32Array([0]),
			new Float32Array([0]),
			new Float32Array([sin]),
			new Float32Array([cos]),
			new Float32Array([0]),
			new Float32Array([0]),
			new Float32Array([0]),
			new Float32Array([0]),
			new Float32Array([1]),
			new Float32Array([0]),
			new Float32Array([0]),
			new Float32Array([0]),
			new Float32Array([0]),
			new Float32Array([1])
		);
	}

	get primaryAxis(): VectorSequence {
		return this._primaryAxis;
	}

	// Get a quaternion that can be used to get the relative angle of an object
	// in this space.
	get quaternion(): Quaternion {
		return this._quaternion;
	}

	get rotationMatrix(): MatrixSequence {
		return this._rotationMatrix;
	}

	set rotationMatrix(mat: MatrixSequence) {
		this._rotationMatrix = mat;
	}

	get secondaryAxis(): VectorSequence {
		return this._secondaryAxis;
	}

	getSegmentInLocalSpace(worldSegment: Segment): Segment {
		const segmentMatrix = Matrix.tmpMat1;
		const multipliedMatrix = Matrix.tmpMat2;
		const resultQuat = Quaternion.tmpQuat1;
		const resultVec = Vector.tmpVec1;

		const x = new Float32Array(worldSegment.length);
		const y = new Float32Array(worldSegment.length);
		const z = new Float32Array(worldSegment.length);
		const rw = new Float32Array(worldSegment.length);
		const rx = new Float32Array(worldSegment.length);
		const ry = new Float32Array(worldSegment.length);
		const rz = new Float32Array(worldSegment.length);
		const result = Segment.fromArray(worldSegment.name, [x, y, z, rx, ry, rz, rw]);

		for (let i = 0; i < worldSegment.length; i++) {
			// TODO: Use reference.
			const worldSegmentFrame = worldSegment.getTransformationAtFrame(i + 1);

			if (isNaN(worldSegmentFrame.position.x)) {
				x[i] = y[i] = z[i] = rw[i] = rx[i] = ry[i] = rz[i] = NaN;

				continue;
			}

			// Handle position.
			const j = Math.min(i, this.origin.length - 1);
			const segmentPositionOriginOffset = worldSegmentFrame.position.subtractToRef(this.origin.getVectorAtFrame(j + 1), Vector.tmpVec1);

			Vector.transformMatrix(segmentPositionOriginOffset, Matrix.transpose(this._rotationMatrix.getMatrixAtFrame(i + 1), Matrix.tmpMat3), resultVec);

			x[i] = resultVec.x;
			y[i] = resultVec.y;
			z[i] = resultVec.z;

			// Handle rotation.
			Matrix.fromQuaternion(worldSegmentFrame.rotation, segmentMatrix);
			Matrix.multiply(Matrix.tmpMat3, segmentMatrix, multipliedMatrix);
			Quaternion.fromRotationMatrix(multipliedMatrix, resultQuat);

			rw[i] = resultQuat.w;
			rx[i] = resultQuat.x;
			ry[i] = resultQuat.y;
			rz[i] = resultQuat.z;
		}

		return result;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getPointsInWorldSpace(localPoints: VectorSequence): VectorSequence {
		// Todo
		return undefined;
	}

	getPointsInLocalSpace(worldPoints: VectorSequence): VectorSequence {
		const x = new Float32Array(worldPoints.length);
		const y = new Float32Array(worldPoints.length);
		const z = new Float32Array(worldPoints.length);

		for (let i = 0; i < worldPoints.length; i++) {
			if (isNaN(worldPoints.x[i])) {
				x[i] = y[i] = z[i] = NaN;
			}
			else {
				const vec = Vector.tmpVec1;
				const worldPointFrame = worldPoints.getVectorAtFrame(i + 1, Vector.tmpVec2);
				const j = Math.min(i, this.origin.length - 1);
				const pointFrameOriginOffset = worldPointFrame.subtractToRef(this.origin.getVectorAtFrame(j + 1), Vector.tmpVec2);

				Vector.transformMatrix(pointFrameOriginOffset, Matrix.transpose(this._rotationMatrix.getMatrixAtFrame(i + 1), Matrix.tmpMat1), vec);

				x[i] = vec.x;
				y[i] = vec.y;
				z[i] = vec.z;
			}
		}

		return new VectorSequence(x, y, z);
	}

	toString() {
		return this.stringValue;
	}
}