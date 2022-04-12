import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { BaseFilterStep, FilterType, HighPassFilterStep, LowPassFilterStep } from './filter';

const f1 = new Signal(32);
const s1 = new Signal(f32(2, 1, 1, 1, 2, 1, 1, 1, 2), 300);

test('BaseFilterStep - "extrapolate" option', async (t) => {
	t.is(mockStep(BaseFilterStep, [f1]).extrapolate, 0); // Default value
	t.is(mockStep(BaseFilterStep, [f1], { extrapolate: 500 }).extrapolate, 500);
	t.is(mockStep(BaseFilterStep, [f1], { extrapolate: 5000 }).extrapolate, 1000); // Beyond max value
	t.is(mockStep(BaseFilterStep, [f1], { extrapolate: -10 }).extrapolate, 0); // Below max value
	t.is(mockStep(BaseFilterStep, [f1], { extrapolate: 10.5 }).extrapolate, 10); // should be integer
});

test('BaseFilterStep - "iterations" option', async (t) => {
	t.is(mockStep(BaseFilterStep, [f1]).iterations, 1); // Default value
	t.is(mockStep(BaseFilterStep, [f1], { iterations: 5 }).iterations, 5);
	t.is(mockStep(BaseFilterStep, [f1], { iterations: 5000 }).iterations, 10); // Beyond max value
	t.is(mockStep(BaseFilterStep, [f1], { iterations: -10 }).iterations, 1); // Below max value
	t.is(mockStep(BaseFilterStep, [f1], { iterations: 5.5 }).iterations, 5); // should be integer
});

test('BaseFilterStep - "cutoff" option', async (t) => {
	t.is(mockStep(BaseFilterStep, [f1], {}).cutoffFreq, 20); // Default value
	t.is(mockStep(BaseFilterStep, [f1], { cutoff: 5 }).cutoffFreq, 5);
	t.is(mockStep(BaseFilterStep, [f1], { cutoff: 5000 }).cutoffFreq, 5000);
	t.is(mockStep(BaseFilterStep, [f1], { cutoff: -10 }).cutoffFreq, 1); // Below max value
	t.is(mockStep(BaseFilterStep, [f1], { cutoff: 5.5 }).cutoffFreq, 5.5); // supports floating values
});

test('BaseFilterStep - "order" option', async (t) => {
	t.is(mockStep(BaseFilterStep, [f1], {}).order, 2); // Default value
	t.is(mockStep(BaseFilterStep, [f1], { order: 5 }).order, 5);
	t.is(mockStep(BaseFilterStep, [f1], { order: 5000 }).order, 10); // Beyond max value
	t.is(mockStep(BaseFilterStep, [f1], { order: -10 }).order, 1); // Below max value
	t.is(mockStep(BaseFilterStep, [f1], { order: 5.5 }).order, 5); // should be integer
});

test('LowPassFilterStep - basic test', async (t) => {
	const step = mockStep(LowPassFilterStep, [s1], { extrapolate: 2, cutoff: 15, iterations: 2, order: 1 });

	t.is(step.filterType, FilterType.LowPass);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(
		1.9439243078231812,
		1.8376500606536865,
		1.6810575723648071,
		1.5118863582611084,
		1.362622857093811,
		1.2637317180633545,
		1.2459646463394165,
		1.336074948310852,
		1.5503648519515991
	));
});


test('HighPassFilterStep - basic test', async (t) => {
	const step = mockStep(HighPassFilterStep, [s1], { extrapolate: 100, cutoff: 40, iterations: 5, order: 3 });

	t.is(step.filterType, FilterType.HighPass);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(
		1.9003331661224365,
		1.3595967292785645,
		1.1606826782226562,
		1.162358283996582,
		1.1890636682510376,
		1.1623682975769043,
		1.160696029663086,
		1.3596038818359375,
		1.9003278017044067
	));
});

test('LowPassFilterStep - handle NaNs', async (t) => {
	const series = new Signal(f32(undefined, undefined, undefined, 2, 1, 1, 1, 2, 1, 1, 1, 2, undefined, undefined, undefined), 300);
	const step = mockStep(LowPassFilterStep, [series], { extrapolate: 2, cutoff: 15, iterations: 2, order: 1 });

	t.is(step.filterType, FilterType.LowPass);

	const res = await step.process();
	t.deepEqual(res.getValue(), f32(
		NaN,
		NaN,
		NaN,
		1.9439243078231812,
		1.8376500606536865,
		1.6810575723648071,
		1.5118863582611084,
		1.362622857093811,
		1.2637317180633545,
		1.2459646463394165,
		1.336074948310852,
		1.5503648519515991,
		NaN,
		NaN,
		NaN,
	));
});

test('LowPassFilterStep - all NaNs', async (t) => {
	const series = new Signal(f32(undefined, undefined, undefined, undefined, undefined, undefined), 300);
	const step = mockStep(LowPassFilterStep, [series], { extrapolate: 2, cutoff: 15, iterations: 2, order: 1 });

	await t.throwsAsync(step.process());
});