import test from 'ava';

import { f32, i32, mockStep } from '../../test-utils/mock-step';
import { Joint } from '../models/joint';
import { Segment } from '../models/segment';
import { QuaternionSequence } from '../models/sequence/quaternion-sequence';
import { VectorSequence } from '../models/sequence/vector-sequence';
import { Signal } from '../models/signal';

import { IfStep } from './logic';


/**
 * This test is testing the input parsing of the mockStep function.
 * YAML parsing is tested in the corresponding test in the engine lib.
 */

const s0 = new Signal(0);
const s1 = new Signal(1);
const s2 = new Signal(2);
const s10 = new Signal(10);
const sNaN = new Signal(NaN);
const sArray = new Signal(f32(3, 4, 5));
const sArray2 = new Signal(f32(3));
const sArray3 = new Signal(i32(1));
const sArray4 = new Signal(i32());
const sString = new Signal('test');

const segment1 = new Signal(new Segment('test 1', new VectorSequence(f32(1, 2, 3), f32(2, 2, 2), f32(6, 5, 4)), new QuaternionSequence(f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3), f32(1, 2, 3))));


test('IfStep (mock) - Missing "then"', async(t) => {
	const step = mockStep(IfStep, [s1, s2], {
		else: [s10],
	}, '1 > 2');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Missing "else"', async(t) => {
	const step = mockStep(IfStep, [s1, s2], {
		then: [s10],
	}, '1 > 2');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - String then', async(t) => {
	// Not a problem if the 'then' is empty, as long as the then is not and is chosen.
	const step1 = mockStep(IfStep, [s1, s2], {
		then: [new Signal('test')],
		else: [s10],
	}, '1 > 2');

	const res1 = await step1.process();
	t.is(res1.getValue(), 10);

	// If the empty 'then' is chosen, it's a problem.
	const step2 = mockStep(IfStep, [s1, s2], {
		then: [new Signal('test')],
		else: [s10],
	}, '1 < 2');

	await t.throwsAsync(step2.process());
});

test('IfStep (mock) - String else', async(t) => {
	// Not a problem if the 'then' is empty, as long as the then is not and is chosen.
	const step1 = mockStep(IfStep, [s1, s2], {
		then: [s10],
		else: [new Signal('test')],
	}, '1 < 2');

	const res1 = await step1.process();
	t.is(res1.getValue(), 10);

	// If the empty 'then' is chosen, it's a problem.
	const step2 = mockStep(IfStep, [s1, s2], {
		then: [s10],
		else: [new Signal('test')],
	}, '1 > 2');

	await t.throwsAsync(step2.process());
});

test('IfStep (mock) - Empty else', async(t) => {
	// Not a problem if the 'else' is empty, as long as the then is not and is chosen.
	const step1 = mockStep(IfStep, [s1, s2], {
		then: [s10],
		else: [undefined],
	}, '1 < 2');

	const res1 = await step1.process();
	t.is(res1.getValue(), 10);

	// If the empty 'else' is chosen, it's a problem.
	const step2 = mockStep(IfStep, [s1, s2], {
		then: [s10],
		else: [undefined],
	}, '1 > 2');

	await t.throwsAsync(step2.process());
});

test('IfStep (mock) - Empty then', async(t) => {
	// Not a problem if the 'then' is empty, as long as the then is not and is chosen.
	const step1 = mockStep(IfStep, [s1, s2], {
		then: [undefined],
		else: [s10],
	}, '1 > 2');

	const res1 = await step1.process();
	t.is(res1.getValue(), 10);

	// If the empty 'then' is chosen, it's a problem.
	const step2 = mockStep(IfStep, [s1, s2], {
		then: [undefined],
		else: [s10],
	}, '1 < 2');

	await t.throwsAsync(step2.process());
});

test('IfStep (mock) - More than one input to "then" option', async(t) => {
	const step = mockStep(IfStep, [s1, s2], {
		then: [s1, s2],
		else: [s10],
	}, '1 > 2');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - More than one input to "else" option', async(t) => {
	const step = mockStep(IfStep, [s1, s2], {
		then: [s0, s1],
		else: [s1, s2],
	}, '1 > 2');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - More than one input to both "then" and "else" options', async(t) => {
	const step = mockStep(IfStep, [s1, s2], {
		then: [s1, s2],
		else: [s1, s2],
	}, '1 > 2');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Bad parentheses', async(t) => {
	const step = mockStep(IfStep, [s2, s1], {
		then: [s10],
		else: [s10, s0],
	}, '(2 > 1))');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Unsupported comparison - string and number', async(t) => {
	const step = mockStep(IfStep, [sString], {
		then: [s10],
		else: [s0],
	}, 'MyString > 1');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Unsupported type - segment', async(t) => {
	const step = mockStep(IfStep, [segment1], {
		then: [s10],
		else: [s0],
	}, 'MySegment > 1');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Not enough input signals', async(t) => {
	const step = mockStep(IfStep, [], {
		then: [s10],
		else: [s0],
	}, '');

	await t.throwsAsync(step.process());
});

