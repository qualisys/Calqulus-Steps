import test from 'ava';

import { ArrayTestUtil } from '../../../test-utils/array-utils';
import { f32, i32, mockStep } from '../../../test-utils/mock-step';
import { Segment } from '../../models/segment';
import { QuaternionSequence } from '../../models/sequence/quaternion-sequence';
import { VectorSequence } from '../../models/sequence/vector-sequence';
import { IFrameSpan, ResultType, Signal } from '../../models/signal';

import { EventMaskStep } from './event-mask';

const eventFrames1 = i32(0, 5);
const eventFrames2 = i32(2, 8);
const eventFrames1Shuffle = ArrayTestUtil.shuffle(eventFrames1);
const eventFrames2Shuffle = ArrayTestUtil.shuffle(eventFrames2);
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
const e1Shuffle = new Signal(eventFrames1Shuffle, frameRate);
const e2Shuffle = new Signal(eventFrames2Shuffle, frameRate);
e1.isEvent = e2.isEvent = e1Shuffle.isEvent = e2Shuffle.isEvent = true;

const s1 = new Signal(vs);
const s2 = new Signal(comp);
const s2Event = new Signal(comp);
const s2EventShuffle = new Signal(ArrayTestUtil.shuffle(comp));
s2Event.isEvent = s2EventShuffle.isEvent = true;
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

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s2, e1Shuffle, e2Shuffle]).process();

	console.log(res2.cycles, cycles);
	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.cycles, cycles);
	t.deepEqual(res2.getValue(), comp);
});

test('EventMaskStep - simple array - out-of-bounds events', async(t) => {
	const oobEventFrames1 = i32(0, 4, 8);
	const oobEventFrames2 = i32(2, 6, 15); // 15 is out-of-bounds, the 8-15 cycle should be ignored.

	const oobe1 = new Signal(oobEventFrames1, frameRate);
	const oobe2 = new Signal(oobEventFrames2, frameRate);
	oobe1.isEvent = oobe2.isEvent = true;

	const res = await mockStep(EventMaskStep, [s2, oobe1, oobe2]).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, [{ start: 0, end: 2 }, { start: 4, end: 6 }]);
	t.deepEqual(res.getValue(), comp);

	// Test random shuffle.
	const oobEventFrames1s = ArrayTestUtil.shuffle(oobEventFrames1);
	const oobEventFrames2s = ArrayTestUtil.shuffle(oobEventFrames2);

	const oobe1s = new Signal(oobEventFrames1s, frameRate);
	const oobe2s = new Signal(oobEventFrames2s, frameRate);
	oobe1s.isEvent = oobe2s.isEvent = true;

	const res2 = await mockStep(EventMaskStep, [s2, oobe1s, oobe2s]).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.cycles, res.cycles);
	t.deepEqual(res2.getValue(), comp);
});

test('EventMaskStep - simple array - negative events', async(t) => {
	const oobEventFrames1 = i32(-1, 4, 8); // -1 is out-of-bounds, the -1-2 cycle should be ignored.
	const oobEventFrames2 = i32(2, 6, 9); 

	const oobe1 = new Signal(oobEventFrames1, frameRate);
	const oobe2 = new Signal(oobEventFrames2, frameRate);
	oobe1.isEvent = oobe2.isEvent = true;

	const res = await mockStep(EventMaskStep, [s2, oobe1, oobe2]).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.cycles, [{ start: 4, end: 6 }, { start: 8, end: 9 }]);
	t.deepEqual(res.getValue(), comp);

	// Test random shuffle.
	const oobEventFrames1s = ArrayTestUtil.shuffle(oobEventFrames1);
	const oobEventFrames2s = ArrayTestUtil.shuffle(oobEventFrames2);

	const oobe1s = new Signal(oobEventFrames1s, frameRate);
	const oobe2s = new Signal(oobEventFrames2s, frameRate);
	oobe1s.isEvent = oobe2s.isEvent = true;

	const res2 = await mockStep(EventMaskStep, [s2, oobe1s, oobe2s]).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.cycles, res.cycles);
	t.deepEqual(res2.getValue(), comp);
});

