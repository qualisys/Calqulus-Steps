import test from 'ava';

import { f32 } from '../test-utils/mock-step';

import { IPhaseNode } from './node-interface';
import { Phase } from './phase';
import { IFrameSpan } from './signal';

const testName = 'testPhase';
const startEventName = 'startEvent';
const endEventName = 'endEvent';
const frameCount = 100;

test('Phase - constructor with explicit intervals', (t) => {
	const intervals: IFrameSpan[] = [
		{ start: 10, end: 20 },
		{ start: 30, end: 40 },
		{ start: 50, end: 60 },
	];

	const phase = new Phase(testName, startEventName, endEventName, intervals);

	t.is(phase.name, testName);
	t.is(phase.start, startEventName);
	t.is(phase.end, endEventName);
	t.is(phase.typeName, 'Phase');
	t.is(phase.length, 3);
	t.deepEqual(phase.intervals, intervals);
	t.deepEqual(phase.components, ['intervals']);
	t.is(phase.partial, false);
});

test('Phase - constructor with start and end value arrays', (t) => {
	const startValues = f32(10, 30, 50);
	const endValues = f32(20, 40, 60);

	const phase = new Phase(testName, startEventName, endEventName, startValues, endValues, frameCount);

	t.is(phase.name, testName);
	t.is(phase.start, startEventName);
	t.is(phase.end, endEventName);
	t.is(phase.length, 3);
	t.is(phase.partial, false);

	const intervals = phase.intervals;
	t.is(intervals.length, 3);
	t.is(intervals[0].start, 10);
	t.is(intervals[0].end, 20);
	t.is(intervals[1].start, 30);
	t.is(intervals[1].end, 40);
	t.is(intervals[2].start, 50);
	t.is(intervals[2].end, 60);
});

test('Phase - constructor with IPhaseNode', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		description: 'Test description',
		displayName: 'Test Display Name',
		partial: false,
	} as unknown as IPhaseNode;

	const startValues = f32(10, 30, 50);
	const endValues = f32(20, 40, 60);

	const phase = new Phase(phaseNode, startValues, endValues, frameCount);

	t.is(phase.name, testName);
	t.is(phase.start, startEventName);
	t.is(phase.end, endEventName);
	t.is(phase.description, 'Test description');
	t.is(phase.displayName, 'Test Display Name');
	t.is(phase.length, 3);
	t.is(phase.partial, false);
});

test('Phase - constructor with IPhaseNode and no displayName', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		partial: false,
	} as unknown as IPhaseNode;

	const startValues = f32(10);
	const endValues = f32(20);

	const phase = new Phase(phaseNode, startValues, endValues, frameCount);

	t.is(phase.displayName, testName);
});

test('Phase - fromArray static method', (t) => {
	const array = [f32(10, 20, 30, 40, 50, 60)];
	const phase = Phase.fromArray(testName, startEventName, endEventName, array);

	t.is(phase.name, testName);
	t.is(phase.start, startEventName);
	t.is(phase.end, endEventName);
	t.is(phase.length, 3);

	const intervals = phase.intervals;
	t.is(intervals[0].start, 10);
	t.is(intervals[0].end, 20);
	t.is(intervals[1].start, 30);
	t.is(intervals[1].end, 40);
	t.is(intervals[2].start, 50);
	t.is(intervals[2].end, 60);
});

test('Phase - isPhase static method', (t) => {
	const phase = new Phase(testName, startEventName, endEventName, f32(10), f32(20), frameCount);

	t.true(Phase.isPhase(phase));
	t.false(Phase.isPhase({}));
	t.false(Phase.isPhase(null));
	t.false(Phase.isPhase(undefined));
	t.false(Phase.isPhase({ typeName: 'NotPhase' }));
});

test('Phase - getComponent', (t) => {
	const intervals: IFrameSpan[] = [
		{ start: 10, end: 20 },
		{ start: 30, end: 40 },
	];

	const phase = new Phase(testName, startEventName, endEventName, intervals);

	const component = phase.getComponent('intervals');
	t.truthy(component);
	t.deepEqual(Array.from(component), [10, 20, 30, 40]);
});

test('Phase - length getter with no intervals', (t) => {
	const phase = new Phase(testName, startEventName, endEventName, f32(), f32(), frameCount);

	t.is(phase.length, 0);
});

test('Phase - array property', (t) => {
	const startValues = f32(10, 30);
	const endValues = f32(20, 40);

	const phase = new Phase(testName, startEventName, endEventName, startValues, endValues, frameCount);

	t.is(phase.array.length, 1);
	t.deepEqual(Array.from(phase.array[0]), [10, 20, 30, 40]);
});

