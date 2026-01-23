import test from 'ava';

import { PropertyType } from '../lib/models/property';
import { Signal } from '../lib/models/signal';
import { RoundStep } from '../lib/processing/algorithms/round';
import { BaseStep } from '../lib/processing/base-step';
import { InputDuration } from '../lib/utils/input-duration';

import { f32, mockStep } from './mock-step';

const s1 = new Signal(f32(1, 2, 3));
const s2 = new Signal(f32(4, 5, 6));

test('mockStep - instancing', async (t) => {
	t.assert(mockStep(BaseStep) instanceof BaseStep);
	t.assert(mockStep(RoundStep) instanceof RoundStep);
});

test('mockStep - inputs (array)', async (t) => {
	t.deepEqual(mockStep(BaseStep).inputs, []);
	t.deepEqual(mockStep(BaseStep, []).inputs, []);
	t.deepEqual(mockStep(BaseStep, [s1]).inputs, [s1]);
	t.deepEqual(mockStep(BaseStep, [s1, s2]).inputs, [s1, s2]);
	t.deepEqual(mockStep(BaseStep, [s1, s2]).node.in, ['Input 1', 'Input 2']);
});

test('mockStep - inputs (object)', async (t) => {
	t.deepEqual(mockStep(BaseStep, {}).inputs, []);
	t.deepEqual(mockStep(BaseStep, { inp1: s1, inp2: s2 }).inputs, [s1, s2]);
	t.deepEqual(mockStep(BaseStep, { inp1: s1, inp2: s2 }).node.in, ['inp1', 'inp2']);
});

test('mockStep - options', async (t) => {
	const options = { 
		number: 123, 
		string: 'Hello world!',
		input1: [s1],
		input2: [s2],
		'multi.level': 456,
		'signal.multi-level': [s1],
	};

	const step = mockStep(BaseStep, [], options);

	// getPropertySignalValue
	t.is(step.getPropertySignalValue('input1')[0], s1);
	t.is(step.getPropertySignalValue('input2')[0], s2);
	t.is(step.getPropertySignalValue('number')[0].getValue(), 123);

	// getPropertyValue
	t.is(step.getPropertyValue('number'), options.number);
	t.is(step.getPropertyValue('string'), options.string);
	t.is(step.getPropertyValue('multi.level'), options['multi.level']);
	t.is(step.getPropertyValue('input1'), s1.getValue());
	t.is(step.getPropertyValue('input2'), s2.getValue());

	// getProperty (unused by steps)
	t.is(step.node.getProperty('number'), undefined);

	// getPropertyValue (with type)
	t.is(step.getPropertyValue('number', PropertyType.Number, false, 10), options.number);
	t.is(step.getPropertyValue('number', PropertyType.Any, false, 10), options.number);
	t.is(step.getPropertyValue('number', PropertyType.String, false, 10), options.number); // Should throw in the future
	t.is(step.getPropertyValue('wrong', PropertyType.Number, false, 10), 10);

	// node.hasProperty
	t.assert(step.node.hasProperty('number'));
	t.assert(step.node.hasProperty('string'));
	t.assert(step.node.hasProperty('input1'));
	t.assert(step.node.hasProperty('input2'));
	t.false(step.node.hasProperty('multi.level')); 
	t.assert(step.node.hasProperty('multi'));
	t.false(step.node.hasProperty('signal.multi-level'));
	t.assert(step.node.hasProperty('signal'));
}); 

test('mockStep - options - duration', async (t) => {
	const options = { 
		frames: 123, 
		sec: '10s',
		invalid: 'abc',
	};

	const step = mockStep(BaseStep, [s1], options);

	const frameDur = step.getPropertyValue<InputDuration>('frames', PropertyType.Duration);
	t.assert(frameDur.isValidDuration());
	t.is(frameDur.getFrames(10), 123);
	t.is(frameDur.getSeconds(10), 12.3);

	const secDur = step.getPropertyValue<InputDuration>('sec', PropertyType.Duration);
	t.assert(secDur.isValidDuration());
	t.is(secDur.getFrames(10), 100);
	t.is(secDur.getSeconds(10), 10);

	const invalidDur = step.getPropertyValue<InputDuration>('invalid', PropertyType.Duration);
	t.is(invalidDur, undefined);
});

test('mockStep - originalInputString', async (t) => {
	t.is(mockStep(BaseStep).node.originalInputString, undefined);
	t.is(mockStep(BaseStep, [], {}, 'hello').node.originalInputString, 'hello');
});