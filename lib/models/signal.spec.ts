import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { Space } from '../processing/space';

import { Marker } from './marker';
import { Segment } from './segment';
import { PlaneSequence } from './sequence/plane-sequence';
import { QuaternionSequence } from './sequence/quaternion-sequence';
import { VectorSequence } from './sequence/vector-sequence';
import { ResultType, Signal, SignalType } from './signal';

// Various test data
const floatVal = 0.123;
const fakeArray = Float32Array.from([1, 2, 3]);
const fakeNestedArray = [fakeArray, fakeArray, fakeArray, fakeArray];
const fakeUIntArray = Uint32Array.from([1, 2, 3]);
const frameRate = 300;

const testString = 'test';

const vecSeq = new VectorSequence(fakeArray, fakeArray, fakeArray, frameRate);
const markerSeq = new Marker('test', fakeArray, fakeArray, fakeArray, frameRate);
const quatSeq = new QuaternionSequence(fakeArray, fakeArray, fakeArray, fakeArray);
const segment = new Segment('head', vecSeq, quatSeq, frameRate);
const plane = new PlaneSequence(fakeArray, fakeArray, fakeArray, fakeArray);

// Signal variants
const s1_uintarr = new Signal(fakeUIntArray, frameRate);
const s2_uintarr = new Signal().setValue(fakeUIntArray);
const s1_f32 = new Signal(floatVal, frameRate);
const s2_f32 = new Signal().setValue(floatVal);
const s1_f32arr = new Signal(fakeArray, frameRate);
const s2_f32arr = new Signal().setValue(fakeArray);
const s1_f32arrarr = new Signal(fakeNestedArray, frameRate);
const s2_f32arrarr = new Signal().setValue(fakeNestedArray);
const s1_numarr = new Signal([...fakeArray], frameRate);
const s2_numarr = new Signal().setValue([...fakeArray]);
const s1_segment = new Signal(segment, frameRate);
const s2_segment = new Signal().setValue(segment);
const s1_string = new Signal(testString, frameRate);
const s2_string = new Signal().setValue(testString);
const s1_vecseq = new Signal(vecSeq, frameRate);
const s2_vecseq = new Signal().setValue(vecSeq);
const s1_plane = new Signal(plane, frameRate);
const s2_plane = new Signal().setValue(plane);
const s1_marker = new Signal(markerSeq, frameRate);
const s2_marker = new Signal().setValue(markerSeq);
const s1_undef = new Signal(undefined, frameRate);
const s2_undef = new Signal().setValue(undefined);

// Example cycles
const cycles = [{
	start: 2,
	end: 5,
}, {
	start: 7,
	end: 8,
}];

// Skeleton setup
const hipsTowardsY = new Segment('Hips', 
	new VectorSequence( f32(-323.022, -322.758), f32(1090.597, 1089.995), f32(1000.207, 998.027) ),
	new QuaternionSequence( f32(-0.077736, -0.075664), f32(-0.032416, -0.035248), f32(-0.022033, -0.02112), f32(0.996203, 0.996286) )
);

const signalNegX = new Signal(hipsTowardsY);
const space = mockStep(Space, [], { 'alignWithSegment.segment': [signalNegX] });

/**
 * Constructor / initializer tests.
 */

test('Signal - Uint32Array constructor', (t) => {
	t.assert(s1_uintarr.type === s2_uintarr.type && s1_uintarr.type === SignalType.Uint32Array);
	t.is(s1_uintarr.typeToString, 'Uint32Array');
	t.is(s1_uintarr.frameRate, frameRate);
	t.is(s1_uintarr.length, fakeUIntArray.length);
	t.is(s1_uintarr.getValue(), fakeUIntArray);
	t.is(s1_uintarr.components, undefined);
});

test('Signal - Float32 constructor', (t) => {
	t.assert(s1_f32.type === s2_f32.type && s1_f32.type === SignalType.Float32);
	t.is(s1_f32.typeToString, 'Float32');
	t.is(s1_f32.frameRate, frameRate);
	t.is(s1_f32.length, 1);
	t.is(s1_f32.getValue(), floatVal);
	t.is(s1_f32.components, undefined);
});

