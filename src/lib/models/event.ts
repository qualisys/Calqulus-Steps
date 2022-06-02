export interface IEvent {
	frame: number;
	name: string;
	color?: number;
}

export class EventCollection {
	events: Map<string, IEvent[]> = new Map();

	constructor(events: IEvent[]) {
		for (const e of events) {
			if (this.events.has(e.name)) {
				const current = this.events.get(e.name);

				current.push(e);
			}
			else {
				this.events.set(e.name, [e]);
			}
		}
	}

	getEvents(eventLabel: string) {
		return this.events.get(eventLabel);
	}

	getLabels() {
		return this.events.keys();
	}

	getFrames(eventLabel: string) {
		if (this.events.has(eventLabel)) {
			const events = this.events.get(eventLabel);

			return events.map(e => e.frame);
		}
		else {
			return [];
		}
	}
}