import { VectorSequence } from './sequence/vector-sequence';
import { IVector } from './spatial/vector';

export class ForcePlate {
	amplifierSerial: string | null = null;
	centerOfPressure: VectorSequence;
	coordinateSystem: string | null = null;
	force: VectorSequence;
	model: string | null = null;
	moment: VectorSequence;
	serial: string | null = null;
	type: string | null = null;

	constructor(
		public name: string,
		public corners: IVector[],
		public width: number,
		public length: number,
		public offset: IVector,
		public copLevelZ: number,
		public copFilter: boolean
	) {
	}

	public setMetadata(type: string, model: string, serial: string, amplifierSerial: string, coordinateSystem: string) {
		this.amplifierSerial = amplifierSerial;
		this.coordinateSystem = coordinateSystem;
		this.model = model;
		this.serial = serial;
		this.type = type;
	}
}