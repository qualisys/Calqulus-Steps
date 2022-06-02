import { BaseStep } from './processing/base-step';
import { StepContainer } from './processing/step-container';

export interface IGlobalStepProps {
	description?: string;
	options?: IStepPropOption[];
}

export interface IStepCategoryProps {
	name: string;
	category?: string;
	description?: string;
	examples?: string;
	options?: IStepPropOption[];
}

export interface IStepProps {
	name: string;
	alias?: string | string[];

	// Documentation properties
	category?: string;
	description?: string;
	examples?: string;
	inputs?: IStepPropInput[];
	output?: string | string[];
	options?: IStepPropOption[];
}

export interface IStepPropInput {
	type: string | string[];
	description?: string;
	optional?: boolean;
}

export interface IStepPropOption {
	name: string;
	type: string | string[];
	typeComment?: string;
	enum?: string[];
	required: boolean;
	default?: string;
	description?: string;
	shared?: SharedOptionScope;

	children?: IStepPropOption[];
}

export enum SharedOptionScope {
	category = 'category',
	global = 'global',
}

/**
 * Contains references to the step classes and step container 
 * classes by name. 
 */
export class StepRegistry {
	static steps: Map<string, typeof BaseStep> = new Map();
	static containers: Map<string, typeof StepContainer> = new Map();

	static stepDocs: Map<string, IStepProps> = new Map();
	static stepCategoryDocs: Map<string, IStepCategoryProps> = new Map();
	static globalStepDocs: IGlobalStepProps;
}

/**
 * Decorator which automatically registers a step with the [[StepRegistry]]`.
 * @param stepProperties
 */
export const StepClass = ({ name, alias, category, description, examples, inputs, options, output }: IStepProps) => (constructor) => {
	StepRegistry.steps.set(name, constructor);
	StepRegistry.stepDocs.set(name, { name, alias, category, description, examples, inputs, options, output });

	// if (examples) console.log(examples);

	// If specified, also register aliases.
	if (alias) {
		if (typeof alias === 'string') {
			alias = [alias];
		}

		for (const a of alias) {
			StepRegistry.steps.set(a, constructor);
		}
	}

	return constructor;
};

/**
 * Decorator which automatically registers a step category with the [[StepRegistry]]`.
 * @param stepProperties
 */
export const StepCategory = ({ name, description, examples, options }: IStepCategoryProps) => (constructor) => {
	if (options) {
		options.map(o => o.shared = SharedOptionScope.category);
	}
	
	StepRegistry.stepCategoryDocs.set(name, { name, description, examples, options });

	return constructor;
};

/**
 * Decorator which automatically registers a step container with the [[StepRegistry]].
 * @param stepProperties
 */
export const StepContainerClass = ({ name, alias }: IStepProps) => (constructor) => {
	StepRegistry.containers.set(name, constructor);

	// If specified, also register aliases.
	if (alias) {
		if (typeof alias === 'string') {
			alias = [alias];
		}

		for (const a of alias) {
			StepRegistry.containers.set(a, constructor);
		}
	}

	return constructor;
};
