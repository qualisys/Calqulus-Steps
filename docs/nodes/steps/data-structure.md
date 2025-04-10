# Data structure steps

- [concatenate](#concatenate)
- [vector](#vector)

These are steps that create or manipulate data structures.


---

## Steps

### `concatenate`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
> 2. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `sort`
>
> **Type:** `String`  
> **Required:** `False`  
> **Allowed values:** `asc | desc`  
> **Default value:** `null`  
>
> If defined, the resulting array(s) will be sorted by value in ascending 
> or descending order.
>

**Shared options**
>
> <details><summary>Global options</summary>
> 
> The following options are available globally on all steps.
>
> * [export](./index.md#export)
> * [output](./index.md#output)
> * [set](./index.md#set)
> * [space](./index.md#space)
>
>
></details>
>


The `concatenate` step takes any number of inputs (at least 2) 
of the same (or equivalent) types and appends the values into one 
output. This will be done on each component, if they exist.

Scalar inputs will be converted to arrays. 

If all the inputs are integer arrays, the output will be an integer array.
However, if any of the inputs are floats, the output will be a float array.

## Examples

The following example calculates the average "step length" 
by concatenating the (already calculated) `Right_Step_Length` 
and `Left_Step_Length`, then running the `mean` step on 
the output.

```yaml
- parameter: Step_Length_Mean_MEAN
  steps:
    - concatenate: [Right_Step_Length, Left_Step_Length]
      output: step_length
    - mean: step_length
```


---

### `vector`

**Inputs**
>
> 1. `Scalar | Series | Number | Series (<vector> | <segment> | <plane>)`
> 2. `Scalar | Series | Number` (optional)
> 3. `Scalar | Series | Number` (optional)
>

**Output:** `Scalar | Series | Number`


**Shared options**
>
> <details><summary>Global options</summary>
> 
> The following options are available globally on all steps.
>
> * [export](./index.md#export)
> * [output](./index.md#output)
> * [set](./index.md#set)
> * [space](./index.md#space)
>
>
></details>
>


The `vector` step takes one or three inputs and outputs a 
vector sequence signal. 

If given three numeric or 1-dimensional series inputs, each 
input will be assigned to the `x`, `y`, and `z` components, 
respectively.

Alternatively, if only one input is given and it contains at
least three components, the first three components will be 
used to construct the vector sequence.

If the inputs have different lengths, the output signal will 
be the length of the longest input and shorter inputs will be 
padded with `NaN` values.

## Examples

```yaml
- parameter: MyVector
  steps:
    - vector: [Hips.x, 0, [1, 2, 3]]
```

_This example shows how to export a vector with the x component 
coming from the Hips segment, the y component set as one zero, 
and the z component set as a static numeric array._


---

