import test from 'ava';

import { mockStep } from '../../test-utils/mock-step';
import { Signal } from '../../models/signal';

import { ConvertStep } from './convert';

const f1 = new Signal(32);

const stepOptions = (from?, to?) => {
	const options = {};

	if (from) { options['from'] = from; }
	if (to) { options['to'] = to; }

	return options;
};

// TODO: Enable once BaseNode throws on getPropertyValue
/*
test('ConvertStep - missing required options', async (t) => {
	t.throws(() => new ConvertStep(stepNode(), [f1])); // No 'from' or 'to'
	t.throws(() => new ConvertStep(stepNode('m'), [f1])); // No 'from'
	t.throws(() => new ConvertStep(stepNode(undefined, 'mm'), [f1])); // No 'to'
});
*/

test('ConvertStep - unrecognized units', async (t) => {
	t.throws(() => mockStep(ConvertStep, [f1], stepOptions('hello', 'world')));
});

test('ConvertStep - Simple conversion', async (t) => {
	const res = await mockStep(ConvertStep, [f1], stepOptions('m', 'mm')).process();

	t.is(res.getValue(), 32000);
});

test('ConvertStep - unit is set from "to" option', async (t) => {
	const res = await mockStep(ConvertStep, [f1], stepOptions('rad', 'deg')).process();

	t.is(res.unit?.name, 'deg');
});

test('ConvertStep - unit reflects target regardless of input unit', async (t) => {
	const input = new Signal(32);
	const res = await mockStep(ConvertStep, [input], stepOptions('m', 'mm')).process();

	t.is(res.unit?.name, 'mm');
});