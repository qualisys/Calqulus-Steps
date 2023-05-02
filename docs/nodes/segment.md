# Segment

A segment node defines [`steps`](./steps/index.md) used to define a segment.
The resulting segment can be used just like any other segment, for example, 
you can import it with the `segment` step.

Besides making it more obvious what type of data is being processed, the
difference compared to `parameter` is that a segment is not exported to the
resulting JSON file.

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
- segment: MySegment
  steps:
    - segment: LeftLeg
    - add: [[1, 0, 0], $prev]
```