test('Signal - Float32Array constructor', (t) => {
	t.assert(s1_f32arr.type === s2_f32arr.type && s1_f32arr.type === SignalType.Float32Array);
	t.is(s1_f32arr.typeToString, 'Float32Array');
	t.is(s1_f32arr.frameRate, frameRate);
	t.is(s1_f32arr.length, fakeArray.length);
	t.is(s1_f32arr.getValue(), fakeArray);
	t.is(s1_f32arr.components, undefined);
});

test('Signal - number[] constructor', (t) => {
	t.assert(s1_numarr.type === s2_numarr.type && s1_numarr.type === SignalType.Float32Array);
	t.is(s1_numarr.typeToString, 'Float32Array');
	t.is(s1_numarr.frameRate, frameRate);
	t.is(s1_numarr.length, fakeArray.length);
	t.deepEqual(s1_numarr.getValue(), fakeArray);
	t.is(s1_numarr.components, undefined);
});

test('Signal - Float32ArrayArray constructor', (t) => {
	t.assert(s1_f32arrarr.type === s2_f32arrarr.type && s1_f32arrarr.type === SignalType.Float32ArrayArray);
	t.is(s1_f32arrarr.typeToString, 'Float32Array[]');
	t.is(s1_f32arrarr.frameRate, frameRate);
	t.is(s1_f32arrarr.length, fakeNestedArray[0].length);
	t.is(s1_f32arrarr.getValue(), fakeNestedArray);
	t.is(s1_f32arrarr.components, undefined);
});

test('Signal - Segment constructor', (t) => {
	t.assert(s1_segment.type === s2_segment.type && s1_segment.type === SignalType.Segment);
	t.is(s1_segment.typeToString, 'Segment');
	t.is(s1_segment.frameRate, frameRate);
	t.is(s1_segment.length, segment.length);
	t.is(s1_segment.getValue(), segment);
	t.is(s1_segment.components, segment.components);
});

test('Signal - String constructor', (t) => {
	t.assert(s1_string.type === s2_string.type && s1_string.type === SignalType.String);
	t.is(s1_string.typeToString, 'String');
	t.is(s1_string.frameRate, frameRate);
	t.is(s1_string.length, testString.length);
	t.is(s1_string.getValue(), testString);
	t.is(s1_string.components, undefined);
});

test('Signal - VectorSequence constructor', (t) => {
	t.assert(s1_vecseq.type === s2_vecseq.type && s1_vecseq.type === SignalType.VectorSequence);
	t.is(s1_vecseq.typeToString, 'VectorSequence');
	t.is(s1_vecseq.frameRate, frameRate);
	t.is(s1_vecseq.length, vecSeq.length);
	t.is(s1_vecseq.getValue(), vecSeq);
	t.is(s1_vecseq.components, vecSeq.components);
});

test('Signal - PlaneSequence constructor', (t) => {
	t.assert(s1_plane.type === s2_plane.type && s1_plane.type === SignalType.PlaneSequence);
	t.is(s1_plane.typeToString, 'PlaneSequence');
	t.is(s1_plane.length, plane.length);
	t.is(s1_plane.getValue(), plane);
	t.is(s1_plane.components, plane.components);
});

test('Signal - Marker constructor', (t) => {
	t.assert(s1_marker.type === s2_marker.type && s1_marker.type === SignalType.VectorSequence);
	t.is(s1_marker.typeToString, 'VectorSequence');
	t.is(s1_marker.frameRate, frameRate);
	t.is(s1_marker.length, markerSeq.length);
	t.is(s1_marker.getValue(), markerSeq);
	t.is(s1_marker.components, markerSeq.components);
});

