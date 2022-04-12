# Algorithm steps

- [abs](#%60abs%60)
- [convert](#%60convert%60)
- [diff](#%60diff%60)
- [gapFill](#%60gapfill%60)
- [negate](#%60negate%60)
- [round](#%60round%60)

These are steps that takes a single input (scalar / series / events /
numbers) and runs a defined algorithmic function over them and outputs 
a resulting signal of the same type as the input.


---

## Steps

### `abs`

> **Inputs**
>
> 1. `Scalar | Series | Event | Number`
>
> **Output:** `Scalar | Series | Event | Number`


> **Shared options**
>
> <details><summary>Global options</summary>
> 
> The following options are available globally on all steps.
>
> * [export](./index.md#%60export%60)
> * [output](./index.md#%60output%60)
> * [set](./index.md#%60set%60)
> * [space](./index.md#%60space%60)
>
>
></details>
>


Outputs the absolute value for each value in the input signal.

---

### `convert`

> **Inputs**
>
> 1. `Scalar | Series | Event | Number`
>
> **Output:** `Scalar | Series | Event | Number`

> **Options**
>
> #### `from`
>
> **Type:** `String`  
> **Required:** `True`  
> **Default value:** `null`  
>
> Defines the unit to convert **from**.

> #### `to`
>
> **Type:** `String`  
> **Required:** `True`  
> **Default value:** `null`  
>
> Defines the unit to convert **to**.

>

> **Shared options**
>
> <details><summary>Global options</summary>
> 
> The following options are available globally on all steps.
>
> * [export](./index.md#%60export%60)
> * [output](./index.md#%60output%60)
> * [set](./index.md#%60set%60)
> * [space](./index.md#%60space%60)
>
>
></details>
>


For each value of the input, converts it according to 
the units defined in the `from` and `to` options.

---

### `diff`

> **Inputs**
>
> 1. `Scalar | Series | Event`
>
> **Output:** `Scalar | Series | Event`


> **Shared options**
>
> <details><summary>Global options</summary>
> 
> The following options are available globally on all steps.
>
> * [export](./index.md#%60export%60)
> * [output](./index.md#%60output%60)
> * [set](./index.md#%60set%60)
> * [space](./index.md#%60space%60)
>
>
></details>
>


Outputs the difference between each value in the input. 
Since this compares value `n` with `n+1`, the output 
signal will be shorter by one item.

---

### `gapFill`

> **Inputs**
>
> 1. `Scalar | Series | Event | Number`
>
> **Output:** `Scalar | Series | Event | Number`

> **Options**
>
> #### `type`
>
> **Type:** `String`  
> **Required:** `True`  
> **Allowed values:** `linear | spline`  
> **Default value:** `spline`  
> #### `maxGapLength`
>
> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `0.1s`  
>

> **Shared options**
>
> <details><summary>Global options</summary>
> 
> The following options are available globally on all steps.
>
> * [export](./index.md#%60export%60)
> * [output](./index.md#%60output%60)
> * [set](./index.md#%60set%60)
> * [space](./index.md#%60space%60)
>
>
></details>
>


Outputs a resulting signal of the same type as the input signal 
where gaps are filled using interpolation.  

***Note:*** *Gaps at the beginning or end of the signal will 
not be interpolated.*

---

### `negate`

> **Inputs**
>
> 1. `Scalar | Series | Event | Number`
>
> **Output:** `Scalar | Series | Event | Number`


> **Shared options**
>
> <details><summary>Global options</summary>
> 
> The following options are available globally on all steps.
>
> * [export](./index.md#%60export%60)
> * [output](./index.md#%60output%60)
> * [set](./index.md#%60set%60)
> * [space](./index.md#%60space%60)
>
>
></details>
>


Outputs the negated value for each value in the input signal.

---

### `round`

> **Inputs**
>
> 1. `Scalar | Series | Event | Number`
>
> **Output:** `Scalar | Series | Event | Number`

> **Options**
>
> #### `precision`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `0`  
>

> **Shared options**
>
> <details><summary>Global options</summary>
> 
> The following options are available globally on all steps.
>
> * [export](./index.md#%60export%60)
> * [output](./index.md#%60output%60)
> * [set](./index.md#%60set%60)
> * [space](./index.md#%60space%60)
>
>
></details>
>


Outputs a resulting signal of the same type as the input signal 
where every value is rounded to the specific precision.

The precision is specified as the number of decimal places to 
include in the result.

---

