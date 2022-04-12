# Filter steps

- [highpass](#highpass)
- [lowpass](#lowpass)

These are steps that takes a single series input and runs a 
Butterworth IIR filter function over them and outputs a resulting 
signal of the same type as the input.

NaN values are replaced with zeroes for the calculation. Leading 
and trailing NaN values are removed before extrapolation, i.e., 
extrapolation begins from the first and last real value. 

NaN values are re-inserted in their original places in the output.


---

## Steps

### `highpass`

> **Inputs**
>
> 1. `Scalar | Series | Event | Number`
>
> **Output:** `Scalar | Series | Event | Number`

> **Options**
>
> #### `extrapolate`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `0`  
>
> Defines how much to add on either side of the series, 
> useful if the filter handles the edges of the series strangely.
>
> Leading and trailing NaN values are removed before extrapolation, 
> i.e., extrapolation begins from the first and last real value. 
> NaN values are then re-inserted in the original places for 
> the output.

> #### `iterations`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `1`  
>
> Defines how many times to apply the filter.

> #### `cutoff`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `20`  
>
> Defines around what frequency to limit the filter.

> #### `order`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `2`  
>
> Defines the filter order.

>

> **Shared options**
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


Runs a Butterworth high-pass filter over the input data.

---

### `lowpass`

> **Inputs**
>
> 1. `Scalar | Series | Event | Number`
>
> **Output:** `Scalar | Series | Event | Number`

> **Options**
>
> #### `extrapolate`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `0`  
>
> Defines how much to add on either side of the series, 
> useful if the filter handles the edges of the series strangely.
>
> Leading and trailing NaN values are removed before extrapolation, 
> i.e., extrapolation begins from the first and last real value. 
> NaN values are then re-inserted in the original places for 
> the output.

> #### `iterations`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `1`  
>
> Defines how many times to apply the filter.

> #### `cutoff`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `20`  
>
> Defines around what frequency to limit the filter.

> #### `order`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `2`  
>
> Defines the filter order.

>

> **Shared options**
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


Runs a Butterworth low-pass filter over the input data.

---