test('Signal - undefined constructor', (t) => {
	t.assert(s1_undef.type === s2_undef.type && s1_undef.type === undefined);
	t.is(s1_undef.typeToString, 'Invalid type');
	t.is(s1_undef.frameRate, frameRate);
	t.is(s1_undef.length, undefined);
	t.is(s1_undef.getValue(), undefined);
	t.is(s1_undef.components, undefined);
});


/**
 * Static utility method tests.
 */

test('Signal - typeToString', (t) => {
	const types = [
		[SignalType.Uint32Array, 'Uint32Array'],
		[SignalType.Float32, 'Float32'],
		[SignalType.Float32Array, 'Float32Array'],
		[SignalType.Float32ArrayArray, 'Float32Array[]'],
		[SignalType.Segment, 'Segment'],
		[SignalType.String, 'String'],
		[SignalType.VectorSequence, 'VectorSequence'],
		[SignalType.PlaneSequence, 'PlaneSequence'],
		[undefined, 'Invalid type'],
	];

	for (const type of types) {
		t.is(Signal.typeToString(type[0] as SignalType), type[1] as string);
	}
});

test('Signal - typeToResultType', (t) => {
	const types = [
		[SignalType.Uint32Array, ResultType.Scalar],
		[SignalType.Float32, ResultType.Scalar],
		[SignalType.Float32Array, ResultType.Scalar],
		[SignalType.Float32ArrayArray, ResultType.Series],
		[SignalType.Segment, ResultType.Series],
		[SignalType.VectorSequence, ResultType.Series],
		[SignalType.PlaneSequence, ResultType.Series],
		[SignalType.String, undefined],
		[undefined, undefined],
	];

	for (const type of types) {
		t.is(Signal.typeToResultType(type[0] as SignalType), type[1] as ResultType);
	}
});

test('Signal - typeFromArray', (t) => {
	t.is(Signal.typeFromArray(SignalType.Uint32Array, [fakeUIntArray]), fakeUIntArray);
	t.is(Signal.typeFromArray(SignalType.Float32, [Float32Array.from([floatVal])]), Float32Array.from([floatVal])[0]);
	t.is(Signal.typeFromArray(SignalType.Float32Array, [fakeArray]), fakeArray);
	t.is(Signal.typeFromArray(SignalType.Float32ArrayArray, fakeNestedArray), fakeNestedArray);

	t.like(Signal.typeFromArray(SignalType.Segment, segment.array), {
		x: segment.x,
		y: segment.y,
		z: segment.z,
		rx: segment.rx,
		ry: segment.ry,
		rz: segment.rz,
		rw: segment.rw,
	});

	t.like(Signal.typeFromArray(SignalType.VectorSequence, vecSeq.array), {
		x: vecSeq.x,
		y: vecSeq.y,
		z: vecSeq.z,
	});

	t.like(Signal.typeFromArray(SignalType.PlaneSequence, plane.array), {
		a: plane.a,
		b: plane.b,
		c: plane.c,
		d: plane.d,
	});

	t.is(Signal.typeFromArray(SignalType.String, undefined), undefined);
	t.is(Signal.typeFromArray(undefined, undefined), undefined);
});


/**
 * Instance method tests.
 */

test('Signal - array', (t) => {
	t.deepEqual(s1_uintarr.array, [fakeUIntArray]);
	t.deepEqual(s1_f32.array, [Float32Array.from([floatVal])]);
	t.deepEqual(s1_f32arr.array, [fakeArray]);
	t.deepEqual(s1_f32arrarr.array, fakeNestedArray);
	t.deepEqual(s1_numarr.array, [fakeArray]);
	t.deepEqual(s1_segment.array, segment.array);
	t.deepEqual(s1_string.array, undefined);
	t.deepEqual(s1_vecseq.array, vecSeq.array);
	t.deepEqual(s1_marker.array, vecSeq.array);
	t.deepEqual(s1_plane.array, plane.array);
	t.deepEqual(s1_undef.array, undefined);
});

