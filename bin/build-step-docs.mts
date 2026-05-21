#!/usr/bin/env node

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import '../../calqulus/build/main/index.js';
import { StepRegistry } from '../../calqulus/build/main/src/steps/step-registry.js';

import { renderJsonSchema } from './docs-render/json-schema-render.mts';
import { kebabCase, renderStepCategoryPage, renderStepIndexPage } from './docs-render/step-category-md-render.mts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const categories = [...StepRegistry.stepDocs.values()].reduce((cats, currStep) => {
	if (!currStep.category) {
		return cats;
	}

	if (!cats[currStep.category]) {
		cats[currStep.category] = [];
	}

	cats[currStep.category].push(currStep);

	return cats;
}, {});

/**
 * Generate markdown
 */
const mdDir = join(__dirname, '..', 'docs', 'nodes', 'steps');

if (existsSync(mdDir)) {
	console.log('delete output folder', mdDir);
	rmSync(mdDir, { recursive: true, force: true });
}

mkdirSync(mdDir, { recursive: true });

const indexContents = renderStepIndexPage(StepRegistry.globalStepDocs, categories);
writeFileSync(join(mdDir, 'index.md'), indexContents, 'utf8');

console.log('-- Generated:', 'index.md');

for (const categoryName in categories) {
	const categorySteps = categories[categoryName];

	let category;
	if (StepRegistry.stepCategoryDocs.has(categoryName)) {
		category = StepRegistry.stepCategoryDocs.get(categoryName);
	}
	else {
		category = {
			name: categoryName,
		};
	}

	categorySteps.sort((a, b) => {
		if (a.name < b.name) {
			return -1;
		}

		if (a.name > b.name) {
			return 1;
		}

		return 0;
	});

	const categoryFilename = kebabCase(category.name) + '.md';
	const mdPath = join(mdDir, categoryFilename);

	const categoryContents = renderStepCategoryPage(category, categorySteps, StepRegistry.globalStepDocs);
	writeFileSync(mdPath, categoryContents, 'utf8');

	console.log('-- Generated:', categoryFilename);
}

/**
 * Generate JSON Schema
 */

const allSteps = Object.values(categories).reduce((all, curr) => {
	all.push(...curr);

	return all;
}, []);

const categoryDefs = Object.keys(categories).map((cat) => {
	if (StepRegistry.stepCategoryDocs.has(cat)) {
		return StepRegistry.stepCategoryDocs.get(cat);
	}

	return {
		name: cat,
	};
});

const schema = renderJsonSchema(StepRegistry.globalStepDocs, categoryDefs, allSteps);
const schemaFilename = 'calqulus-pipeline.schema.json';
const schemaDir = join(__dirname, '..', 'build', 'schema');
const schemaPath = join(schemaDir, schemaFilename);

mkdirSync(schemaDir, { recursive: true });
writeFileSync(schemaPath, JSON.stringify(schema, undefined, '\t'), 'utf8');
