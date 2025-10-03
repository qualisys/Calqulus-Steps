# Parameter

A parameter node defines [`steps`](./steps/index.md) used to calculate a value or a sequence of
values. The result is exported to the global scope and exported in the
resulting JSON file.


## Options

### `displayName`

> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `null`

Give this parameter a **human-readable name** that will be shown in UIs, logs,
or reports instead of the raw identifier.

### `description`

> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `null`

Provide a **short explanation of what the parameter does or represents**,
including any important context or usage notes to help users understand its
purpose.

### `export`

> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `true`

Used to exclude this parameter from being exported. Useful when you don't want
an intermediate computation to be exported to the report.

If not set, this will default to `true`.

---

### `set`

> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `null`

Used to specify which _set_ the exported parameter will use. In most cases,
this will be either `left` or `right`.

If not set, the JSON output will use set: null.

---

### `steps`

> **Type:** `Array`  
> **Required:** `True`  
> **Default value:** `null`

This is a list of [step](./steps/index.md) nodes to be run to generate an output.

---

### `where`

> **Type:** `Map`  
> **Required:** `False`  
> **Default value:** `null`

Filter for measurements where this node should be calculated. Read more in the [Measurement filtering](../inputs-and-outputs.md#measurement-filtering) section of the Inputs and Outputs document.

---

## Examples

```yaml
- parameter: MyParam
  steps:
    - parameterStep: Input.x
```

### `aggregate`

> **Type:** `Boolean | String`  
> **Required:** `False`  
> **Default value:** `False`

Indicates whether this parameter should be processed by the aggregation engine.
When set to `true`, the parameter is aggregated using the default method.  
When a string is provided, it allows you to specify the aggregation behavior with greater control.  
The expected string is a comma-separated list of events and/or phases to define the aggregation.

## Examples
```yaml
- parameter: MyParam
  aggregate: true
  steps:
    ...
```
Setting `aggregate: true` enables aggregation of this parameter across all
enabled events and phases. Individual events or phases can be excluded from
being processed by the aggregation engine by specifying `aggregate: false` on
the corresponding event or phase node.


```yaml
- parameter: MyParam
  aggregate: SwingPhase, LFS, LFO
  steps:
    ...
```
Using `aggregate: SwingPhase, LFS, LFO` will only enable aggregation using the
phase `SwingPhase`, as well as the events `LFS` and `LFO`.