test('Phase - partial phase with imputed start frame', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		partial: true,
	} as unknown as IPhaseNode;

	const startValues = f32(50);
	const endValues = f32(30, 60);

	const phase = new Phase(phaseNode, startValues, endValues, frameCount);

	t.is(phase.partial, true);

	const intervals = phase.intervals;
	t.is(intervals.length, 2);
	t.is(intervals[0].start, 1);
	t.is(intervals[0].end, 30);
	t.is(intervals[0].partial, true);
	t.is(intervals[1].start, 50);
	t.is(intervals[1].end, 60);
	t.is(intervals[1].partial, undefined);
});

test('Phase - partial phase with imputed end frame', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		partial: true,
	} as unknown as IPhaseNode;

	const startValues = f32(10, 50);
	const endValues = f32(20);

	const phase = new Phase(phaseNode, startValues, endValues, frameCount);

	t.is(phase.partial, true);

	const intervals = phase.intervals;
	t.is(intervals.length, 2);
	t.is(intervals[0].start, 10);
	t.is(intervals[0].end, 20);
	t.is(intervals[0].partial, undefined);
	t.is(intervals[1].start, 50);
	t.is(intervals[1].end, frameCount);
	t.is(intervals[1].partial, true);
});

test('Phase - partial phase with both imputed start and end frames', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		partial: true,
	} as unknown as IPhaseNode;

	const startValues = f32(30, 60);
	const endValues = f32(20, 50);

	const phase = new Phase(phaseNode, startValues, endValues, frameCount);

	t.is(phase.partial, true);

	const intervals = phase.intervals;
	t.is(intervals.length, 3);
	t.is(intervals[0].start, 1);
	t.is(intervals[0].end, 20);
	t.is(intervals[0].partial, true);
	t.is(intervals[1].start, 30);
	t.is(intervals[1].end, 50);
	t.is(intervals[1].partial, undefined);
	t.is(intervals[2].start, 60);
	t.is(intervals[2].end, frameCount);
	t.is(intervals[2].partial, true);
});

test('Phase - partial phase with empty start values', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		partial: true,
	} as unknown as IPhaseNode;

	const startValues = f32();
	const endValues = f32(30);

	const phase = new Phase(phaseNode, startValues, endValues, frameCount);

	t.is(phase.partial, true);

	const intervals = phase.intervals;
	t.is(intervals.length, 1);
	t.is(intervals[0].start, 1);
	t.is(intervals[0].end, 30);
	t.is(intervals[0].partial, true);
});

test('Phase - partial phase with empty end values', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		partial: true,
	} as unknown as IPhaseNode;

	const startValues = f32(30);
	const endValues = f32();

	const phase = new Phase(phaseNode, startValues, endValues, frameCount);

	t.is(phase.partial, true);

	const intervals = phase.intervals;
	t.is(intervals.length, 1);
	t.is(intervals[0].start, 30);
	t.is(intervals[0].end, frameCount);
	t.is(intervals[0].partial, true);
});

test('Phase - non-partial phase does not mark intervals as partial', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		partial: false,
	} as unknown as IPhaseNode;

	const startValues = f32(10);
	const endValues = f32(20);

	const phase = new Phase(phaseNode, startValues, endValues, frameCount);

	const intervals = phase.intervals;
	t.is(intervals.length, 1);
	t.is(intervals[0].partial, undefined);
});

test('Phase - intervals getter does not modify non-partial phases', (t) => {
	const startValues = f32(10, 30);
	const endValues = f32(20, 40);

	const phase = new Phase(testName, startEventName, endEventName, startValues, endValues, frameCount);

	const intervals1 = phase.intervals;
	const intervals2 = phase.intervals;

	t.is(intervals1, intervals2);
	t.is(intervals1[0].partial, undefined);
	t.is(intervals1[1].partial, undefined);
});

test('Phase - event sequence pairing behavior', (t) => {
	const startValues = f32(5, 15, 25, 35);
	const endValues = f32(10, 20, 30, 40);

	const phase = new Phase(testName, startEventName, endEventName, startValues, endValues, frameCount);

	const intervals = phase.intervals;
	t.is(intervals.length, 4);
	t.is(intervals[0].start, 5);
	t.is(intervals[0].end, 10);
	t.is(intervals[1].start, 15);
	t.is(intervals[1].end, 20);
	t.is(intervals[2].start, 25);
	t.is(intervals[2].end, 30);
	t.is(intervals[3].start, 35);
	t.is(intervals[3].end, 40);
});

test('Phase - overlapping events are handled correctly', (t) => {
	const startValues = f32(5, 15);
	const endValues = f32(25, 35);

	const phase = new Phase(testName, startEventName, endEventName, startValues, endValues, frameCount);

	const intervals = phase.intervals;
	t.is(intervals.length, 1);
	t.is(intervals[0].start, 15);
	t.is(intervals[0].end, 25);
});

test('Phase - more end events than start events', (t) => {
	const startValues = f32(10, 30);
	const endValues = f32(20, 40, 60);

	const phase = new Phase(testName, startEventName, endEventName, startValues, endValues, frameCount);

	const intervals = phase.intervals;
	t.is(intervals.length, 2);
	t.is(intervals[0].start, 10);
	t.is(intervals[0].end, 20);
	t.is(intervals[1].start, 30);
	t.is(intervals[1].end, 40);
});

