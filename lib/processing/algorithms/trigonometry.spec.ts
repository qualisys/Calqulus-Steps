import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { ACosStep, ASinStep, ATan2Step, ATanStep, CoshStep, CosStep, CotanStep, SinhStep, SinStep, TanhStep, TanStep } from './trigonometry';

const a1 = f32(0.1, 0.2, 0.3);
const a2 = f32(0.4, 0.5, 0.6);
const a3 = f32(0.4, 0.5);
const s1 = new Signal(a1);
const s2 = new Signal(a2);
const s3 = new Signal(a3);
const s4 = new Signal(0.1);

test('Trigonometry - CosStep', async(t) => {
	const step = mockStep(CosStep, [s1]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...a1.map(v => Math.cos(v))));
});

test('Trigonometry - ACosStep', async(t) => {
	const step = mockStep(ACosStep, [s1]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...a1.map(v => Math.acos(v))));
});

test('Trigonometry - CoshStep', async(t) => {
	const step = mockStep(CoshStep, [s1]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...a1.map(v => Math.cosh(v))));
});


test('Trigonometry - SinStep', async(t) => {
	const step = mockStep(SinStep, [s1]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...a1.map(v => Math.sin(v))));
});

test('Trigonometry - ASinStep', async(t) => {
	const step = mockStep(ASinStep, [s1]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...a1.map(v => Math.asin(v))));
});

test('Trigonometry - SinhStep', async(t) => {
	const step = mockStep(SinhStep, [s1]);
	const res = await step.process();
	
	t.deepEqual(res.getValue(), f32(...a1.map(v => Math.sinh(v))));
});


test('Trigonometry - TanStep', async(t) => {
	const step = mockStep(TanStep, [s1]);
	const res = await step.process();
	
	t.deepEqual(res.getValue(), f32(...a1.map(v => Math.tan(v))));
});

test('Trigonometry - ATanStep', async(t) => {
	const step = mockStep(ATanStep, [s1]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...a1.map(v => Math.atan(v))));
});

test('Trigonometry - TanhStep', async(t) => {
	const step = mockStep(TanhStep, [s1]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...a1.map(v => Math.tanh(v))));
});

test('Trigonometry - CotanStep', async(t) => {
	const step = mockStep(CotanStep, [s1]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...a1.map(v => 1 / Math.tan(v))));
});

test('Trigonometry - ATan2Step - Too few signals', async(t) => {
	const step = mockStep(ATan2Step, [s1]);

	await t.throwsAsync(step.process());
});

test('Trigonometry - ATan2Step - Signal type mismatch', async(t) => {
	const step = mockStep(ATan2Step, [s1, s4]);

	await t.throwsAsync(step.process());
});

test('Trigonometry - ATan2Step - Signal length mismatch', async(t) => {
	const step = mockStep(ATan2Step, [s1, s3]);

	await t.throwsAsync(step.process());
});

test('Trigonometry - ATan2Step', async(t) => {
	const step = mockStep(ATan2Step, [s1, s2]);
	const res = await step.process();

	t.deepEqual(res.getValue(), f32(...a1.map((v, i) => Math.atan2(v, a2[i]))));
});