test('Signal - resultType', (t) => {
	t.is(s1_f32.resultType, ResultType.Scalar);

	s1_segment.resultType = ResultType.Scalar;
	t.is(s1_segment.resultType, ResultType.Scalar);

	s1_segment.resultType = ResultType.Series;
	t.is(s1_segment.resultType, ResultType.Series);
});

test('Signal - originalSignal', (t) => {
	s1_segment.originalSignal = s1_vecseq;
	t.is(s1_segment.originalSignal, s1_vecseq);

	s1_segment.originalSignal = undefined;
	t.is(s1_segment.originalSignal, undefined);
});

test('Signal - getting values', (t) => {
	t.is(s1_uintarr.getUint32ArrayValue(), fakeUIntArray);
	t.is(s1_f32.getNumberValue(), floatVal);
	t.is(s1_f32arr.getFloat32ArrayValue(), fakeArray);
	t.is(s1_f32arrarr.getFloat32ArrayArrayValue(), fakeNestedArray);
	t.deepEqual(s1_numarr.getFloat32ArrayValue(), fakeArray);
	t.is(s1_segment.getSegmentValue(), segment);
	t.is(s1_string.getStringValue(), testString);
	t.is(s1_vecseq.getVectorSequenceValue(), vecSeq);
	t.is(s1_marker.getVectorSequenceValue(), markerSeq);
	t.is(s1_segment.getVectorSequenceValue(), segment.positions);
	t.is(s1_plane.getPlaneSequenceValue(), plane);

	t.is(s1_undef.getVectorSequenceValue(), undefined);
});

test('Signal - getComponent', (t) => {
	// Valid components
	t.is(s1_segment.getComponent('x'), fakeArray);
	t.is(s1_segment.getComponent('y'), fakeArray);
	t.is(s1_segment.getComponent('z'), fakeArray);
	t.is(s1_segment.getComponent('rx'), fakeArray);
	t.is(s1_segment.getComponent('ry'), fakeArray);
	t.is(s1_segment.getComponent('rz'), fakeArray);
	t.is(s1_segment.getComponent('rw'), fakeArray);

	t.is(s1_vecseq.getComponent('x'), fakeArray);
	t.is(s1_vecseq.getComponent('y'), fakeArray);
	t.is(s1_vecseq.getComponent('z'), fakeArray);

	t.is(s1_plane.getComponent('a'), fakeArray);
	t.is(s1_plane.getComponent('b'), fakeArray);
	t.is(s1_plane.getComponent('c'), fakeArray);
	t.is(s1_plane.getComponent('d'), fakeArray);

	// Wrong component names
	t.is(s1_segment.getComponent('wrong'), undefined);
	t.is(s1_vecseq.getComponent('nonexistent'), undefined);
	t.is(s1_plane.getComponent('hello'), undefined);

	// Has no components
	t.is(s1_uintarr.getComponent('z'), undefined);
	t.is(s1_f32.getComponent('z'), undefined);
	t.is(s1_f32arr.getComponent('z'), undefined);
	t.is(s1_f32arrarr.getComponent('z'), undefined);
	t.is(s1_numarr.getComponent('z'), undefined);
	t.is(s1_undef.getComponent('z'), undefined);
});

