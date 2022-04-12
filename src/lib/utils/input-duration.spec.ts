import test from 'ava';

import { InputDuration } from './input-duration';

test('InputDuration - number input - frames', (t) => {
	t.is(new InputDuration(10).getFrames(300), 10);
	t.is(new InputDuration(11.4).getFrames(300), 11);
	t.is(new InputDuration(11.7).getFrames(300), 12);
});

test('InputDuration - string input - frames', (t) => {
	t.is(new InputDuration('10').getFrames(300), 10);
	t.is(new InputDuration('11.7').getFrames(300), 12);
	t.is(new InputDuration('12.7f').getFrames(300), 13);
	t.is(new InputDuration('13.7 f').getFrames(300), 14);
	t.is(new InputDuration('14.4frames').getFrames(300), 14);
	t.is(new InputDuration('15.5 frames').getFrames(300), 16);
});

test('InputDuration - string input - seconds', (t) => {
	t.is(new InputDuration('10s').getSeconds(300), 10);
	t.is(new InputDuration('11.7s').getSeconds(300), 11.7);
	t.is(new InputDuration('13.7 s').getSeconds(300), 13.7);
	t.is(new InputDuration('14.7sec').getSeconds(300), 14.7);
	t.is(new InputDuration('15.7 sec').getSeconds(300), 15.7);
	t.is(new InputDuration('16.7seconds').getSeconds(300), 16.7);
	t.is(new InputDuration('17.7 seconds').getSeconds(300), 17.7);
});

test('InputDuration - string input - converted time units', (t) => {
	t.is(new InputDuration('0.5h').getSeconds(300), 1800);
	t.is(new InputDuration('1 h').getSeconds(300), 3600);
	t.is(new InputDuration('0.5hours').getSeconds(300), 1800);
	t.is(new InputDuration('1 hours').getSeconds(300), 3600);
	t.is(new InputDuration('0.5hrs').getSeconds(300), 1800);
	t.is(new InputDuration('1 hrs').getSeconds(300), 3600);

	t.is(new InputDuration('500ms').getSeconds(300), 0.5);
	t.is(new InputDuration('1500 ms').getSeconds(300), 1.5);
	t.is(new InputDuration('1500ns').getSeconds(300), 0.0000015);
});

test('InputDuration - string input - invalid units', (t) => {
	t.is(new InputDuration('0.5m').isValidDuration(), false);
	t.is(new InputDuration('0.5mm').isValidDuration(), false);
	t.is(new InputDuration('0.5 abc').isValidDuration(), false);
	t.is(new InputDuration('0.5 km/h').isValidDuration(), false);
});

test('InputDuration - string input - invalid strings', (t) => {
	t.is(new InputDuration('seconds').isValidDuration(), false);
	t.is(new InputDuration('---').isValidDuration(), false);
	t.is(new InputDuration('   ').isValidDuration(), false);
	t.is(new InputDuration('\t').isValidDuration(), false);
});


test('InputDuration - convert frames to seconds', (t) => {
	t.is(new InputDuration(750).getSeconds(300), 2.5);
	t.is(new InputDuration(650).getSeconds(100), 6.5);
	t.is(new InputDuration(650).getSeconds(undefined), undefined);
	t.is(new InputDuration(650).getSeconds(0), undefined);
});

test('InputDuration - convert seconds to frames', (t) => {
	t.is(new InputDuration('1.5s').getFrames(300), 450);
	t.is(new InputDuration('4 seconds').getFrames(100), 400);
	t.is(new InputDuration('4 seconds').getFrames(undefined), undefined);
	t.is(new InputDuration('4 seconds').getFrames(0), undefined);
});

test('InputDuration - not rounded frames', (t) => {
	t.is(new InputDuration('0.5s').getFrames(1, false), 0.5);
	t.is(new InputDuration(55.674).getFrames(100, false), 55.674);
});