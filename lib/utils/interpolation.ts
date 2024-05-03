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
}