test('Signal - getFrames', (t) => {
	const frames = Uint32Array.from([0, 2]);
	const frameValueComp = Float32Array.from([1, 3]);

	// Segment
	const segmentFrames = s1_segment.getFrames(frames);
	t.deepEqual(segmentFrames.array, [frameValueComp, frameValueComp, frameValueComp, frameValueComp, frameValueComp, frameValueComp, frameValueComp]);

	// Vector
	const vecFrames = s1_vecseq.getFrames(frames);
	t.deepEqual(vecFrames.array, [frameValueComp, frameValueComp, frameValueComp]);

	// Plane
	const planeFrames = s1_plane.getFrames(frames);
	t.deepEqual(planeFrames.array, [frameValueComp, frameValueComp, frameValueComp, frameValueComp]);

	// Marker
	const markerFrames = s1_marker.getFrames(frames);
	t.deepEqual(markerFrames.array, [frameValueComp, frameValueComp, frameValueComp]);

	// Float32Array
	const f32ArrFrames = s1_f32arr.getFrames(frames);
	t.deepEqual(f32ArrFrames.array, [frameValueComp]);

	// Uint32Array
	const uintArrFrames = s1_uintarr.getFrames(frames);
	t.deepEqual(uintArrFrames.array, [Uint32Array.from(frameValueComp)]);

	// Float32ArrayArray
	const f32ArrArrFrames = s1_f32arrarr.getFrames(frames);
	t.deepEqual(f32ArrArrFrames.array, [frameValueComp, frameValueComp, frameValueComp, frameValueComp]);

	// Negative values - pick from the end
	const neg_f32ArrFrames = s1_f32arr.getFrames(Int32Array.from([-1, -3]));
	t.deepEqual(neg_f32ArrFrames.getValue(), Float32Array.from([1, 3]));

	// Unordered frames - value frames should be ordered
	const unordered_f32ArrFrames = s1_f32arr.getFrames(Int32Array.from([-1, 1, 0]));
	t.deepEqual(unordered_f32ArrFrames.getValue(), Float32Array.from([1, 2, 3]));

	// Repeating frames - a frame is only returned once
	const repeated_f32ArrFrames = s1_f32arr.getFrames(Int32Array.from([0, 1, 1, 2, 1, 1, 0]));
	t.deepEqual(repeated_f32ArrFrames.getValue(), Float32Array.from([1, 2, 3]));

	// Out of bounds - only frames within the given length is returned
	const oob_f32ArrFrames = s1_f32arr.getFrames(Int32Array.from([0, 2, 4, 6, 8, 10]));
	t.deepEqual(oob_f32ArrFrames.getValue(), Float32Array.from([1, 3]));

	// Unsupported
	t.is(s1_f32.getFrames(frames), undefined);
	t.is(s1_string.getFrames(frames), undefined);
	t.is(s1_undef.getFrames(frames), undefined);

	t.is(s1_undef.getFrames(undefined), undefined);
	t.is(s1_undef.getFrames(new Uint32Array()), undefined);
});

test('Signal - getSignalCycles', (t) => {
	const sig = new Signal(Float32Array.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));

	// Test no cycles.
	t.is(sig.getSignalCycles(), undefined);

	// Add cycles.
	sig.cycles = cycles;

	// Test signal with cycles.
	const cycleSignals = sig.getSignalCycles();
	t.is(cycleSignals.length, 2);
	t.deepEqual(cycleSignals[0].array, [Float32Array.from([2, 3, 4, 5])]);
	t.deepEqual(cycleSignals[1].array, [Float32Array.from([7, 8])]);
});

test('Signal - convertToTargetSpace - No target space', (t) => {
	// No target space
	s1_segment.targetSpace = undefined;
	s1_segment.convertToTargetSpace();
	t.is(s1_segment.targetSpace, undefined);
	t.is(s1_segment.space, undefined);
});

test('Signal - convertToTargetSpace - Segment', (t) => {
	// Test Segment
	s1_segment.targetSpace = space;
	s1_segment.convertToTargetSpace();
	t.is(s1_segment.targetSpace, undefined);
	t.is(s1_segment.space, space);
	t.deepEqual(s1_segment.getSegmentValue().y, Float32Array.from([1, 2, 3]));
});

test('Signal - convertToTargetSpace - VectorSequence', (t) => {
	// Test VectorSequence
	const vecSeq2 = new VectorSequence(fakeArray, fakeArray, fakeArray, frameRate);
	const s1_vecseq2 = new Signal(vecSeq2, frameRate);
	s1_vecseq2.targetSpace = space;

	s1_vecseq2.convertToTargetSpace();
	t.is(s1_vecseq2.targetSpace, undefined);
	t.is(s1_vecseq2.space, space);
	t.deepEqual(s1_vecseq2.getVectorSequenceValue().y, Float32Array.from([1, 2, 3]));
});

