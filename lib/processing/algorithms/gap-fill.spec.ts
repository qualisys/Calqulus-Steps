import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { GapFillStep, InterpolationType } from './gap-fill';

const s1 = new Signal(f32(0, NaN, NaN, 6, 10, NaN, 11), 200);
const g1 = new Signal(s1);

test('GapFillStep - "maxGapLength" option', async(t) => {
	t.is(mockStep(GapFillStep, [g1]).maxGapLengthFrames, 20); // Default value
	t.is(mockStep(GapFillStep, [g1], { maxGapLength: '5' }).maxGapLengthFrames, 5);
	t.is(mockStep(GapFillStep, [g1], { maxGapLength: '0.1s' }).maxGapLengthFrames, 20);// Using seconds as input
	t.is(mockStep(GapFillStep, [g1], { maxGapLength: '5.5' }).maxGapLengthFrames, 6); // Should be integer
	t.is(mockStep(GapFillStep, [g1], { maxGapLength: '0' }).maxGapLengthFrames, 1); // Below min value
});

test('GapFillStep - "type" option', async(t) => {
	t.is(mockStep(GapFillStep, [g1]).interpolationType, InterpolationType.Spline); // Default value
});

test('GapFillStep - "linear type" option with seconds for "maxGapLength" option', async(t) => {
	const step = mockStep(GapFillStep, [s1], { type: InterpolationType.Linear, maxGapLength: '0.05s' });

	t.is(step.interpolationType, InterpolationType.Linear);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(0, 2, 4, 6, 10, 10.5, 11));
});

test('GapFillStep - "spline type" option', async(t) => {
	const step = mockStep(GapFillStep, [s1], { type: InterpolationType.Spline, maxGapLength: '10' });

	t.is(step.interpolationType, InterpolationType.Spline);

	const res = await step.process();

	t.deepEqual(res.getValue(), f32(0, 1.3333333730697632, 3.1666667461395264, 6, 10, 13.125, 11));
});

test('GapFillStep - wrong interpolation type provided', async(t) => {
	t.throws(() => mockStep(GapFillStep, [s1], { type: 'test' }));
});