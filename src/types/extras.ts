type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type NumericArray = number[] | TypedArray;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Array<T> {
	filter<U extends T>(pred: (a: T) => a is U): U[];
}