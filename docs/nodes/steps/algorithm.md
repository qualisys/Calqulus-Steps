# Algorithm steps

- [abs](#abs)
- [convert](#convert)
- [diff](#diff)
- [dotProduct / dot](#dotproduct)
- [gapFill](#gapfill)
- [integral](#integral)
- [negate](#negate)
- [power / pow](#power)
- [qbrt](#qbrt)
- [root](#root)
- [round](#round)
- [sqrt](#sqrt)

These are steps that takes a single input (scalar / series / events /
numbers) and runs a defined algorithmic function over them and outputs 
a resulting signal of the same type as the input.


---

## Steps

### `abs`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


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


Outputs the absolute value for each value in the input signal.

---

### `convert`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `from`
>
> **Type:** `String`  
> **Required:** `True`  
> **Default value:** `null`  
>
> Defines the unit to convert **from**.
>
> #### `to`
>
> **Type:** `String`  
> **Required:** `True`  
> **Default value:** `null`  
>
> Defines the unit to convert **to**.
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


For each value of the input, converts it according to 
the units defined in the `from` and `to` options.

---

### `diff`

**Inputs**
>
> 1. `Scalar | Series | Event`
>

**Output:** `Scalar | Series | Event`


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


Outputs the difference between each value in the input. 
Since this compares value `n` with `n+1`, the output 
signal will be shorter by one item.

---

### `dotProduct`

**Alias:**  dot

**Inputs**
>
> 1. `Series | Scalar`
> 2. `Series | Scalar`
>

**Output:** `Series`


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


Calculates the dot product between two vectors. 

The output length will be equal to the length of the first vector sequence. 

The second vector sequence needs to be singular or equal to the first vector sequence in length.

A lone vector in the second input will be used to calculate the dot product between itself 
and all vectors contained in the first vector sequence. 

---

### `gapFill`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `type`
>
> **Type:** `String`  
> **Required:** `False`  
> **Allowed values:** `linear | spline`  
> **Default value:** `spline`  

>
> #### `maxGapLength`
>
> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `0.1s`  

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


Outputs a resulting signal of the same type as the input signal 
where gaps are filled using interpolation.  

***Note:*** *Gaps at the beginning or end of the signal will 
not be interpolated.*

---

### `integral`

**Inputs**
>
> 1. `Series`
>

**Output:** `Scalar | Series`

**Options**
>
> #### `scalar`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `false`  
>
> Returns the integral as a single value scalar.
>
> #### `useCycles`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `True`  
>
> If the signal has cycles defined, the integral step will be run 
> separately over each signal, and a list of values are returned, 
> one for each cycle.
>
> To avoid this behavior, set `useCycles` to `false`.
>
> For information on how to set event cycles on a signal, 
> see the [eventMask](./event-utils.md) step.
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


Returns the cumulative integral between neighboring frames in a data series, using the trapezoidal rule. 
It returns a series by default.

---

### `negate`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


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


Outputs the negated value for each value in the input signal.

---

### `power`

**Alias:** pow

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `exponent`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `2`  
>
> Defines the exponent to raise the input to. If the exponent is
> omitted, the default value of 2 will be used.
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


Computes the power of the input signal by raising it to the specified
exponent. By default, the exponent is 2, which means that the input
signal is squared.

---

### `qbrt`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


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


Computes the cube root of the input signal.

---

### `root`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `index`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `2`  
>
> Defines the index of the root to take - the nth root of the input.
> For example, if the index is 2, the square root of the input will
> be taken. If the index is 3, the cube root of the input will be
> taken.
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


Computes the root of the input signal by taking the nth root of the
input. By default, the index is 2, which means that the square root
of the input signal is taken.

---

### `round`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `precision`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `0`  

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


Outputs a resulting signal of the same type as the input signal 
where every value is rounded to the specific precision.

The precision is specified as the number of decimal places to 
include in the result.

## Examples

The value `1234.567` will be rounded to the following values 
given a certain precision:

* Precision `0`: `1235` *(This is the default precision).*
* Precision `1`: `1234.6`
* Precision `2`: `1234.57`
* Precision `3`: `1234.567`


---

### `sqrt`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


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


Computes the square root of the input signal.

---

