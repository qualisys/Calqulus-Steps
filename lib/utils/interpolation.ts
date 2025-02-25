export class Interpolation {

	static lerp(x: number, y: number, a: number) {
		return x * (1 - a) + y * a;
	}

	public static lerpArray(a: TypedArray, length: number): TypedArray {
		const k = (a.length - 1.0) / (length - 1.0);
		const out = new Float32Array(length);

		for (let i = 0; i < length; i++) {
			// Calculate the exact position in the original array.
			const exactPos = k * i;
        
			// Calculate the indices to interpolate between.
			const indexLower = Math.floor(exactPos);
			const indexUpper = Math.min(Math.ceil(exactPos), a.length - 1);
        
			// Calculate the interpolation factor
			const alpha = exactPos - indexLower;

			// Interpolate and store in the result array
			out[i] = this.lerp(a[indexLower], a[indexUpper], alpha);
		}

		return out;
	}

	public static slerp(q1: TypedArray, q2: TypedArray, a: number) {
		if (q1.length !== 4 || q2.length !== 4) {
			throw new Error('Each quaternion must have 4 components.');
		}
	  
		// Compute the dot product (angle between quaternions).
		let dot = q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3];

		// If the dot product is negative, invert q2 to take the shorter path.
		if (dot < 0) {
			q2 = q2.map(c => -c);
			dot = -dot;
		}
	  
		// Clamp dot to avoid numerical errors.
		dot = Math.min(Math.max(dot, -1), 1);

		const theta = Math.acos(dot);
		const sinTheta = Math.sin(theta);
		
		// If sinTheta is very small, fall back to linear interpolation.
		if (Math.abs(sinTheta) < 1e-6) {
		  return new Float32Array([
				q1[0] * (1 - a) + q2[0] * a,
				q1[1] * (1 - a) + q2[1] * a,
				q1[2] * (1 - a) + q2[2] * a,
				q1[3] * (1 - a) + q2[3] * a,
		  ]);
		}
	  
		// Perform spherical linear interpolation.
		const factor1 = Math.sin((1 - a) * theta) / sinTheta;
		const factor2 = Math.sin(a * theta) / sinTheta;
	  
		return new Float32Array([
		  q1[0] * factor1 + q2[0] * factor2,
		  q1[1] * factor1 + q2[1] * factor2,
		  q1[2] * factor1 + q2[2] * factor2,
		  q1[3] * factor1 + q2[3] * factor2,
		]);
	}

	public static slerpArray(quats: TypedArray[], outLength: number): TypedArray[] {
		if (quats?.length < 2) {
			throw new Error('Need at least two quaternions for interpolation.');
		}

		const scale = (quats.length - 1) / (outLength - 1);
		const result: Float32Array[] = new Array(outLength);
	  
	  
		for (let i = 0; i < outLength; i++) {
		  const pos = scale * i;
		  const lower = Math.floor(pos);
		  const upper = Math.min(lower + 1, quats.length - 1);
		  const alpha = pos - lower;
		  result[i] = this.slerp(quats[lower], quats[upper], alpha);
		}

		return result;
	  }

}