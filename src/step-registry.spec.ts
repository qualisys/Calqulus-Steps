import test from 'ava';

import { IStepCategoryProps, IStepProps, SharedOptionScope, StepCategory, StepClass, StepContainerClass, StepRegistry } from './step-registry';

const categoryConfig: IStepCategoryProps = {
	name: 'Test Category',
	description: 'Test category description.',
	examples: 'Test examples.',
	options: [
		{
			name: 'Shared category option',
			type: ['a', 'b'],
			typeComment: 'test',
			enum: ['value a', 'value b'],
			required: false,
			default: 'value a',
			description: 'A shared category option',
			shared: SharedOptionScope.category,
		},
		{
			name: 'Shared global option',
			type: ['a', 'b'],
			typeComment: 'test',
			enum: ['value a', 'value b'],
			required: false,
			default: 'value a',
			description: 'A shared global option',
			shared: SharedOptionScope.global, // Will be overwritten
		}
	]
};

const stepConfig: IStepProps = {
	name: 'testStep',
	alias: ['testStepAlias', 'testStepAlias2'],
	inputs: [
		{
			type: 'a',
			description: 'test',
			optional: true,
		}
	],
	category: 'Test Category',
	description: 'Test step description.',
	examples: 'Test examples.',
	options: [
		{
			name: 'Shared category option',
			type: ['a', 'b'],
			typeComment: 'test',
			enum: ['value a', 'value b'],
			required: false,
			default: 'value a',
			description: 'A shared category option',
			shared: SharedOptionScope.category,
		},
		{
			name: 'Shared global option',
			type: ['a', 'b'],
			typeComment: 'test',
			enum: ['value a', 'value b'],
			required: false,
			default: 'value a',
			description: 'A shared global option',
			shared: SharedOptionScope.global, // Will be overwritten
		}
	]
};

const stepConfig2 = {
	...stepConfig,
	name: 'testStep2',
	alias: 'testStep2Alias',
};

const stepContainerConfig: IStepProps = {
	name: 'testStepContainer',
	alias: ['testStepContainerAlias', 'testStepContainerAlias2'],
};

const stepContainer2Config: IStepProps = {
	name: 'testStepContainer2',
	alias: 'testStepContainer2Alias',
};

@StepCategory(categoryConfig)
@StepClass(stepConfig)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TestStep1 {}

@StepClass(stepConfig2)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TestStep2 {}

@StepContainerClass(stepContainerConfig)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TestStepContainer1 {}

@StepContainerClass(stepContainer2Config)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TestStepContainer2 {}

test('StepRegistry - category', (t) => {
	t.assert(StepRegistry.stepCategoryDocs);
	t.assert(StepRegistry.stepCategoryDocs.has(categoryConfig.name));

	const category = StepRegistry.stepCategoryDocs.get(categoryConfig.name);
	t.assert(category);
	t.assert(category.options);

	for (const option of category.options) {
		t.is(option.shared, SharedOptionScope.category);
	}

	t.like(category, categoryConfig);
});

test('StepRegistry - step', (t) => {
	t.assert(StepRegistry.steps);
	t.assert(StepRegistry.steps.has(stepConfig.name));

	const step = StepRegistry.steps.get(stepConfig.name);
	t.assert(step);
	
	for (const alias of stepConfig.alias) {
		t.assert(StepRegistry.steps.has(alias));
	}

	t.assert(StepRegistry.stepDocs.has(stepConfig.name));

	const stepDoc = StepRegistry.stepDocs.get(stepConfig.name);
	t.assert(stepDoc);
	t.like(stepDoc, stepConfig);
});

test('StepRegistry - step 2', (t) => {
	t.assert(StepRegistry.steps);
	t.assert(StepRegistry.steps.has(stepConfig2.name));
	t.assert(StepRegistry.steps.has(stepConfig2.alias));
});

test('StepRegistry - step container', (t) => {
	t.assert(StepRegistry.containers);
	t.assert(StepRegistry.containers.has(stepContainerConfig.name));

	const stepCont = StepRegistry.containers.get(stepContainerConfig.name);
	t.assert(stepCont);
	
	for (const alias of stepContainerConfig.alias) {
		t.assert(StepRegistry.containers.has(alias));
	}
});

test('StepRegistry - step container 2', (t) => {
	t.assert(StepRegistry.containers);
	t.assert(StepRegistry.containers.has(stepContainer2Config.name));
	t.assert(StepRegistry.containers.has(stepContainer2Config.alias as string));
});
