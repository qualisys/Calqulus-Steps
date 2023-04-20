# Calqulus (beta)
This repository contains the code powering Calqulus pipelines – a powerful way
to analyze and process motion capture data for use in reports without writing
complex scripts.

## How it works:
The Calqulus engine takes motion capture data together with a Calqulus pipeline
(YAML) and maps the steps in the pipeline with the steps found in this
repository. The data described in the pipeline is then fed to the step and the
output is handled for export or for use in further pipelines.

Each pipeline step defined in your Calqulus pipeline corresponds to a step class
defined in this repo. 

In simple terms:
* You define a pipeline using YAML - See our [Calqulus Pipelines](https://github.com/qualisys/Calqulus-Pipelines).
* You set everything up on [Report Center](https://report.qualisys.com).
* You initiate the processing from QTM, using the *Calqulus Module*.

_**Note:** Calqulus is still under active development and not yet publicly released._

If you're interested in trying out Calqulus to process your own data, please reach out to [sales@qualisys.com](mailto:sales@qualisys.com?subject=[GitHub]%20I%20want%20to%20try%20Calqulus)

## Documentation
Read the [YAML documentation](./docs/index.md) to learn how the pipelines are
constructed and how to use the different steps.

## Development
All steps are unit tested with a coverage of 99+%. We also automatically
run regression tests against our public Calqulus Pipelines.  
  
Any contributions needs to be fully tested and passing regression tests before
they can be approved.

### Getting started

Calqulus is written in TypeScript and requires Node 14+.  

Install all dependencies by running `npm install`

### Testing

Run the tests to verify that that all tests pass before committing any changes.

| <!-- -->    | <!-- -->    |
|---:|---|
| Run all tests: | `npm run test`|
| Run linting tests: | `npm run test:lint` |
| Run unit tests: | `npm run test:unit` |
| Create test coverage report: | `npm run cov` |
| Run hot-reloading unit tests: | `npm run watch:test` |

### Building

Build the code to verify that the code compiles and you get no errors before committing any changes.

| <!-- -->    | <!-- -->    |
|---:|---|
| Run build for production: | `npm run build` |
| Run hot-reloading builds: | `npm run watch:build` |

### Documentation

We use TypeDoc to generate documentation for the code and a custom script to extract documentation about steps to build the [step documentation](./docs/index.md). Updates to the step documentation should be checked in with your code, while TypeDoc documentation is ignored in commits.

| <!-- -->    | <!-- -->    |
|---:|---|
| Build code documentation: | `npm run doc`|
| Build step documentation: | `npm run doc:steps` |
