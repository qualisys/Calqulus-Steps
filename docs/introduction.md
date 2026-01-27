# Introduction
A pipeline is written in
[YAML](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html)
and instructs the Calqulus processing engine what to calculate.

This documentation describes how to write YAML that is a valid pipeline in
the context of Calqulus.

A pipeline consists of any number of base nodes defined on the root level.
There are two types of base nodes:
 - Output nodes ([parameter](./nodes/parameter.md), [event](./nodes/event.md))
 - Space nodes ([space](./nodes/space.md))

## Output nodes
Output nodes define an end result that is exported to the global scope and
exported in the resulting JSON file.

The main difference between the [`parameter`](./nodes/parameter.md) and
[`event`](./nodes/event.md) is what type of data is stored. A `parameter`
node will store series and scalar data, whereas an `event` node will store
event data.

An output node needs at least one [step](./nodes/steps/index.md) node to generate
any output.

## Space nodes
Space nodes define custom coordinate systemss useful for normalizing data
with regards to the orientation of subjects. It's used to get comparable
results when subjects are captured in different orientations.