test('Phase - more start events than end events', (t) => {
	const startValues = f32(10, 30, 50);
	const endValues = f32(20, 40);

	const phase = new Phase(testName, startEventName, endEventName, startValues, endValues, frameCount);

	const intervals = phase.intervals;
	t.is(intervals.length, 2);
	t.is(intervals[0].start, 10);
	t.is(intervals[0].end, 20);
	t.is(intervals[1].start, 30);
	t.is(intervals[1].end, 40);
});

test('Phase - description getter', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		description: 'Test description',
		partial: false,
	} as unknown as IPhaseNode;

	const phase = new Phase(phaseNode, f32(10), f32(20), frameCount);

	t.is(phase.description, 'Test description');
});

test('Phase - displayName getter with no explicit displayName', (t) => {
	const phase = new Phase(testName, startEventName, endEventName, f32(10), f32(20), frameCount);

	t.is(phase.displayName, testName);
});

test('Phase - displayName getter with explicit displayName', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		displayName: 'Custom Display Name',
		partial: false,
	} as unknown as IPhaseNode;

	const phase = new Phase(phaseNode, f32(10), f32(20), frameCount);

	t.is(phase.displayName, 'Custom Display Name');
});

test('Phase - empty start and end values produce no intervals', (t) => {
	const startValues = f32();
	const endValues = f32();

	const phase = new Phase(testName, startEventName, endEventName, startValues, endValues, frameCount);

	t.is(phase.length, 0);
	t.deepEqual(phase.intervals, []);
});

test('Phase - single interval', (t) => {
	const startValues = f32(10);
	const endValues = f32(20);

	const phase = new Phase(testName, startEventName, endEventName, startValues, endValues, frameCount);

	const intervals = phase.intervals;
	t.is(intervals.length, 1);
	t.is(intervals[0].start, 10);
	t.is(intervals[0].end, 20);
});

test('Phase - multiple intervals with gaps', (t) => {
	const intervals: IFrameSpan[] = [
		{ start: 5, end: 10 },
		{ start: 20, end: 30 },
		{ start: 40, end: 50 },
		{ start: 60, end: 70 },
	];

	const phase = new Phase(testName, startEventName, endEventName, intervals);

	t.is(phase.length, 4);
	t.deepEqual(phase.intervals, intervals);
});

test('Phase - constructor without frameCount', (t) => {
	const intervals: IFrameSpan[] = [
		{ start: 10, end: 20 },
	];

	const phase = new Phase(testName, startEventName, endEventName, intervals);

	t.is(phase.name, testName);
	t.is(phase.length, 1);
	t.deepEqual(phase.intervals, intervals);
});

test('Phase - partial phase without frameCount should not impute', (t) => {
	const phaseNode = {
		name: testName,
		start: startEventName,
		end: endEventName,
		partial: true,
	} as unknown as IPhaseNode;

	const startValues = f32(50);
	const endValues = f32(30, 60);

	const phase = new Phase(phaseNode, startValues, endValues);

	const intervals = phase.intervals;
	t.is(intervals.length, 1);
	t.is(intervals[0].start, 50);
	t.is(intervals[0].end, 60);
});

test('Phase - components array contains intervals', (t) => {
	const phase = new Phase(testName, startEventName, endEventName, f32(10), f32(20), frameCount);

	t.deepEqual(phase.components, ['intervals']);
});

test('Phase - typeName is Phase', (t) => {
	const phase = new Phase(testName, startEventName, endEventName, f32(10), f32(20), frameCount);

	t.is(phase.typeName, 'Phase');
});

test('Phase - getComponent with invalid component returns undefined', (t) => {
	const phase = new Phase(testName, startEventName, endEventName, f32(10, 30), f32(20, 40), frameCount);

	t.is(phase.getComponent('invalid'), undefined);
	t.is(phase.getComponent('x'), undefined);
	t.is(phase.getComponent(''), undefined);
});

test('Phase - fromArray with empty array', (t) => {
	const array = [f32()];
	const phase = Phase.fromArray(testName, startEventName, endEventName, array);

	t.is(phase.length, 0);
	t.deepEqual(phase.intervals, []);
});

test('Phase - fromArray with single interval', (t) => {
	const array = [f32(5, 15)];
	const phase = Phase.fromArray(testName, startEventName, endEventName, array);

	t.is(phase.length, 1);
	t.is(phase.intervals[0].start, 5);
	t.is(phase.intervals[0].end, 15);
});

test('Phase - description is undefined when not set', (t) => {
	const phase = new Phase(testName, startEventName, endEventName, f32(10), f32(20), frameCount);

	t.is(phase.description, undefined);
});

test('Phase - end getter returns end event name', (t) => {
	const phase = new Phase(testName, startEventName, endEventName, f32(10), f32(20), frameCount);

	t.is(phase.end, endEventName);
});
