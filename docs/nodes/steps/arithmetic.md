# Arithmetic steps

- [add](#add)
- [divide](#divide)
- [multiply](#multiply)
- [subtract](#subtract)

These are steps that takes a list of any kind of input (scalar / 
series / events / numbers), i.e., _operands_, then runs a defined 
arithmetic function over them and outputs the result. 

The type of the result is of the same type as the first operand, 
or a vector sequence if the result is an array with three elements.

If one of the operands is a single number, the operand will be used
for applying the operation for each component or array value of the 
other input. 

If both operands are arrays or component-based (marker/vector/segment)
but with different length or with different number of components, an 
error will be thrown as there is no defined way to apply the operation.	

## Examples

``` yaml
- subtract: [5, 2]
```
_Performs the operation `5 - 2` and returns `3`._

``` yaml
- add: [1, 2, 3, 4, 5]
```

``` yaml
- add: [[myMarker.x, 5, 1], [10, 0, 1]]
```

_Adds the `x` component of `myMarker`, `5` and `1` with 
the corresponding item in the second operand for all frames in 
`myMarker`. Given `myMarker.x = [3, 6, 12]`, the result is the 
vector sequence `{ x: [13, 16, 22], y: [5, 5, 5], z: [2, 2, 2]`._

``` yaml
- multiply: [[1, 2, 3], 2]
```
_Multiplies every item of the first operand with 2, returning a 
vector `{ x: 2, y: 4, z: 6 }`._

``` yaml
- multiply: [[1, 2, 3], [1, 2, 3]]
```
_Multiplies every item of the first operand with the corresponding 
item from the second, returning a vector `{ x: 1, y: 4, z: 9 }`._

``` yaml
- divide: [Hips, 2]
```
_Divides every component of the `Hips` segment, for all 
frames with 2._

``` yaml
- multiply: [Hips, [1, 0, 1, 1, 1, 1, 1]]
```
_Multiplies the components of the `Hips` segment (`x`, `y`, 
`z`, `rx`, `ry`, `rz`, `rw`) for all frames with the 
corresponding item from the second operand._

``` yaml
- multiply: [Hips, [1, 0, 1]]
```
_Throws an error since the second operand does not cover all components
of the first input (the first input is a segment and has 7 components;
`x`, `y`, `z`, `rx`, `ry`, `rz`, `rw`)._

## Shared options

The following option is available on all Arithmetic steps.

> #### `frameSequenceOrder`
>
> **Type:** `String`  
> **Required:** `False`  
> **Allowed values:** `none | forward | reverse`  
> **Default value:** `none`  
>
> If set to any value but `none`, the input signals will pass 
> through a function which returns a list of signals where each 
> value is from a frame greater than or equal to the frame of the 
> corresponding value from the preceding Signal.
>
> If set to `forward`, it will start from the first value of the 
> first (leftmost) input signal (operand) and the algorithm will 
> look at subsequent operands (to the right) one "row" at a time.
>
> Conversely, if set to `reverse`, the event sequencing uses 
> the reverse order of operands and goes from right to left.
>
> If a full "row" of values could not be matched, it is not 
> included in the result, i.e., all operands will be of the 
> same length. 
>
> This is useful, for example, when calculating the distance 
> between two signals at a certain event.
>
> The function will only apply if ***all*** input signals have 
> applied a [Frames](../../inputs-and-outputs.md#frames) filter, 
> otherwise the signals are left untouched.
>
> ### Example
>
> ``` yaml
> - subtract: [LeftFoot.y@LFS, RightFoot.y@RFS]
>            frameSequenceOrder: reverse
> ```
>
> _Creates an event sequence from the inputs, starting from the 
> second operand (RFS event) and creates event pairs RFS -> LFS 
> out of the values. It then subtracts each frame from the 
> `RightFoot` from the corresponding `LeftFoot` frame._
>
> _If `frameSequenceOrder` had been set to `forward`, it 
> would have created pairs going from LFS -> RFS instead._
>
> _Using the `frameSequenceOrder` option ensures that the 
> operands starts with the intended event and that both operands 
> have the same length._
>
>


---

## Steps

### `add`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
> 2. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


**Shared options**
>
> <details open><summary>Arithmetic options</summary>
> 
> The following option is available on all Arithmetic steps.
>
> * [frameSequenceOrder](#framesequenceorder)
>
>
></details>
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


Adds the input operands.

---

### `divide`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
> 2. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


**Shared options**
>
> <details open><summary>Arithmetic options</summary>
> 
> The following option is available on all Arithmetic steps.
>
> * [frameSequenceOrder](#framesequenceorder)
>
>
></details>
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


Divides the input operands.

---

### `multiply`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
> 2. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


**Shared options**
>
> <details open><summary>Arithmetic options</summary>
> 
> The following option is available on all Arithmetic steps.
>
> * [frameSequenceOrder](#framesequenceorder)
>
>
></details>
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


Multiplies the input operands.

---

### `subtract`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
> 2. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


**Shared options**
>
> <details open><summary>Arithmetic options</summary>
> 
> The following option is available on all Arithmetic steps.
>
> * [frameSequenceOrder](#framesequenceorder)
>
>
></details>
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


Subtracts the input operands.

---

