# Event

An event node defines [`steps`](./steps/index.md) used to calculate an event.
An event is a label that describes one or more points in time. Events can be
used in both `event` and `parameter` calculations, as well as for
normalization by the reporting framework. The resulting event is exported to
the global scope and exported in the resulting JSON file.

## Options

### `displayName`

> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `null`

Give this event a **human-readable name** that will be shown in UIs, logs,
or reports instead of the raw identifier.

### `description`

> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `null`

Provide a **short explanation of what the event represents**,
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

## Examples

```yaml
- event: MyEvent
  steps:
    - eventStep: Input.x
```

### `aggregate`

> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `True`

Indicates whether this event should be used by the aggregation engine.  
If set to `true`, all occurrences of this event will be subject to the
following calculations: `min`, `max`, `average`, `median` and
`standard deviation`.

Unlike the parameter node, the event node only accepts a boolean value.

## Examples
```yaml
- event: MyEvent
  aggregate: false
  steps:
    ...
```
Using `aggregate: false` will prevent this event from being used by the
aggregation engine.
