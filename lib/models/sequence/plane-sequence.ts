import { Plane } from "../spatial/plane";
import { Vector } from "../spatial/vector";

import { ISequence } from "./sequence";
import { VectorSequence } from "./vector-sequence";

export class PlaneSequence implements ISequence {
	
	array = [this.a, this.b, this.c, this.d];
	components = ['a', 'b', 'c', 'd'];

	constructor(
		public a: TypedArray, 
		public b: TypedArray, 
		public c: TypedArray, 
		public d: TypedArray,
	) {}

	get length() { return this.a.length };

	getComponent(component: string): TypedArray {
		const index = this.components.indexOf(component);

		return this.array[index];
	}

	/** 
	 * Returns a [[Plane]] for a specified frame.
	 * 
	 * If a Plane is passed as `ref`, the function will 
	 * update and return it instead of creating a new instance.
	 * 
	 * @remark The frame index is 1-based.
	 */
	getPlaneAtFrame(frame: number, ref?: Plane): Plane {
		const frameIndex = Math.min(frame, this.a.length) - 1;

		if (ref) {
			ref.a = this.a[frameIndex];
			ref.b = this.b[frameIndex];
			ref.c = this.c[frameIndex];
			ref.d = this.d[frameIndex];

			return ref;
		}

		return new Plane(this.a[frameIndex], this.b[frameIndex], this.c[frameIndex], this.d[frameIndex]);
	}

	/**
	 * Returns a [[PlaneSequence]] from an array, where 
	 * `a`, `b`, `c`, and `d` are included.
	 * @param param0 
	 */
	static fromArray([a, b, c, d]: TypedArray[]) {
		return new PlaneSequence(a, b, c, d);
	}

	/**
	 * Generates a plane sequence given a sequence of 
	 * 3 points on the plane.
	 * @param v1 
	 * @param v2 
	 * @param v3 
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
	 * @param point Point sequence to project
	 * @param plane Plane sequence on which the point is projected
	 */
	static project(point: VectorSequence, plane: PlaneSequence): VectorSequence {
		const length = Math.min(point.length, plane.length);

		const x = new Float32Array(length);
		const y = new Float32Array(length);
		const z = new Float32Array(length);

		for (let i = 0; i < length; i++) {
			Vector.tmpVec1.x = point.x[i];
			Vector.tmpVec1.y = point.y[i];
			Vector.tmpVec1.z = point.z[i];

			Plane.tmpPlane1.a = plane.a[i];
			Plane.tmpPlane1.b = plane.b[i];
			Plane.tmpPlane1.c = plane.c[i];
			Plane.tmpPlane1.d = plane.d[i];
			
			Plane.project(Vector.tmpVec1, Plane.tmpPlane1, Vector.tmpVec2);

			x[i] = Vector.tmpVec2.x;
			y[i] = Vector.tmpVec2.y;
			z[i] = Vector.tmpVec2.z;
		}

		return new VectorSequence(x, y, z);
	}

}