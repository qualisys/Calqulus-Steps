# Space

Space nodes define custom coordinate systems useful for normalizing data with
regards to the orientation of subjects. It's used to get comparable results
when subjects are captured in different orientations.

The following example shows how to define a space named VirtualLab, that is
defined by the orientation of a segment, in this case the Hips segment. 

```yaml
- space: VirtualLab
  alignWithSegment:
    segment: Hips
```

A space can also be defined using a primary and secondary axis. The third
axis will constructed to always be perpendicular to the primary and secondary
axes.

```yaml
- space: VirtualLab
  origin: myOriginMarker
  primaryAxis: myAxisMarker
  secondaryAxis: [0, 0, 1]
```

To transform data to conform to a custom space, use the `space` option:

```yaml
- parameter: My marker in space
  steps:
    - marker: myMarker => m
      space: VirtualLab
    - multiply: [m.x, 2]
```

The `space` option can be used on any step node and each input will be
transformed before it reaches the step node's `process` method.

If an input signal was already converted to the specified space via a previous step,
the input will not be transformed again.

The following would produce the same result as the previous example:

```yaml
- parameter: My marker in space
  steps:
    - marker: myMarker => m
    - multiply: [m.x, 2]
      space: VirtualLab
```

## Strategies
There are a few strategies to choose from when ensuring that data is in the desired space.

### 1. Convert all imported signals manually.
  
By explicitly importing signals and specifying the space, any operation you do
with those signals will end up in the desired space.

```yaml
- parameter: Example 1
  steps:
    - marker: myMarker => m
      space: VirtualLab
    - segment: mySegment => s
      space: VirtualLab
    - multiply: [m.x, s.x]
```

### 2. Import signals in world space, and convert when operating on the data.
  
This is useful when you want to convert all inputs of a step to the space.
It can be shorter to write, and gives the same result as the above example.

```yaml
- parameter: Example 2
  steps:
    - multiply: [myMarker.x, mySegment.x]
      space: VirtualLab
```

### 3. Make all computations in world space, and convert at the end.
  
Sometimes it's easier to make all computations in world space, and convert
the result as a last step. The `import` step can be used to do nothing but
convert a signal to a space.

```yaml
- parameter: Example 3
  steps:
    - add: [myMarker.x, 10]
    - multiply: [$prev, 2]
    - import: $prev
      space: VirtualLab
```

## Options

### `origin`
> `<vector> | [<x>, <y>, <z>]`  
>  
> **Type:** `marker`, `segment`, or `float32[]`  
> **Required:** `False`  
> **Default value:** `[0, 0, 0]`
Sets the origin of a custom coordinate system.


### `primaryAxis`
> `<vector> | [<from>, <to>] |  [<x>, <y>, <z>] | [[<from_x>, <from_y>, <from_z>], [<to_x>, <to_y>, <to_z>]]`  
>  
> **Type:** `marker` | `segment`, `(marker | segment)[]`, `float32[]` or `float32[][]`  
> **Required:** `False`  
> **Default value:** `null`

Sets the primary axis of a custom coordinate system. The primary axis of the
custom coordinate system will always be a unit vector with the same direction
as this vector.

If more than one vectors is given, for example `[myMarker1, myMarker2]`, the
vector difference between the first two vectors is used as the primary axis.

### `secondaryAxis`
> `<vector> | [<from>, <to>] |  [<x>, <y>, <z>] | [[<from_x>, <from_y>, <from_z>], [<to_x>, <to_y>, <to_z>]]`  
>  
> **Type:** `marker` | `segment`, `(marker | segment)[]`, `float32[]` or `float32[][]`  
> **Required:** `False`  
> **Default value:** `null`


Sets the secondary axis of a custom coordinate system. The actual secondary
axis of the custom coordinate system might differ from the vector specified,
since the secondary axis must be a unit vector perpendicular to the primary
axis.

If more than one vectors is given, for example `[myMarker1, myMarker2]`, the
vector difference between the first two vectors is used as the secondary axis.

### `order`
> `<order>`  
>  
> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `xy`

Defines what axis the primary and secondary axis corresponds to. The first
letter defines the name of the primary axis, and the second letter defines
the name of the secondary axis.

Possible values:
`xy` - Primary axis: x, secondary axis: y
`yx` - Primary axis: y, secondary axis: x
`xz` - Primary axis: x, secondary axis: z
`yz` - Primary axis: y, secondary axis: z
`zy` - Primary axis: z, secondary axis: y
		
### `alignWithSegment`
> `<segment>`  
>  
> **Type:** `segment`  
> **Required:** `False`  
> **Default value:** `null`

Used to create a space that aligns with the specified segment. The resulting
space will be rotated in 90 degree increments relative to the world space.
The rotation is based on the average orientation of the segment during a mesurement.

---

### `where`
> `<measurement_field_map>`  

> **Type:** `Map`  
> **Required:** `False`  
> **Default value:** `null`

Filter for measurements where this node should be calculated. Read more in the [Measurement filtering](../inputs-and-outputs.md#measurement-filtering) section of the Inputs and Outputs document.