test('EventMaskStep - event array', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2]).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(0, 1, 2, 5, 6, 7, 8));

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s2Event, e1Shuffle, e2Shuffle]).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.getValue(), f32(0, 1, 2, 5, 6, 7, 8));
});

test('EventMaskStep - event array - short events', async(t) => {
	const shortEvent = new Signal(i32(6), frameRate);
	shortEvent.isEvent = true;

	const res = await mockStep(EventMaskStep, [shortEvent, e1, e2]).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), i32(6));
});

test('EventMaskStep - event array - keep (array)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: [1, 3] }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(1, 6, 8));

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s2Event, e1Shuffle, e2Shuffle], { keep: [1, 3] }).process();
	
	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.getValue(), f32(1, 6, 8));
});

test('EventMaskStep - event array - keep (array, unordered)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: [3, 1] }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(1, 6, 8));

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s2EventShuffle, e1Shuffle, e2Shuffle], { keep: [3, 1] }).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.getValue(), f32(1, 6, 8));
});

test('EventMaskStep - event array - keep (array, negative)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: [1, -1] }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(1, 2, 6, 8));

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s2EventShuffle, e1Shuffle, e2Shuffle], { keep: [1, -1] }).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.getValue(), f32(1, 2, 6, 8));
});

test('EventMaskStep - event array - keep (array, negative, too large)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: [10, -1] }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(2, 8));

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s2EventShuffle, e1Shuffle, e2Shuffle], { keep: [10, -1] }).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.getValue(), f32(2, 8));
});

test('EventMaskStep - event array - keep (array, negative, too negative)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: [1, -10] }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(1, 6));

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s2EventShuffle, e1Shuffle, e2Shuffle], { keep: [1, -10] }).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.getValue(), f32(1, 6));
});

test('EventMaskStep - event array - keep (number)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: 1 }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32(1, 6));

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s2EventShuffle, e1Shuffle, e2Shuffle], { keep: 1 }).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.getValue(), f32(1, 6));
});

test('EventMaskStep - event array - keep (number, too large)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: 10 }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32());

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s2EventShuffle, e1Shuffle, e2Shuffle], { keep: 10 }).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.getValue(), f32());
});

test('EventMaskStep - event array - keep (number, too negative)', async(t) => {
	const res = await mockStep(EventMaskStep, [s2Event, e1, e2], { keep: -10 }).process();
	
	t.is(res.resultType, ResultType.Scalar);
	t.deepEqual(res.getValue(), f32());

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s2EventShuffle, e1Shuffle, e2Shuffle], { keep: -10 }).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.getValue(), f32());
});

test('EventMaskStep - VectorSequence', async(t) => {
	const res = await mockStep(EventMaskStep, [s1, e1, e2]).process();
	
	t.is(res.resultType, ResultType.Series);
	t.deepEqual(res.cycles, cycles);
	t.deepEqual(res.getValue(), vs);

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [s1, e1Shuffle, e2Shuffle]).process();

	t.is(res2.resultType, ResultType.Series);
	t.deepEqual(res2.cycles, cycles);
	t.deepEqual(res2.getValue(), vs);
});

test('EventMaskStep - Segment', async(t) => {
	const res = await mockStep(EventMaskStep, [seg1, e1, e2]).process();
	
	t.is(res.resultType, ResultType.Series);
	t.deepEqual(res.cycles, cycles);
	t.deepEqual(res.array, [comp, comp, comp, comp, comp, comp, comp]);

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [seg1, e1Shuffle, e2Shuffle]).process();

	t.is(res2.resultType, ResultType.Series);
	t.deepEqual(res2.cycles, cycles);
	t.deepEqual(res2.array, [comp, comp, comp, comp, comp, comp, comp]);
});

