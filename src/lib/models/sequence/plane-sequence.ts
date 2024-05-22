import { Plane } from '../spatial/plane';
import { Vector } from '../spatial/vector';

import { ISequence } from './sequence';
import { VectorSequence } from './vector-sequence';

export class PlaneSequence implements ISequence {
	readonly typeName = 'PlaneSequence';
	
	array: TypedArray[];
	components = ['a', 'b', 'c', 'd'];

	/**
	 * Create a PlaneSequence with the given values.
	 * 
	 * @param a The first component of the plane.
	 * @param b The second component of the plane.
	 * @param c The third component of the plane.
	 * @param d The fourth component of the plane.
	 */
	constructor(
		/** The a component. */
		public a: TypedArray, 

		/** The b component. */
		public b: TypedArray, 

		/** The c component. */
		public c: TypedArray, 

		/** The d component. */
		public d: TypedArray,
	) {
		this.array = [this.a, this.b, this.c, this.d];
	}

	/**
	 * Get the number of elements in this sequence.
	 */
	get length() { return this.a.length; };

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/** 
	 * Returns a [[Plane]] for a specified frame.
	 * 
	 * If the `result` parameter is passed, this method will update and return
	 * that Plane instance instead of creating a new instance.
	 * 
	 * @param frame The frame index.
	 * @param result The plane to update and return.
	 * @returns A plane at the specified frame.
	 * @remark The frame index is 1-based.
	 */
	getPlaneAtFrame(frame: number, result?: Plane): Plane {
		const frameIndex = Math.min(frame, this.a.length) - 1;

		if (result) {
			result.a = this.a[frameIndex];
			result.b = this.b[frameIndex];
			result.c = this.c[frameIndex];
			result.d = this.d[frameIndex];

			return result;
		}

		return new Plane(this.a[frameIndex], this.b[frameIndex], this.c[frameIndex], this.d[frameIndex]);
	}

	/**
	 * Returns a [[PlaneSequence]] from an array, where 
	 * `a`, `b`, `c`, and `d` are included.
	 * 
	 * @param components The components of the plane.
	 * @returns A new PlaneSequence.
	 */
	static fromArray([a, b, c, d]: TypedArray[]) {
		return new PlaneSequence(a, b, c, d);
	}

	/**
	 * Generates a plane sequence given a sequence of 
	 * 3 points on the plane.
	 * 
	 * @param v1 The first point on the plane.
	 * @param v2 The second point on the plane.
	 * @param v3 The third point on the plane.
	 * @returns A plane sequence.
	 */
	static fromVectorSequence(v1: VectorSequence, v2: VectorSequence, v3: VectorSequence): PlaneSequence {
		const length = Math.min(v1.length, v2.length, v3.length);

		const a = new Float32Array(length);
		const b = new Float32Array(length);
		const c = new Float32Array(length);
		const d = new Float32Array(length);

		for (let i = 0; i < length; i++) {
			Plane.fromVector(v1.getVectorAtFrame(i + 1), v2.getVectorAtFrame(i + 1), v3.getVectorAtFrame(i + 1), Plane.tmpPlane1);

			a[i] = Plane.tmpPlane1.a;
			b[i] = Plane.tmpPlane1.b;
			c[i] = Plane.tmpPlane1.c;
			d[i] = Plane.tmpPlane1.d;
		}

		return new PlaneSequence(a, b, c, d);
	}

	/**
	 * Orthogonally projects a point sequence onto a plane sequence 
	 * and returns the location of the projected points.
	 * 
	 * @param point Point sequence to project
	 * @param plane Plane sequence on which the point is projected
	 * @param allowSinglePlane If true and the plane sequence is of length 1, the same plane is applied for all frames of the vector sequence.
	 * @returns The projected point as a VectorSequence.
	 */
	static project(point: VectorSequence, plane: PlaneSequence, allowSinglePlane = false): VectorSequence {
		let length = Math.min(point.length, plane.length);
		
		if (allowSinglePlane && plane.length === 1) {
			length = point.length;

			Plane.tmpPlane1.a = plane.a[0];
			Plane.tmpPlane1.b = plane.b[0];
			Plane.tmpPlane1.c = plane.c[0];
			Plane.tmpPlane1.d = plane.d[0];
		}

		const x = new Float32Array(length);
		const y = new Float32Array(length);
		const z = new Float32Array(length);

		for (let i = 0; i < length; i++) {
			Vector.tmpVec1.x = point.x[i];
			Vector.tmpVec1.y = point.y[i];
			Vector.tmpVec1.z = point.z[i];

			if (plane.length > 1 || !allowSinglePlane) {
				Plane.tmpPlane1.a = plane.a[i];
				Plane.tmpPlane1.b = plane.b[i];
				Plane.tmpPlane1.c = plane.c[i];
				Plane.tmpPlane1.d = plane.d[i];
			}
			
			Plane.project(Vector.tmpVec1, Plane.tmpPlane1, Vector.tmpVec2);

			x[i] = Vector.tmpVec2.x;
			y[i] = Vector.tmpVec2.y;
			z[i] = Vector.tmpVec2.z;
		}

		return new VectorSequence(x, y, z);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static isPlaneSequence(object: any): object is PlaneSequence {
		return object?.typeName === 'PlaneSequence';
	}

}