test('IfStep (mock) - Array of length 1 support', async(t) => {
	const step1 = mockStep(IfStep, [sArray2, s1], {
		then: [s10],
		else: [s0],
	}, 'MyShortArray != 1');

	const res1 = await step1.process();
	t.is(res1.getValue(), 10);

	const step2 = mockStep(IfStep, [sArray3, s1], {
		then: [s10],
		else: [s0],
	}, 'MyShortArray != 1');

	const res2 = await step2.process();
	t.is(res2.getValue(), 0);
});

test('IfStep (mock) - Array of length n support', async(t) => {
	const step1 = mockStep(IfStep, [sArray, s1], {
		then: [s10],
		else: [s0],
	}, 'MyShortArray != 1');

	const res1 = await step1.process();
	t.is(res1.getValue(), 10);

	const step2 = mockStep(IfStep, [sArray, s1], {
		then: [s10],
		else: [s0],
	}, 'MyShortArray != 3');

	const res2 = await step2.process();
	t.is(res2.getValue(), 0);
});

test('IfStep (mock) - Numeric input, simple - then', async(t) => {
	const step = mockStep(IfStep, [s1, s2], {
		then: [s10],
		else: [s0],
	}, '1 < 2');

	const res = await step.process();
	t.is(res.getValue(), 10);
});

test('IfStep (mock) - Numeric input, simple - else', async(t) => {
	const step = mockStep(IfStep, [s1, s2], {
		then: [s10],
		else: [s0],
	}, '1 == 2');

	const res = await step.process();
	t.is(res.getValue(), 0);
});

test('IfStep (mock) - Numeric input, advanced - then', async(t) => {
	const step = mockStep(IfStep, [s1, s2, s10], {
		then: [s10],
		else: [s0],
	}, '(1 > 2 && 2 > 1) || 10 > 2');

	const res = await step.process();
	t.is(res.getValue(), 10);
});

test('IfStep (mock) - Numeric input, advanced - else', async(t) => {
	const step = mockStep(IfStep, [s1, s2, s10], {
		then: [s10],
		else: [s0],
	}, '(1 > 2 && 2 > 1) || 10 < 2');

	const res = await step.process();
	t.is(res.getValue(), 0);
});

test('IfStep (mock) - Mixed input, simple - then', async(t) => {
	const step = mockStep(IfStep, [s1, s1], {
		then: [s10],
		else: [s0],
	}, '2 > MyValue');

	const res = await step.process();
	t.is(res.getValue(), 10);
});

test('IfStep (mock) - Operands with special characters - dot - then', async(t) => {
	const step = mockStep(IfStep, [new Signal(2), s1], {
		then: [s10],
		else: [s0],
	}, '2 > MyValue.x');

	const res = await step.process();
	t.is(res.getValue(), 10);
});

test('IfStep (mock) - Operands with special characters - dot - else', async(t) => {
	const step = mockStep(IfStep, [new Signal(2), s10], {
		then: [s10],
		else: [s0],
	}, '2 > MyValue.x');

	const res = await step.process();
	t.is(res.getValue(), 0);
});

test('IfStep (mock) - Operands with special characters - @ - then', async(t) => {
	const step = mockStep(IfStep, [new Signal(2), s1], {
		then: [s10],
		else: [s0],
	}, '2 > MyValue@MyEvent');

	const res = await step.process();
	t.is(res.getValue(), 10);
});

test('IfStep (mock) - Operands with special characters - @ - else', async(t) => {
	const step = mockStep(IfStep, [new Signal(2), s10], {
		then: [s10],
		else: [s0],
	}, '2 > MyValue@MyEvent');

	const res = await step.process();
	t.is(res.getValue(), 0);
});

