import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { CumulativeDistanceStep } from './cumulative-distance';


const vs1 = new Signal(new VectorSequence(f32(0,3,6), f32(0,4,8), f32(0,0,0)));
const vs2 = new Signal(new VectorSequence(f32(1,2,3,4,5), f32(0,0,0,0,0), f32(0,0,0,0,0)));
const vs3 = new Signal(new VectorSequence(f32(1,2,NaN,4,5), f32(0,0,0,0,0), f32(0,0,0,0,0)));
const vs4 = new Signal(new VectorSequence(f32(1,2,3,4,5,6,7,8,9), f32(0,0,0,0,0,0,0,0,0), f32(0,0,0,0,0,0,0,0,0)));
vs4.cycles = [{ start: 1, end: 4 }, { start: 6, end: 8 }]; 

test('CumulativeDistanceStep - Handle input errors', async(t) => {
	const step1 = mockStep(CumulativeDistanceStep, [new Signal((f32(1,1,1), f32(0,0,0)))]); // 2 dimensional vector
	const step2 = mockStep(CumulativeDistanceStep, [new Signal((f32(1,1,1), f32(0,0,0), f32(1,1,1), f32(0,0,0)))]); // 4 dimensional vector
	const step3 = mockStep(CumulativeDistanceStep, [new Signal(new VectorSequence(f32(0,3,6), f32(0,4,8), f32(0,0)))]); // inconsistent length
	const step4 = mockStep(CumulativeDistanceStep, [new Signal(new VectorSequence(f32(0), f32(0), f32(0)))]); // single point

	await t.throwsAsync(step1.process());
	await t.throwsAsync(step2.process());
	await t.throwsAsync(step3.process());
	await t.throwsAsync(step4.process());
});

test('CumulativeDistanceStep - Cumulative distances for vector sequences (scalar)', async(t) => {
	const step1 = mockStep(CumulativeDistanceStep, [vs1]);
	const step2 = mockStep(CumulativeDistanceStep, [vs2], { scalar: true });
	
	const res1 = await step1.process();
	const res2 = await step2.process();

	t.deepEqual(res1.getValue(), f32(10));
	t.deepEqual(res2.getValue(), f32(4));
});

test('CumulativeDistanceStep - Cumulative distances for vector sequences (series)', async(t) => {
	const step1 = mockStep(CumulativeDistanceStep, [vs1], { scalar: false });
	const step2 = mockStep(CumulativeDistanceStep, [vs2], { scalar: false });
	
	const res1 = await step1.process();
	const res2 = await step2.process();

	t.deepEqual(res1.getValue(), f32(5, 10, NaN));
	t.deepEqual(res2.getValue(), f32(1, 2, 3, 4, NaN));
});

test('CumulativeDistanceStep - Cumulative distances for vector sequences with NaN (scalar)', async(t) => {
	const step1 = mockStep(CumulativeDistanceStep, [vs3]);
	const res1 = await step1.process();

	t.deepEqual(res1.getValue(), f32(NaN));
});

test('CumulativeDistanceStep - Cumulative distances for vector sequences with NaN (series)', async(t) => {
	const step1 = mockStep(CumulativeDistanceStep, [vs3], { scalar: false });
	const res1 = await step1.process();

	t.deepEqual(res1.getValue(), f32(NaN, NaN, NaN, NaN, NaN));
});

test('CumulativeDistanceStep - Cumulative distances for vector sequences with Cycles (scalar)', async(t) => {
	const step1 = mockStep(CumulativeDistanceStep, [vs4]);
	const res1 = await step1.process();

	t.deepEqual(res1.getValue(), f32(3, 2));
});

test('CumulativeDistanceStep - Cumulative distances for vector sequences with Cycles (series)', async(t) => {
	const step1 = mockStep(CumulativeDistanceStep, [vs4], { scalar: false });
	const res1 = await step1.process();

	t.deepEqual(res1.getValue(), f32(NaN, 1, 2, 3, NaN, NaN, 1, 2, NaN));
});
