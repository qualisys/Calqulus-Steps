import test from 'ava';

import { f32, mockStep } from '../../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { SortStep } from './sort';

test('SortStep with invalid inputs', async(t) => {
	await t.throwsAsync(mockStep(SortStep, [new Signal('hello')]).process());
	await t.throwsAsync(mockStep(SortStep, [new Signal(undefined)]).process());
	await t.throwsAsync(mockStep(SortStep, [undefined]).process());
	await t.throwsAsync(mockStep(SortStep, []).process());
});

test('SortStep with invalid sort order', async(t) => {
	await t.throws(() => mockStep(SortStep, [new Signal(-77)], { order: 'invalid' }));
});

test('SortStep with sort order in different case', async(t) => {
	await t.notThrows(() => mockStep(SortStep, [new Signal(-77)], { order: 'ASC' }));
	await t.notThrows(() => mockStep(SortStep, [new Signal(-77)], { order: 'DESC' }));
	await t.notThrows(() => mockStep(SortStep, [new Signal(-77)], { order: 'Asc' }));
	await t.notThrows(() => mockStep(SortStep, [new Signal(-77)], { order: 'Desc' }));
});

test('SortStep with single number', async(t) => {
	const r1 = await mockStep(SortStep, [new Signal(-77)]).process();
	t.is(r1.getValue(), -77);
	const r2 = await mockStep(SortStep, [new Signal(77)]).process();
	t.is(r2.getValue(), 77);


	const r1b = await mockStep(SortStep, [new Signal(-77)], { order: 'asc' }).process();
	t.is(r1b.getValue(), -77);
	const r2b = await mockStep(SortStep, [new Signal(77)], { order: 'asc' }).process();
	t.is(r2b.getValue(), 77);


	const r1c = await mockStep(SortStep, [new Signal(-77)], { order: 'desc' }).process();
	t.is(r1c.getValue(), -77);
	const r2c = await mockStep(SortStep, [new Signal(77)], { order: 'desc' }).process();
	t.is(r2c.getValue(), 77);
});

test('SortStep with random array', async(t) => {
	const r1 = await mockStep(SortStep, [new Signal(f32(4, 2, 8, 55, 32))]).process();
	t.deepEqual(r1.getValue(), f32(2, 4, 8, 32, 55));
	const r2 = await mockStep(SortStep, [new Signal(f32(4, -2, 8, 55, -32))]).process();
	t.deepEqual(r2.getValue(), f32(-32, -2, 4, 8, 55));

	const r1b = await mockStep(SortStep, [new Signal(f32(4, 2, 8, 55, 32))], { order: 'asc' }).process();
	t.deepEqual(r1b.getValue(), f32(2, 4, 8, 32, 55));
	const r2b = await mockStep(SortStep, [new Signal(f32(4, -2, 8, 55, -32))], { order: 'asc' }).process();
	t.deepEqual(r2b.getValue(), f32(-32, -2, 4, 8, 55));

	const r1c = await mockStep(SortStep, [new Signal(f32(4, 2, 8, 55, 32))], { order: 'desc' }).process();
	t.deepEqual(r1c.getValue(), f32(55, 32, 8, 4, 2));
	const r2c = await mockStep(SortStep, [new Signal(f32(4, -2, 8, 55, -32))], { order: 'desc' }).process();
	t.deepEqual(r2c.getValue(), f32(55, 8, 4, -2, -32));
});