test('IfStep (mock) - Operands with special characters - dot and @ - then', async(t) => {
	const step = mockStep(IfStep, [new Signal(2), s1], {
		then: [s10],
		else: [s0],
	}, '2 > MyValue.x@MyEvent');

	const res = await step.process();
	t.is(res.getValue(), 10);
});

test('IfStep (mock) - Operands with special characters - dot and @ - else', async(t) => {
	const step = mockStep(IfStep, [new Signal(2), s10], {
		then: [s10],
		else: [s0],
	}, '2 > MyValue.x@MyEvent');

	const res = await step.process();
	t.is(res.getValue(), 0);
});

test('IfStep (mock) - Operands with spaces', async(t) => {
	const positive1 = await mockStep(IfStep, 
		[s2, s1], { then: [s10], else: [s0] }, 
		'2 > My Special Value'
	).process();

	t.is(positive1.getValue(), 10);

	const positive2 = await mockStep(IfStep, 
		[s1, s1], { then: [s10], else: [s0] }, 
		'My Special Value == My Special Value'
	).process();

	t.is(positive2.getValue(), 10);

	const negative1 = await mockStep(IfStep, 
		[s2, s1], { then: [s10], else: [s0] }, 
		'2 < My Special Value'
	).process();

	t.is(negative1.getValue(), 0);

	const negative2 = await mockStep(IfStep, 
		[s1, s1], { then: [s10], else: [s0] }, 
		'My Special Value < My Special Value'
	).process();

	t.is(negative2.getValue(), 0);
});

test('IfStep (mock) - One input, check existing values - else', async(t) => {
	const step = mockStep(IfStep, [sArray4], {
		then: [s2],
		else: [s10],
	}, 'MyValue');

	const res = await step.process();
	t.is(res.getValue(), 10);
});

test('IfStep (mock) - One input, check existing values - then', async(t) => {
	const step = mockStep(IfStep, [sArray3], {
		then: [s2],
		else: [s10],
	}, 'MyValue');

	const res = await step.process();
	t.is(res.getValue(), 2);
});

test('IfStep (mock) - One input - else', async(t) => {
	const step1 = mockStep(IfStep, [sNaN], {
		then: [s2],
		else: [s10],
	}, 'MyValue');

	const res1 = await step1.process();
	t.is(res1.getValue(), 10);

	const step2 = mockStep(IfStep, [s0], {
		then: [s2],
		else: [s10],
	}, 'MyValue');

	const res2 = await step2.process();
	t.is(res2.getValue(), 10);
});

test('IfStep (mock) - One input, int array (3)', async(t) => {
	const positive = await mockStep(IfStep, [new Signal(i32(1, 2, 3))], { 
		then: [s2],
		else: [s10], 
	}, 'MyValue').process();

	t.is(positive.getValue(), 2);

	const negative = await mockStep(IfStep, [new Signal(i32(1, 2, 3))], { 
		then: [s2],
		else: [s10], 
	}, '!MyValue').process();
	
	t.is(negative.getValue(), 10);
});

test('IfStep (mock) - One input, inverted', async(t) => {
	const positive = await mockStep(IfStep, [undefined], { 
		then: [s2],
		else: [s10], 
	}, '!a').process();

	t.is(positive.getValue(), 2);

	const negative = await mockStep(IfStep, [s1], { 
		then: [s2],
		else: [s10], 
	}, '!a').process();

	t.is(negative.getValue(), 10);
});

test('IfStep (mock) - One input - int array (1)', async(t) => {
	const step = mockStep(IfStep, [new Signal(i32(1, 2, 3))], {
		then: [s2],
		else: [s10],
	}, 'MyValue');
	
	const res = await step.process();
	t.is(res.getValue(), 2);
});

test('IfStep (mock) - One input - float array', async(t) => {
	const step = mockStep(IfStep, [new Signal(i32(1, 2, 3))], {
		then: [s2],
		else: [s10],
	}, 'MyValue');
	
	const res = await step.process();
	t.is(res.getValue(), 2);
});

test('IfStep (mock) - One input, function - exists', async(t) => {
	const positive = await mockStep(IfStep, 
		[new Signal(i32(1, 2, 3))], { then: [s2], else: [s10] }, 
		'exists(MyValue)'
	).process();

	t.is(positive.getValue(), 2);


	const negative = await mockStep(IfStep, 
		[undefined], { then: [s2], else: [s10] }, 
		'exists(MyValue)'
	).process();

	t.is(negative.getValue(), 10);
});