test('Signal - convertToTargetSpace - Float32Array from a VectorSequence', (t) => {
	// Test Float32Array (as a component from a VectorSequence)
	const vecSeq3 = new VectorSequence(fakeArray, fakeArray, fakeArray, frameRate);
	const s1_vecseq3 = new Signal(vecSeq3, frameRate);

	// Get "y" component, like it's done by DataStore
	s1_vecseq3.originalSignal = s1_vecseq3.clone();
	s1_vecseq3.setValue(s1_vecseq3.getComponent('y'));
	s1_vecseq3.component = 'y';

	s1_vecseq3.targetSpace = space;
	s1_vecseq3.convertToTargetSpace();

	t.is(s1_vecseq3.targetSpace, undefined);
	t.is(s1_vecseq3.space, space);
	t.deepEqual(s1_vecseq3.getFloat32ArrayValue(), Float32Array.from([1, 2, 3]));
});

test('Signal - convertToTargetSpace - Float32Array from a Segment', (t) => {
	// Test Float32Array (as a component from a segment)
	const segment2 = new Segment('head', vecSeq, quatSeq, frameRate);
	const s1_segment2 = new Signal(segment2, frameRate);

	// Get "y" component, like it's done by DataStore
	s1_segment2.originalSignal = s1_segment2.clone();
	s1_segment2.setValue(s1_segment2.getComponent('y'));
	s1_segment2.component = 'y';

	s1_segment2.targetSpace = space;
	s1_segment2.convertToTargetSpace();

	t.is(s1_segment2.targetSpace, undefined);
	t.is(s1_segment2.space, space);
	t.deepEqual(s1_segment2.getFloat32ArrayValue(), Float32Array.from([1, 2, 3]));
});

test('Signal - clone', (t) => {
	// Create all propped-up signal
	const source = new Signal(segment, frameRate);
	source.name = 'test';
	source.set = 'left';
	source.space = space;
	source.targetSpace = space;
	source.cycles = cycles;
	source.resultType = ResultType.Scalar;

	const clone = source.clone();

	// Test all properties
	t.is(clone.name, source.name);
	t.is(clone.frameRate, source.frameRate);
	t.is(clone.set, source.set);
	t.is(clone.space, source.space);
	t.is(clone.targetSpace, source.targetSpace);
	t.is(clone.cycles, source.cycles);
	t.is(clone.resultType, source.resultType);
	t.is(clone.getValue(), source.getValue());
	t.is(clone.type, source.type);
});

test('Signal - clone with no value', (t) => {
	// Test clone with no value
	const source = new Signal(segment, frameRate);
	source.name = 'test';
	source.set = 'left';
	source.space = space;
	source.targetSpace = space;
	source.cycles = cycles;
	source.resultType = ResultType.Scalar;

	const clone = source.clone(false);

	// Test all properties
	t.is(clone.name, source.name);
	t.is(clone.frameRate, source.frameRate);
	t.is(clone.set, source.set);
	t.is(clone.space, source.space);
	t.is(clone.targetSpace, source.targetSpace);
	t.is(clone.cycles, source.cycles);
	t.is(clone.resultType, source.resultType);

	t.is(clone.getValue(), undefined); // Should have no value
	t.is(clone.type, undefined);
});

test('Signal - clone with a new value', (t) => {
	// Test clone with new value
	const source = new Signal(segment, frameRate);
	source.name = 'test';
	source.set = 'left';
	source.space = space;
	source.targetSpace = space;
	source.cycles = cycles;
	source.resultType = ResultType.Scalar;

	const clone = source.clone(fakeArray);

	// Test all properties
	t.is(clone.name, source.name);
	t.is(clone.frameRate, source.frameRate);
	t.is(clone.set, source.set);
	t.is(clone.space, source.space);
	t.is(clone.targetSpace, source.targetSpace);
	t.is(clone.cycles, source.cycles);
	t.is(clone.resultType, source.resultType);

	t.is(clone.getValue(), fakeArray); // Should be our new array
	t.is(clone.type, SignalType.Float32Array);
});