# Event

An event node defines [`steps`](./steps/index.md) used to calculate an event.
An event is a label that describes one or more points in time. Events can be
used in both `event` and `parameter` calculations, as well as for
normalization by the reporting framework. The resulting event is exported to
the global scope and exported in the resulting JSON file.

## Options

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