test('IfStep (mock) - Complex input, function - exists', async(t) => {
	const component = f32(1, 2, 3);
	const v = new VectorSequence(component, component, component, 10);
	const q = new QuaternionSequence(component, component, component, component, 10);
	const s = new Segment('MySegment', v, q);
	const j = new Joint('MyJoint', v, v, v, f32(4, 5, 6), 10);

	const step1 = await mockStep(IfStep,
		[new Signal(v)], { then: [s2], else: [s10] },
		'exists(MyValue)'
	).process();

	t.is(step1.getValue(), 2);

	const step2 = await mockStep(IfStep, 
		[new Signal(s)], { then: [s2], else: [s10] }, 
		'exists(MyValue)'
	).process();

	t.is(step2.getValue(), 2);

	const step3 = await mockStep(IfStep, 
		[new Signal(j)], { then: [s2], else: [s10] }, 
		'exists(MyValue)'
	).process();

	t.is(step3.getValue(), 2);
});

test('IfStep (mock) - Two inputs, function - exists', async(t) => {
	const positive = await mockStep(IfStep, 
		[new Signal(i32(1, 2, 3)), new Signal(5)], { then: [s2], else: [s10] }, 
		'exists(MyValue) && exists(MyValue2)'
	).process();

	t.is(positive.getValue(), 2);

	const negative1 = await mockStep(IfStep, 
		[undefined, new Signal(i32(1, 2, 3))], { then: [s2], else: [s10] }, 
		'exists(MyValue) && exists(MyValue2)'
	).process();

	t.is(negative1.getValue(), 10);

	const negative2 = await mockStep(IfStep, 
		[new Signal(i32(1, 2, 3)), undefined], { then: [s2], else: [s10] }, 
		'exists(MyValue) && exists(MyValue2)'
	).process();

	t.is(negative2.getValue(), 10);
});

test('IfStep (mock) - One input, function - empty', async(t) => {
	// 0 is not empty
	const positive1 = await mockStep(IfStep, 
		[new Signal(0)], { then: [s2], else: [s10] }, 
		'!empty(MyValue)'
	).process();

	t.is(positive1.getValue(), 2);

	const positive2 = await mockStep(IfStep, 
		[new Signal(undefined)], { then: [s2], else: [s10] }, 
		'empty(MyValue)'
	).process();

	t.is(positive2.getValue(), 2);

	const positive3 = await mockStep(IfStep, 
		[undefined], { then: [s2], else: [s10] }, 
		'empty(MyValue)'
	).process();

	t.is(positive3.getValue(), 2);

	const positive4 = await mockStep(IfStep, 
		[new Signal(f32(NaN))], { then: [s2], else: [s10] }, 
		'empty(MyValue)'
	).process();

	t.is(positive4.getValue(), 2);

	const positive5 = await mockStep(IfStep, 
		[new Signal(f32(NaN, NaN, NaN, NaN))], { then: [s2], else: [s10] }, 
		'empty(MyValue)'
	).process();

	t.is(positive5.getValue(), 2);

	const negative1 = await mockStep(IfStep, 
		[new Signal(1)], { then: [s2], else: [s10] }, 
		'empty(MyValue)'
	).process();

	t.is(negative1.getValue(), 10);

	const negative2 = await mockStep(IfStep, 
		[new Signal(f32(1, 2, 3))], { then: [s2], else: [s10] }, 
		'empty(MyValue)'
	).process();

	t.is(negative2.getValue(), 10);

	const negative3 = await mockStep(IfStep, 
		[new Signal('Hello world')], { then: [s2], else: [s10] }, 
		'empty(MyValue)'
	).process();

	t.is(negative3.getValue(), 10);

	// 0 is not empty
	const negative4 = await mockStep(IfStep, 
		[new Signal(0)], { then: [s2], else: [s10] }, 
		'empty(MyValue)'
	).process();

	t.is(negative4.getValue(), 10);

	// 0 is not empty
	const negative5 = await mockStep(IfStep, 
		[new Signal(f32(0, 1, 2, 3))], { then: [s2], else: [s10] }, 
		'empty(MyValue)'
	).process();

	t.is(negative5.getValue(), 10);
});

