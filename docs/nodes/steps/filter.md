# Filter steps

- [highpass](#highpass)
- [lowpass](#lowpass)

These are steps that takes a single series input and runs a 
Butterworth IIR filter function over them and outputs a resulting 
signal of the same type as the input.

The filter is applied first in a forward direction and then in a
backward direction, resulting in zero phase distortion. For multiple
iterations, the filter is applied repeatedly but always in a sequence
of forward and backward directions.

NaN values are replaced with zeroes for the calculation. Leading 
and trailing NaN values are removed before extrapolation, i.e., 
extrapolation begins from the first and last real value. 

NaN values are re-inserted in their original places in the output.


---

## Steps

### `highpass`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `extrapolate`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `0`  
>
> Extrapolation buffer. Defines how many frames to add on either side 
> of the series, useful if the filter handles the edges of the series 
> strangely.
>
> Leading and trailing NaN values are removed before extrapolation, 
> i.e., extrapolation begins from the first and last real value. 
> NaN values are then re-inserted in the original places for 
> the output.
>
> Extrapolation is made by looking at the first and second values, 
> and the last and second-to-last values, respectively. The buffer 
> is then filled with values linearly extrapolated from these two 
> points.
>
> #### `iterations`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `1`  
>
> Defines how many times to apply the filter in sequence. If the
> iterations is set to anything other than 1, the filter will be
> applied multiple times, using the output of the previous iteration
> as the input for the next.
>
> #### `cutoff`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `20`  
>
> Defines around what frequency to limit the filter. The filter will
> attenuate frequencies below this value.
>
> #### `order`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `2`  
>
> Defines the filter order. The higher the order, the steeper the
> attenuation slope will be.
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


Runs a Butterworth IIR high-pass filter over the input data.

---

### `lowpass`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `extrapolate`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `0`  
>
> Extrapolation buffer. Defines how many frames to add on either side 
> of the series, useful if the filter handles the edges of the series 
> strangely.
>
> Leading and trailing NaN values are removed before extrapolation, 
> i.e., extrapolation begins from the first and last real value. 
> NaN values are then re-inserted in the original places for 
> the output.
>
> Extrapolation is made by looking at the first and second values, 
> and the last and second-to-last values, respectively. The buffer 
> is then filled with values linearly extrapolated from these two 
> points.
>
> #### `iterations`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `1`  
>
> Defines how many times to apply the filter in sequence. If the
> iterations is set to anything other than 1, the filter will be
> applied multiple times, using the output of the previous iteration
> as the input for the next.
>
> #### `cutoff`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `20`  
>
> Defines around what frequency to limit the filter. The filter will
> attenuate frequencies above this value.
>
> #### `order`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `2`  
>
> Defines the filter order. The higher the order, the steeper the
> attenuation slope will be.
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


Runs a Butterworth IIR low-pass filter over the input data.

---

