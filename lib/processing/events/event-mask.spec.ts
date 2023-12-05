import test from 'ava';

import { f32, i32, mockStep } from '../../../test-utils/mock-step';
import { Segment } from '../../models/segment';
import { QuaternionSequence } from '../../models/sequence/quaternion-sequence';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { IFrameSpan, ResultType, Signal } from '../../models/signal';

import { EventMaskStep } from './event-mask';

const eventFrames1 = i32(0, 5);
const eventFrames2 = i32(2, 8);
const comp = f32(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
const compTruncated = f32(0, 1, 2, 5, 6, 7, 8);
const compReplacement1 = f32(0, 1, 2, 0, 0, 5, 6, 7, 8, 0);
const compReplacement2 = f32(0, 1, 2, NaN, NaN, 5, 6, 7, 8, NaN);
const cycles: IFrameSpan[] = [{ start: 0, end: 2 }, { start: 5, end: 8 }];
const cyclesTruncated: IFrameSpan[] = [{ start: 0, end: 2 }, { start: 3, end: 6 }];
const vs = new VectorSequence(comp, comp, comp);

const frameRate = 300;

const e1 = new Signal(eventFrames1, frameRate);
const e2 = new Signal(eventFrames2, frameRate);
e1.isEvent = e2.isEvent = true;

const s1 = new Signal(vs);
const s2 = new Signal(comp);
const s2Event = new Signal(comp);
s2Event.isEvent = true;
const s3 = new Signal(0.1); // Wrong type

const seg1 = new Signal(
	new Segment(
		'test1',
		new VectorSequence(comp, comp, comp),
		new QuaternionSequence(comp, comp, comp, comp)
	)
);

const multiDim = new Signal(seg1.array);

test('EventMaskStep - Wrong input signals', async(t) => {
	await t.throwsAsync(mockStep(EventMaskStep).process()); // No inputs
	await t.throwsAsync(mockStep(EventMaskStep, [s1, e1, e2, e2]).process()); // Too many inputs
	await t.throwsAsync(mockStep(EventMaskStep, [e1, e2]).process()); // Too few inputs
	await t.throwsAsync(mockStep(EventMaskStep, [s3, e1, e2]).process()); // Wrong type
	await t.throwsAsync(mockStep(EventMaskStep, [s1, s1, s1]).process()); // Wrong type for events
});

test('EventMaskStep - simple array', async(t) => {
	const res = await mockStep(EventMaskStep, [s2, e1, e2]).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, cycles);
	t.deepEqual(res.getValue(), comp);
});

test('EventMaskStep - event array', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2]).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(0, 1, 2, 5, 6, 7, 8));
});

test('EventMaskStep - event array - keep (array)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: [1, 3] }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(1, 6, 8));
});

test('EventMaskStep - event array - keep (array, unordered)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: [3, 1] }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(1, 6, 8));
});

test('EventMaskStep - event array - keep (array, negative)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: [1, -1] }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(1, 2, 6, 8));
});

test('EventMaskStep - event array - keep (array, negative, too large)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: [10, -1] }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(2, 8));
});

test('EventMaskStep - event array - keep (array, negative, too negative)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: [1, -10] }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(1, 6));
});

test('EventMaskStep - event array - keep (number)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: 1 }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(1, 6));
});

test('EventMaskStep - event array - keep (number, too large)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: 10 }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32());
});

test('EventMaskStep - event array - keep (number, too negative)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: -10 }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32());
});

test('EventMaskStep - VectorSequence', async(t) => {
	const res = await mockStep(EventMaskStep, [s1, e1, e2]).process();
	
	t.is(res.resultType, ResultType.Series);
	t.deepEqual(res.cycles, cycles);
	t.deepEqual(res.getValue(), vs);
});

test('EventMaskStep - Segment', async(t) => {
	const res = await mockStep(EventMaskStep, [seg1, e1, e2]).process();
	
	t.is(res.resultType, ResultType.Series);
	t.deepEqual(res.cycles, cycles);
	t.deepEqual(res.array, [comp, comp, comp, comp, comp, comp, comp]);
});

test('EventMaskStep - Multidimensional array', async(t) => {
	const res = await mockStep(EventMaskStep, [multiDim, e1, e2]).process();
	
	t.is(res.resultType, ResultType.Series);
	t.deepEqual(res.cycles, cycles);
	t.deepEqual(res.array, [comp, comp, comp, comp, comp, comp, comp]);
});

test('EventMaskStep - VectorSequence - truncate', async(t) => {
	const res = await mockStep(EventMaskStep, [s1, e1, e2], { truncate: true }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, cyclesTruncated);
	t.deepEqual(res.array, [compTruncated, compTruncated, compTruncated]);
});

test('EventMaskStep - VectorSequence - replacement value 0', async(t) => {
	const res = await mockStep(EventMaskStep, [s1, e1, e2], { replacement: 0 }).process();
	
	t.is(res.resultType, ResultType.Series);
	t.deepEqual(res.cycles, cycles);
	t.deepEqual(res.array, [compReplacement1, compReplacement1, compReplacement1]);
});

