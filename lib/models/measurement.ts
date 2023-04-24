import { IEvent } from './event';
import { Marker } from './marker';
import { Segment } from './segment';
import { Skeleton } from './skeleton';

export interface IMeasurement {
	analogFrameRate: number;
	endFrame: number;
	events: IEvent[];
	filename: string;
	frameRate: number;
	frameCount: number;
	markers: Marker[];
	name: string;
	path?: string;
	primarySkeleton?: string;
	segments: Segment[];
	skeletons: Skeleton[];
	startFrame: number;
}