test('IfStep (mock) - field variable', async(t) => {
	const positive1 = await mockStep(IfStep, 
		[new Signal(3)], { then: [s2], else: [s10] }, 
		'$field(MyValue, My Measurement, numeric) > 2'
	).process();

	t.is(positive1.getValue(), 2);

	const positive2 = await mockStep(IfStep, 
		[new Signal(1)], { then: [s2], else: [s10] }, 
		'exists($field(MyValue, My Measurement, numeric))'
	).process();

	t.is(positive2.getValue(), 2);

	const positive3 = await mockStep(IfStep, 
		[new Signal(f32(NaN))], { then: [s2], else: [s10] }, 
		'empty($field(MyValue, My Measurement, numeric))'
	).process();

	t.is(positive3.getValue(), 2);

	const positive4 = await mockStep(IfStep, 
		[new Signal(f32(1, 2, 3))], { then: [s2], else: [s10] }, 
		'!empty($field(MyValue, My Measurement, numeric))'
	).process();

	t.is(positive4.getValue(), 2);

	const negative1 = await mockStep(IfStep, 
		[new Signal(1)], { then: [s2], else: [s10] }, 
		'$field(MyValue, My Measurement, numeric) > 2'
	).process();

	t.is(negative1.getValue(), 10);

	const negative2 = await mockStep(IfStep, 
		[undefined], { then: [s2], else: [s10] }, 
		'exists($field(MyValue, My Measurement, numeric))'
	).process();

	t.is(negative2.getValue(), 10);

	const negative3 = await mockStep(IfStep, 
		[new Signal(f32(1, 2, 3))], { then: [s2], else: [s10] }, 
		'empty($field(MyValue, My Measurement, numeric))'
	).process();

	t.is(negative3.getValue(), 10);

	const negative4 = await mockStep(IfStep, 
		[new Signal(f32(NaN))], { then: [s2], else: [s10] }, 
		'!empty($field(MyValue, My Measurement, numeric))'
	).process();

	t.is(negative4.getValue(), 10);
});

test('IfStep (mock) - $prev variable', async(t) => {
	const positive1 = await mockStep(IfStep, 
		[new Signal(3)], { then: [s2], else: [s10] }, 
		'$prev > 2'
	).process();

	t.is(positive1.getValue(), 2);

	const positive2 = await mockStep(IfStep, 
		[new Signal(3)], { then: [s2], else: [s10] }, 
		'$prev(2) > 2'
	).process();

	t.is(positive2.getValue(), 2);

	const positive3 = await mockStep(IfStep, 
		[new Signal(1)], { then: [s2], else: [s10] }, 
		'exists($prev(2))'
	).process();

	t.is(positive3.getValue(), 2);

	const positive4 = await mockStep(IfStep, 
		[new Signal(f32(NaN))], { then: [s2], else: [s10] }, 
		'empty($prev(2))'
	).process();

	t.is(positive4.getValue(), 2);

	const positive5 = await mockStep(IfStep, 
		[new Signal(f32(1, 2, 3))], { then: [s2], else: [s10] }, 
		'!empty($prev(2))'
	).process();

	t.is(positive5.getValue(), 2);

	// 0 is not empty
	const positive6 = await mockStep(IfStep, 
		[new Signal(f32(0))], { then: [s2], else: [s10] }, 
		'!empty($prev(2))'
	).process();

	t.is(positive6.getValue(), 2);


	const negative1 = await mockStep(IfStep, 
		[new Signal(1)], { then: [s2], else: [s10] }, 
		'$prev > 2'
	).process();

	t.is(negative1.getValue(), 10);

	const negative2 = await mockStep(IfStep, 
		[new Signal(1)], { then: [s2], else: [s10] }, 
		'$prev > 2'
	).process();

	t.is(negative2.getValue(), 10);

	const negative3 = await mockStep(IfStep, 
		[undefined], { then: [s2], else: [s10] }, 
		'exists($prev(2))'
	).process();

	t.is(negative3.getValue(), 10);

	const negative4 = await mockStep(IfStep, 
		[new Signal(f32(1, 2, 3))], { then: [s2], else: [s10] }, 
		'empty($prev(2))'
	).process();

	t.is(negative4.getValue(), 10);

	const negative5 = await mockStep(IfStep, 
		[new Signal(f32(NaN))], { then: [s2], else: [s10] }, 
		'!empty($prev(2))'
	).process();

	t.is(negative5.getValue(), 10);

	// 0 is not empty
	const negative6 = await mockStep(IfStep, 
		[new Signal(f32(0))], { then: [s2], else: [s10] }, 
		'empty($prev(2))'
	).process();

	t.is(negative6.getValue(), 10);
});