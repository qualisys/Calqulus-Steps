type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;
type NumericArray = number[] | TypedArray;

interface Array<T> {
    filter<U extends T>(pred: (a: T) => a is U): U[];
}