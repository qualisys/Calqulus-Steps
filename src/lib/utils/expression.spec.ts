import test from 'ava';

import { parseExpressionOperands } from './expression';

const defaultResult = {
	isInverted: false, 
	empty: false, 
	exists: false,
};

test('parseExpressionOperands - simple numeric', (t) => {
	t.deepEqual(parseExpressionOperands('1 > 2'), {
		expression: '1 > 2',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 < 2'), {
		expression: '1 < 2',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 == 2'), {
		expression: '1 == 2',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 != 2'), {
		expression: '1 != 2',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 && 2'), {
		expression: '1 && 2',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 || 2'), {
		expression: '1 || 2',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult },
		]
	});
});

test('parseExpressionOperands - simple variables', (t) => {
	t.deepEqual(parseExpressionOperands('hello > world'), {
		expression: 'hello > world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello < world'), {
		expression: 'hello < world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello == world'), {
		expression: 'hello == world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello != world'), {
		expression: 'hello != world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello && world'), {
		expression: 'hello && world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello || world'), {
		expression: 'hello || world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - simple variables with whitespace', (t) => {
	t.deepEqual(parseExpressionOperands('My Simple Signal > My Other Signal'), {
		expression: 'operand_0_MySimpleSignal > operand_1_MyOtherSignal',
		operands: [
			{ value: 'operand_0_MySimpleSignal', originalValue: 'My Simple Signal', ...defaultResult }, 
			{ value: 'operand_1_MyOtherSignal', originalValue: 'My Other Signal', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('My Simple Signal > My Simple Signal'), {
		expression: 'operand_0_MySimpleSignal > operand_1_MySimpleSignal',
		operands: [
			{ value: 'operand_0_MySimpleSignal', originalValue: 'My Simple Signal', ...defaultResult }, 
			{ value: 'operand_1_MySimpleSignal', originalValue: 'My Simple Signal', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('My Simple Signal.x > My Simple Signal.y'), {
		expression: 'operand_0_MySimpleSignal.x > operand_1_MySimpleSignal.y',
		operands: [
			{ value: 'operand_0_MySimpleSignal.x', originalValue: 'My Simple Signal.x', ...defaultResult }, 
			{ value: 'operand_1_MySimpleSignal.y', originalValue: 'My Simple Signal.y', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - simple mixed', (t) => {
	t.deepEqual(parseExpressionOperands('hello > 1'), {
		expression: 'hello > 1',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 1, originalValue: 1, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello < 1'), {
		expression: 'hello < 1',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 1, originalValue: 1, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello == 1'), {
		expression: 'hello == 1',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 1, originalValue: 1, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello != 1'), {
		expression: 'hello != 1',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 1, originalValue: 1, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello && 1'), {
		expression: 'hello && 1',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 1, originalValue: 1, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello || 1'), {
		expression: 'hello || 1',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 1, originalValue: 1, ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('1 > hello'), {
		expression: '1 > hello',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 'hello', originalValue: 'hello', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 < hello'), {
		expression: '1 < hello',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 'hello', originalValue: 'hello', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 == hello'), {
		expression: '1 == hello',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 'hello', originalValue: 'hello', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 != hello'), {
		expression: '1 != hello',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 'hello', originalValue: 'hello', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 && hello'), {
		expression: '1 && hello',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 'hello', originalValue: 'hello', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 || hello'), {
		expression: '1 || hello',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 'hello', originalValue: 'hello', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - chained numeric', (t) => {
	t.deepEqual(parseExpressionOperands('1 > 2 && 3 < 4'), {
		expression: '1 > 2 && 3 < 4',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult }, 
			{ value: 3, originalValue: 3, ...defaultResult }, 
			{ value: 4, originalValue: 4, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 > 2 || 3 < 4'), {
		expression: '1 > 2 || 3 < 4',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult }, 
			{ value: 3, originalValue: 3, ...defaultResult }, 
			{ value: 4, originalValue: 4, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 > 2 && 3 < 4 || 5 == 6'), {
		expression: '1 > 2 && 3 < 4 || 5 == 6',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult }, 
			{ value: 3, originalValue: 3, ...defaultResult }, 
			{ value: 4, originalValue: 4, ...defaultResult }, 
			{ value: 5, originalValue: 5, ...defaultResult }, 
			{ value: 6, originalValue: 6, ...defaultResult },
		]
	});
});

test('parseExpressionOperands - chained variables', (t) => {
	t.deepEqual(parseExpressionOperands('hello > world && foo < bar'), {
		expression: 'hello > world && foo < bar',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult }, 
			{ value: 'foo', originalValue: 'foo', ...defaultResult }, 
			{ value: 'bar', originalValue: 'bar', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello > world || foo < bar'), {
		expression: 'hello > world || foo < bar',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult }, 
			{ value: 'foo', originalValue: 'foo', ...defaultResult }, 
			{ value: 'bar', originalValue: 'bar', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello > world && foo < bar || baz == qux'), {
		expression: 'hello > world && foo < bar || baz == qux',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult }, 
			{ value: 'foo', originalValue: 'foo', ...defaultResult }, 
			{ value: 'bar', originalValue: 'bar', ...defaultResult }, 
			{ value: 'baz', originalValue: 'baz', ...defaultResult }, 
			{ value: 'qux', originalValue: 'qux', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - chained mixed', (t) => {
	t.deepEqual(parseExpressionOperands('hello > 1 && 2 < world'), {
		expression: 'hello > 1 && 2 < world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello > 1 || 2 < world'), {
		expression: 'hello > 1 || 2 < world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello > 1 && 2 < world || 3 == foo'), {
		expression: 'hello > 1 && 2 < world || 3 == foo',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult }, 
			{ value: 3, originalValue: 3, ...defaultResult }, 
			{ value: 'foo', originalValue: 'foo', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('1 > hello && world < 2'), {
		expression: '1 > hello && world < 2',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 > hello || world < 2'), {
		expression: '1 > hello || world < 2',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('1 > hello && world < 2 || foo == 3'), {
		expression: '1 > hello && world < 2 || foo == 3',
		operands: [
			{ value: 1, originalValue: 1, ...defaultResult }, 
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult }, 
			{ value: 2, originalValue: 2, ...defaultResult }, 
			{ value: 'foo', originalValue: 'foo', ...defaultResult }, 
			{ value: 3, originalValue: 3, ...defaultResult },
		]
	});
});

test('parseExpressionOperands - whitespace variations', (t) => {
	t.deepEqual(parseExpressionOperands('hello>world'), {
		expression: 'hello>world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello >world'), {
		expression: 'hello >world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello> world'), {
		expression: 'hello> world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello&&world'), {
		expression: 'hello&&world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello &&world'), {
		expression: 'hello &&world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello&& world'), {
		expression: 'hello&& world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello||world'), {
		expression: 'hello||world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello ||world'), {
		expression: 'hello ||world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello|| world'), {
		expression: 'hello|| world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});


	t.deepEqual(parseExpressionOperands(' hello>world '), {
		expression: 'hello>world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands(' hello>world'), {
		expression: 'hello>world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	t.deepEqual(parseExpressionOperands('hello>world '), {
		expression: 'hello>world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('\thello>world    '), {
		expression: 'hello>world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('\thello>world'), {
		expression: 'hello>world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	
	t.deepEqual(parseExpressionOperands('hello>world\t'), {
		expression: 'hello>world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
	
	t.deepEqual(parseExpressionOperands('     hello      >         world       '), {
		expression: 'hello > world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult }, 
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - negations', (t) => {
	t.deepEqual(parseExpressionOperands('!hello'), {
		expression: '!hello',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, isInverted: true },
		]
	});
	t.deepEqual(parseExpressionOperands('!hello && !world'), {
		expression: '!hello && !world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, isInverted: true }, 
			{ value: 'world', originalValue: 'world', ...defaultResult, isInverted: true },
		]
	});
	t.deepEqual(parseExpressionOperands('!hello || !world'), {
		expression: '!hello || !world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, isInverted: true }, 
			{ value: 'world', originalValue: 'world', ...defaultResult, isInverted: true },
		]
	});
	t.deepEqual(parseExpressionOperands('!hello && !world || foo'), {
		expression: '!hello && !world || foo',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, isInverted: true }, 
			{ value: 'world', originalValue: 'world', ...defaultResult, isInverted: true }, 
			{ value: 'foo', originalValue: 'foo', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - parenthesis', (t) => {
	t.deepEqual(parseExpressionOperands('(hello > world) && !foo'), {
		expression: '(hello > world) && !foo',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult },
			{ value: 'world', originalValue: 'world', ...defaultResult },
			{ value: 'foo', originalValue: 'foo', ...defaultResult, isInverted: true },
		]
	});

	t.deepEqual(parseExpressionOperands('(hello > world) && !(foo || bar)'), {
		expression: '(hello > world) && !(foo || bar)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult },
			{ value: 'world', originalValue: 'world', ...defaultResult },
			{ value: 'foo', originalValue: 'foo', ...defaultResult },
			{ value: 'bar', originalValue: 'bar', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - functions - empty', (t) => {
	t.deepEqual(parseExpressionOperands('empty(hello)'), {
		expression: 'hello',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, empty: true },
		]
	});

	t.deepEqual(parseExpressionOperands('empty(hello) && world'), {
		expression: 'hello && world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, empty: true },
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('(empty(hello) && world)'), {
		expression: '(hello && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, empty: true },
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!(empty(hello) && world)'), {
		expression: '!(hello && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, empty: true },
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!((empty(hello)) && world)'), {
		expression: '!((hello) && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, empty: true },
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!(!empty(hello) && world)'), {
		expression: '!(!hello && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, empty: true, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!(!empty(hello) && empty(world))'), {
		expression: '!(!hello && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, empty: true, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true },
		]
	});

	t.deepEqual(parseExpressionOperands('!(!hello && empty(world))'), {
		expression: '!(!hello && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true },
		]
	});

	t.deepEqual(parseExpressionOperands('!(!hello && (!empty(world) || foo))'), {
		expression: '!(!hello && (!world || foo))',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true, isInverted: true },
			{ value: 'foo', originalValue: 'foo', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - functions - exists', (t) => {
	t.deepEqual(parseExpressionOperands('exists(hello)'), {
		expression: 'hello',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
		]
	});

	t.deepEqual(parseExpressionOperands('exists(hello) && world'), {
		expression: 'hello && world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('(exists(hello) && world)'), {
		expression: '(hello && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!(exists(hello) && world)'), {
		expression: '!(hello && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!((exists(hello)) && world)'), {
		expression: '!((hello) && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!(!exists(hello) && world)'), {
		expression: '!(!hello && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!(!exists(hello) && exists(world))'), {
		expression: '!(!hello && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, exists: true },
		]
	});

	t.deepEqual(parseExpressionOperands('!(!hello && exists(world))'), {
		expression: '!(!hello && world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, exists: true },
		]
	});

	t.deepEqual(parseExpressionOperands('!(!hello && (!exists(world) || foo))'), {
		expression: '!(!hello && (!world || foo))',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, exists: true, isInverted: true },
			{ value: 'foo', originalValue: 'foo', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - functions - exists & empty mixed', (t) => {
	t.deepEqual(parseExpressionOperands('exists(hello) && empty(world)'), {
		expression: 'hello && world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true },
		]
	});

	t.deepEqual(parseExpressionOperands('empty(hello) && exists(world)'), {
		expression: 'hello && world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, empty: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, exists: true },
		]
	});

	t.deepEqual(parseExpressionOperands('exists(hello) && !empty(world)'), {
		expression: 'hello && !world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true, isInverted: true },
		]
	});

	t.deepEqual(parseExpressionOperands('!exists(hello) && empty(world)'), {
		expression: '!hello && world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true },
		]
	});

	t.deepEqual(parseExpressionOperands('!exists(hello) && !empty(world)'), {
		expression: '!hello && !world',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true, isInverted: true },
		]
	});

	t.deepEqual(parseExpressionOperands('!exists(hello) && !empty(world) && foo'), {
		expression: '!hello && !world && foo',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true, isInverted: true },
			{ value: 'foo', originalValue: 'foo', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!exists(hello) && !empty(world) && !foo'), {
		expression: '!hello && !world && !foo',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true, isInverted: true },
			{ value: 'foo', originalValue: 'foo', ...defaultResult, isInverted: true },
		]
	});

	t.deepEqual(parseExpressionOperands('!exists(hello) && !empty(world) && !(foo || bar)'), {
		expression: '!hello && !world && !(foo || bar)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true, isInverted: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true, isInverted: true },
			{ value: 'foo', originalValue: 'foo', ...defaultResult },
			{ value: 'bar', originalValue: 'bar', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!(exists(hello) && !empty(world)) && !(foo && bar)'), {
		expression: '!(hello && !world) && !(foo && bar)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true, isInverted: true },
			{ value: 'foo', originalValue: 'foo', ...defaultResult },
			{ value: 'bar', originalValue: 'bar', ...defaultResult },
		]
	});
	
	t.deepEqual(parseExpressionOperands('(exists(hello) && !empty(world))'), {
		expression: '(hello && !world)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'world', originalValue: 'world', ...defaultResult, empty: true, isInverted: true },
		]
	});
});

test('parseExpressionOperands - arrow output', (t) => {
	t.deepEqual(parseExpressionOperands('hello => world'), {
		expression: 'hello => world',
		operands: []
	});

	t.deepEqual(parseExpressionOperands('hello > foo => world'), {
		expression: 'hello > foo => world',
		operands: []
	});
});

test('parseExpressionOperands - variable inputs', (t) => {
	t.deepEqual(parseExpressionOperands('$field(Field Name)'), {
		expression: 'operand_0_$field_FieldName',
		operands: [
			{ value: 'operand_0_$field_FieldName', originalValue: '$field(Field Name)', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!$field(Field Name)'), {
		expression: '!operand_0_$field_FieldName',
		operands: [
			{ value: 'operand_0_$field_FieldName', originalValue: '$field(Field Name)', ...defaultResult, isInverted: true },
		]
	});

	t.deepEqual(parseExpressionOperands('exists(hello) && $field(Field Name)'), {
		expression: 'hello && operand_1_$field_FieldName',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'operand_1_$field_FieldName', originalValue: '$field(Field Name)', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('exists(hello) && !$field(Field Name)'), {
		expression: 'hello && !operand_1_$field_FieldName',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'operand_1_$field_FieldName', originalValue: '$field(Field Name)', ...defaultResult, isInverted: true },
		]
	});

	t.deepEqual(parseExpressionOperands('(exists(hello) && $field(Field Name))'), {
		expression: '(hello && operand_1_$field_FieldName)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'operand_1_$field_FieldName', originalValue: '$field(Field Name)', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - variable inputs - with options', (t) => {
	t.deepEqual(parseExpressionOperands('$field(Field Name, My Measurement, numeric)'), {
		expression: 'operand_0_$field_FieldName_MyMeasurement_numeric',
		operands: [
			{ value: 'operand_0_$field_FieldName_MyMeasurement_numeric', originalValue: '$field(Field Name, My Measurement, numeric)', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('!$field(Field Name, My Measurement, numeric)'), {
		expression: '!operand_0_$field_FieldName_MyMeasurement_numeric',
		operands: [
			{ value: 'operand_0_$field_FieldName_MyMeasurement_numeric', originalValue: '$field(Field Name, My Measurement, numeric)', ...defaultResult, isInverted: true },
		]
	});

	t.deepEqual(parseExpressionOperands('exists(hello) && $field(Field Name, My Measurement, numeric)'), {
		expression: 'hello && operand_1_$field_FieldName_MyMeasurement_numeric',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'operand_1_$field_FieldName_MyMeasurement_numeric', originalValue: '$field(Field Name, My Measurement, numeric)', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('exists(hello) && !$field(Field Name, My Measurement, numeric)'), {
		expression: 'hello && !operand_1_$field_FieldName_MyMeasurement_numeric',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'operand_1_$field_FieldName_MyMeasurement_numeric', originalValue: '$field(Field Name, My Measurement, numeric)', ...defaultResult, isInverted: true },
		]
	});

	t.deepEqual(parseExpressionOperands('(exists(hello) && $field(Field Name, My Measurement, numeric))'), {
		expression: '(hello && operand_1_$field_FieldName_MyMeasurement_numeric)',
		operands: [
			{ value: 'hello', originalValue: 'hello', ...defaultResult, exists: true },
			{ value: 'operand_1_$field_FieldName_MyMeasurement_numeric', originalValue: '$field(Field Name, My Measurement, numeric)', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - variable inputs - with options - with functions', (t) => {
	t.deepEqual(parseExpressionOperands('empty($field(Field Name, My Measurement, numeric))'), {
		expression: 'operand_0_$field_FieldName_MyMeasurement_numeric',
		operands: [
			{ value: 'operand_0_$field_FieldName_MyMeasurement_numeric', originalValue: '$field(Field Name, My Measurement, numeric)', ...defaultResult, empty: true },
		]
	});

	t.deepEqual(parseExpressionOperands('exists($field(Field Name, My Measurement, numeric))'), {
		expression: 'operand_0_$field_FieldName_MyMeasurement_numeric',
		operands: [
			{ value: 'operand_0_$field_FieldName_MyMeasurement_numeric', originalValue: '$field(Field Name, My Measurement, numeric)', ...defaultResult, exists: true },
		]
	});

	t.deepEqual(parseExpressionOperands('(exists($field(Field Name, My Measurement, numeric)) && !empty($field(Field Name, My Measurement, numeric)))'), {
		expression: '(operand_0_$field_FieldName_MyMeasurement_numeric && !operand_1_$field_FieldName_MyMeasurement_numeric)',
		operands: [
			{ value: 'operand_0_$field_FieldName_MyMeasurement_numeric', originalValue: '$field(Field Name, My Measurement, numeric)', ...defaultResult, exists: true },
			{ value: 'operand_1_$field_FieldName_MyMeasurement_numeric', originalValue: '$field(Field Name, My Measurement, numeric)', ...defaultResult, empty: true, isInverted: true },
		]
	});
});

test('parseExpressionOperands - $prev inputs', (t) => {
	t.deepEqual(parseExpressionOperands('$prev'), {
		expression: '$prev',
		operands: [
			{ value: '$prev', originalValue: '$prev', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('$prev(2)'), {
		expression: '$prev_2',
		operands: [
			{ value: '$prev_2', originalValue: '$prev(2)', ...defaultResult },
		]
	});

	t.deepEqual(parseExpressionOperands('$prev( 2 )'), {
		expression: 'operand_0_$prev_2',
		operands: [
			{ value: 'operand_0_$prev_2', originalValue: '$prev( 2 )', ...defaultResult },
		]
	});
});

test('parseExpressionOperands - $prev inputs - with functions', (t) => {
	t.deepEqual(parseExpressionOperands('empty($prev)'), {
		expression: '$prev',
		operands: [
			{ value: '$prev', originalValue: '$prev', ...defaultResult, empty: true },
		]
	});

	t.deepEqual(parseExpressionOperands('empty($prev(2))'), {
		expression: '$prev_2',
		operands: [
			{ value: '$prev_2', originalValue: '$prev(2)', ...defaultResult, empty: true },
		]
	});

	t.deepEqual(parseExpressionOperands('empty($prev( 2 ))'), {
		expression: 'operand_0_$prev_2',
		operands: [
			{ value: 'operand_0_$prev_2', originalValue: '$prev( 2 )', ...defaultResult, empty: true },
		]
	});

	t.deepEqual(parseExpressionOperands('exists($prev)'), {
		expression: '$prev',
		operands: [
			{ value: '$prev', originalValue: '$prev', ...defaultResult, exists: true },
		]
	});

	t.deepEqual(parseExpressionOperands('exists($prev(2))'), {
		expression: '$prev_2',
		operands: [
			{ value: '$prev_2', originalValue: '$prev(2)', ...defaultResult, exists: true },
		]
	});

	t.deepEqual(parseExpressionOperands('exists($prev( 2 ))'), {
		expression: 'operand_0_$prev_2',
		operands: [
			{ value: 'operand_0_$prev_2', originalValue: '$prev( 2 )', ...defaultResult, exists: true },
		]
	});
});

test('parseExpressionOperands - @ syntax', (t) => {
	t.deepEqual(parseExpressionOperands('hello@event'), {
		expression: 'hello@event',
		operands: [
			{ value: 'hello@event', originalValue: 'hello@event', ...defaultResult },
		]
	});
});
