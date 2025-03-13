import test from 'ava';

import { f32, mockStep } from '../../test-utils/mock-step';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { CumulativeDistanceStep } from './trajectory';


const vs1 = new Signal(new VectorSequence(f32(0,3,6), f32(0,4,8), f32(0,0,0)));
const vs2 = new Signal(new VectorSequence(f32(1,2,3,4,5), f32(0,0,0,0,0), f32(0,0,0,0,0)));
const vs3 = new Signal(new VectorSequence(f32(1,2,NaN,4,5), f32(0,0,0,0,0), f32(0,0,0,0,0)));

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

test('CumulativeDistanceStep - Cumulative distances for vector sequences', async(t) => {
	const step1 = mockStep(CumulativeDistanceStep, [vs1]);
	const step2 = mockStep(CumulativeDistanceStep, [vs2]);
	
	const res1 = await step1.process();
	const res2 = await step2.process();

	t.deepEqual(res1.getValue()[0], 10);
	t.deepEqual(res2.getValue()[0], 4);
});

test('CumulativeDistanceStep - Cumulative distances for vector sequences with NaN', async(t) => {
	const step1 = mockStep(CumulativeDistanceStep, [vs3]);
	const res1 = await step1.process();

	t.deepEqual(res1.getValue()[0], NaN);
});