test('EventMaskStep - VectorSequence - replacement value NaN', async(t) => {
	const res = await mockStep(EventMaskStep, [s1, e1, e2], { replacement: NaN }).process();
	
	t.is(res.resultType, ResultType.Series);
	t.deepEqual(res.cycles, cycles);
	t.deepEqual(res.array, [compReplacement2, compReplacement2, compReplacement2]);
});

test('EventMaskStep - VectorSequence - replacement value null', async(t) => {
	const res = await mockStep(EventMaskStep, [s1, e1, e2], { replacement: null }).process();
	
	t.is(res.resultType, ResultType.Series);
	t.deepEqual(res.cycles, cycles);
	t.deepEqual(res.array, [compReplacement2, compReplacement2, compReplacement2]);
});

test('EventMaskStep - VectorSequence - truncate and replacement value NaN', async(t) => {
	// Replacement value should not have any effect.
	const res = await mockStep(EventMaskStep, [s1, e1, e2], {
		replacement: NaN,
		truncate: true,
	}).process();

	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, cyclesTruncated);
	t.deepEqual(res.array, [compTruncated, compTruncated, compTruncated]);
});

test('EventMaskStep - Segment - truncate', async(t) => {
	const res = await mockStep(EventMaskStep, [seg1, e1, e2], {
		truncate: true,
	}).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, cyclesTruncated);
	t.deepEqual(res.array, [compTruncated, compTruncated, compTruncated, compTruncated, compTruncated, compTruncated, compTruncated]);
});

test('EventMaskStep - Multidimensional array - truncate', async(t) => {
	const res = await mockStep(EventMaskStep, [multiDim, e1, e2], {
		truncate: true,
	}).process();

	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, cyclesTruncated);
	t.deepEqual(res.array, [compTruncated, compTruncated, compTruncated, compTruncated, compTruncated, compTruncated, compTruncated]);
});

test('EventMaskStep - exclude single', async(t) => {
	const signal = new Signal(new Float32Array(100).fill(50), 100);
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const exclude = new Signal(i32(2, 3, 32), 100);

	const res = await mockStep(EventMaskStep, [signal, framesA, framesB], {
		exclude: [exclude],
	}).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, [{
		start: 5,
		end: 14,
	}, {
		start: 15,
		end: 29,
	}, {
		start: 55,
		end: 79,
	}]);
});

test('EventMaskStep - exclude multiple', async(t) => {
	const signal = new Signal(new Float32Array(100).fill(50), 100);
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const excludeA = new Signal(i32(2, 3, 32), 100);
	const excludeB = new Signal(i32(7, 33), 100);

	const res = await mockStep(EventMaskStep, [signal, framesA, framesB], {
		exclude: [excludeA, excludeB],
	}).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, [{
		start: 15,
		end: 29,
	}, {
		start: 55,
		end: 79,
	}]);
});

test('EventMaskStep - include single', async(t) => {
	const signal = new Signal(new Float32Array(100).fill(50), 100);
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const include = new Signal(i32(12, 24, 62), 100);

	const res = await mockStep(EventMaskStep, [signal, framesA, framesB], {
		include: [include],
	}).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, [{
		start: 5,
		end: 14,
	}, {
		start: 15,
		end: 29,
	}, {
		start: 55,
		end: 79,
	}]);
});

test('EventMaskStep - include multiple', async(t) => {
	const signal = new Signal(new Float32Array(100).fill(50), 100);
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const includeA = new Signal(i32(12, 24, 62), 100);
	const includeB = new Signal(i32(27, 72), 100);

	const res = await mockStep(EventMaskStep, [signal, framesA, framesB], {
		include: [includeA, includeB],
	}).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, [{
		start: 15,
		end: 29,
	}, {
		start: 55,
		end: 79,
	}]);
});

test('EventMaskStep - include and exclude', async(t) => {
	const signal = new Signal(new Float32Array(100).fill(50), 100);
	const framesA = new Signal(i32(1, 5, 15, 30, 55), 100);
	const framesB = new Signal(i32(4, 14, 29, 54, 79), 100);
	const exclude = new Signal(i32(22, 32), 100);
	const include = new Signal(i32(12, 24, 62), 100);

	const res = await mockStep(EventMaskStep, [signal, framesA, framesB], {
		include: [include],
		exclude: [exclude],
	}).process();
	
	t.is(res.resultType, ResultType.Scalar);

	t.deepEqual(res.cycles, [{
		start: 5,
		end: 14,
	}, {
		start: 55,
		end: 79,
	}]);
});

test('EventMaskStep - incompatible include', async(t) => {
	await t.throwsAsync(mockStep(EventMaskStep, [s2, e1, e2], { include: [new Signal('My string')]}).process());
	await t.throwsAsync(mockStep(EventMaskStep, [s2, e1, e2], { include: [new Signal(vs)]}).process());
});

test('EventMaskStep - incompatible exclude', async(t) => {
	await t.throwsAsync(mockStep(EventMaskStep, [s2, e1, e2], { exclude: [new Signal('My string')]}).process());
	await t.throwsAsync(mockStep(EventMaskStep, [s2, e1, e2], { exclude: [new Signal(vs)]}).process());
});