test('EventMaskStep - Multidimensional array', async(t) => {
	const res = await mockStep(EventMaskStep, [multiDim, e1, e2]).process();
	
	t.is(res.resultType, ResultType.Series);
	t.deepEqual(res.cycles, cycles);
	t.deepEqual(res.array, [comp, comp, comp, comp, comp, comp, comp]);

	// Test random shuffle.
	const res2 = await mockStep(EventMaskStep, [multiDim, e1Shuffle, e2Shuffle]).process();

	t.is(res2.resultType, ResultType.Series);
	t.deepEqual(res2.cycles, cycles);
	t.deepEqual(res2.array, [comp, comp, comp, comp, comp, comp, comp]);
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

	// Test random shuffle.
	const framesAShuffle = new Signal(ArrayTestUtil.shuffle(framesA.getUint32ArrayValue()), 100);
	const framesBShuffle = new Signal(ArrayTestUtil.shuffle(framesB.getUint32ArrayValue()), 100);
	const excludeShuffle = new Signal(ArrayTestUtil.shuffle(exclude.getUint32ArrayValue()), 100);

	const res2 = await mockStep(EventMaskStep, [signal, framesAShuffle, framesBShuffle], {
		exclude: [excludeShuffle],
	}).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.cycles, res.cycles);
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

	// Test random shuffle.
	const framesAShuffle = new Signal(ArrayTestUtil.shuffle(framesA.getUint32ArrayValue()), 100);
	const framesBShuffle = new Signal(ArrayTestUtil.shuffle(framesB.getUint32ArrayValue()), 100);
	const excludeAShuffle = new Signal(ArrayTestUtil.shuffle(excludeA.getUint32ArrayValue()), 100);
	const excludeBShuffle = new Signal(ArrayTestUtil.shuffle(excludeB.getUint32ArrayValue()), 100);

	const res2 = await mockStep(EventMaskStep, [signal, framesAShuffle, framesBShuffle], {
		exclude: [excludeAShuffle, excludeBShuffle],
	}).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.cycles, res.cycles);
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

	// Test random shuffle.
	const framesAShuffle = new Signal(ArrayTestUtil.shuffle(framesA.getUint32ArrayValue()), 100);
	const framesBShuffle = new Signal(ArrayTestUtil.shuffle(framesB.getUint32ArrayValue()), 100);
	const includeShuffle = new Signal(ArrayTestUtil.shuffle(include.getUint32ArrayValue()), 100);

	const res2 = await mockStep(EventMaskStep, [signal, framesAShuffle, framesBShuffle], {
		include: [includeShuffle],
	}).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.cycles, res.cycles);
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

	// Test random shuffle.
	const framesAShuffle = new Signal(ArrayTestUtil.shuffle(framesA.getUint32ArrayValue()), 100);
	const framesBShuffle = new Signal(ArrayTestUtil.shuffle(framesB.getUint32ArrayValue()), 100);
	const includeAShuffle = new Signal(ArrayTestUtil.shuffle(includeA.getUint32ArrayValue()), 100);
	const includeBShuffle = new Signal(ArrayTestUtil.shuffle(includeB.getUint32ArrayValue()), 100);

	const res2 = await mockStep(EventMaskStep, [signal, framesAShuffle, framesBShuffle], {
		include: [includeAShuffle, includeBShuffle],
	}).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.cycles, res.cycles);
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

	// Test random shuffle.
	const framesAShuffle = new Signal(ArrayTestUtil.shuffle(framesA.getUint32ArrayValue()), 100);
	const framesBShuffle = new Signal(ArrayTestUtil.shuffle(framesB.getUint32ArrayValue()), 100);
	const excludeShuffle = new Signal(ArrayTestUtil.shuffle(exclude.getUint32ArrayValue()), 100);
	const includeShuffle = new Signal(ArrayTestUtil.shuffle(include.getUint32ArrayValue()), 100);

	const res2 = await mockStep(EventMaskStep, [signal, framesAShuffle, framesBShuffle], {
		include: [includeShuffle],
		exclude: [excludeShuffle],
	}).process();

	t.is(res2.resultType, ResultType.Scalar);
	t.deepEqual(res2.cycles, res.cycles);
});

test('EventMaskStep - incompatible include', async(t) => {
	await t.throwsAsync(mockStep(EventMaskStep, [s2, e1, e2], { include: [new Signal('My string')]}).process());
	await t.throwsAsync(mockStep(EventMaskStep, [s2, e1, e2], { include: [new Signal(vs)]}).process());
});

test('EventMaskStep - incompatible exclude', async(t) => {
	await t.throwsAsync(mockStep(EventMaskStep, [s2, e1, e2], { exclude: [new Signal('My string')]}).process());
	await t.throwsAsync(mockStep(EventMaskStep, [s2, e1, e2], { exclude: [new Signal(vs)]}).process());
});
