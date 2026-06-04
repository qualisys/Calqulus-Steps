import { Signal } from '../models/signal';
import { Unit, Units } from '../models/unit';
import { ArithmeticOp } from './math/arithmetic';

const unitless = Units.fromName('unitless')!;

/**
 * Repeats or pads one operand's unit list to match the operation's component count.
 *
 * A single unit is repeated across compound operands, matching arithmetic
 * steps where scalar values are reused for every component. Missing unit slots
 * stay undefined so they can continue to mean "unknown" rather than "unitless".
 */
const repeatOrPadUnits = (units: (Unit | undefined)[], length: number): (Unit | undefined)[] => {
	if (units.length === 0) {
		return Array.from({ length }, () => undefined);
	}

	if (units.length === 1 && length > 1) {
		return Array.from({ length }, () => units[0]);
	}

	const padded = [...units];

	while (padded.length < length) {
		padded.push(undefined);
	}

	return padded.slice(0, length);
};

/**
 * Returns the unit list for one arithmetic operand.
 *
 * Stored component units are preferred. When the signal has no component unit
 * metadata, the whole-signal unit facade is used so legacy scalar unit
 * propagation continues to work.
 */
const getOperandUnits = (input: Signal): (Unit | undefined)[] => {
	const units = input.getUnits();

	if (units.some(unit => unit !== undefined)) {
		return units;
	}

	const unit = input.getUnit();

	return [unit];
};

/**
 * Resolves one output component unit for an arithmetic operation.
 *
 * Add and subtract preserve a unit only when all defined units match. Multiply
 * and divide treat missing units as unitless only after at least one operand in
 * the component position has a known unit.
 */
const resolveUnitAt = (units: (Unit | undefined)[], operation: ArithmeticOp): Unit | undefined => {
	const anyDefined = units.some(unit => !!unit);

	if (!anyDefined) {
		return undefined;
	}

	switch (operation) {
		case ArithmeticOp.Add:
		case ArithmeticOp.Subtract: {
			const defined = units.filter((unit): unit is Unit => !!unit);
			const first = defined[0];
			const allMatch = defined.every(unit => Units.equals(unit, first));

			return allMatch ? first : undefined;
		}

		case ArithmeticOp.Multiply: {
			return Units.multiply(...units.map(unit => unit ?? unitless));
		}

		case ArithmeticOp.Divide: {
			const [first, ...rest] = units.map(unit => unit ?? unitless);

			return rest.reduce((acc, unit) => Units.divide(acc, unit), first);
		}

		default:
			return undefined;
	}
};

/**
 * Resolves per-component output units for an arithmetic expression.
 *
 * The returned list is aligned with the arithmetic result array. Single-unit
 * operands are broadcast across multi-component operands, so operations such
 * as `segment / segment.x` produce component-specific units instead of
 * collapsing to one whole-signal unit.
 */
export const resolveUnits = (inputs: Signal[], operation: ArithmeticOp): (Unit | undefined)[] => {
	const operandUnitLists = inputs.map(getOperandUnits);
	const length = Math.max(...operandUnitLists.map(units => units.length), 1);
	const unitsByOperand = operandUnitLists.map(units => repeatOrPadUnits(units, length));
	const resolved: (Unit | undefined)[] = [];

	for (let index = 0; index < length; index++) {
		const column = unitsByOperand.map(units => units[index]);
		resolved.push(resolveUnitAt(column, operation));
	}

	return resolved;
};
