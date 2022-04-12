# Aggregation steps

- [count](#%60count%60)
- [max](#%60max%60)
- [mean](#%60mean%60)
- [median](#%60median%60)
- [min](#%60min%60)
- [range](#%60range%60)
- [rms](#%60rms%60)
- [standardDeviation / stdDev](#%60standarddeviation%60)
- [sum](#%60sum%60)

These are steps that take any kind of input (scalar / series / events) 
and outputs a scalar result value, usually some form of summary value.

This step will output the same type of data as the input. 
If the input, for example, has multiple components – the aggregation 
will be run on each component.

## Shared options

The following option is available on all Aggregation steps.

> #### `useCycles`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `True`  
>
> If the signal has cycles defined, the aggregation will be run 
> separately over each signal, and a list of values are returned, 
> one for each cycle.
>
> To avoid this behaviour, set `useCycles` to `false`.
>
> For information on how to set event cycles on a signal, 
> see the [eventMask](./event-utils.md) step.

>


---

## Steps

### `count`

> **Inputs**
>
> 1. `Scalar | Series | Event`
>
> **Output:** `Scalar`


> **Shared options**
>
> <details open><summary>Aggregation options</summary>
> 
> The following option is available on all Aggregation steps.
>
> * [useCycles](#%60usecycles%60)
>
>
></details>
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


Counts the number of values in the input, i.e. the number of 
frames in a series, or the number of values in a scalar or 
event input.

---

### `max`

> **Inputs**
>
> 1. `Scalar | Series | Event`
>
> **Output:** `Scalar`

> **Options**
>
> #### `frames`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `false`  
>
> If set to true, this step returns the *frame index* for the 
> maximum value of the input. If using cycles, it will return 
> a frame per cycle.

>

> **Shared options**
>
> <details open><summary>Aggregation options</summary>
> 
> The following option is available on all Aggregation steps.
>
> * [useCycles](#%60usecycles%60)
>
>
></details>
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


Outputs the max value of the input.

---

### `mean`

> **Inputs**
>
> 1. `Scalar | Series | Event`
>
> **Output:** `Scalar`


> **Shared options**
>
> <details open><summary>Aggregation options</summary>
> 
> The following option is available on all Aggregation steps.
>
> * [useCycles](#%60usecycles%60)
>
>
></details>
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


Outputs the mean value of the input.

---

### `median`

> **Inputs**
>
> 1. `Scalar | Series | Event`
>
> **Output:** `Scalar`

> **Options**
>
> #### `frames`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `false`  
>
> If set to true, this step returns the *frame index* for the 
> minimum value of the input. If using cycles, it will return 
> a frame per cycle.

>

> **Shared options**
>
> <details open><summary>Aggregation options</summary>
> 
> The following option is available on all Aggregation steps.
>
> * [useCycles](#%60usecycles%60)
>
>
></details>
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


Outputs the minimum value of the input.

---

### `min`

> **Inputs**
>
> 1. `Scalar | Series | Event`
>
> **Output:** `Scalar`


> **Shared options**
>
> <details open><summary>Aggregation options</summary>
> 
> The following option is available on all Aggregation steps.
>
> * [useCycles](#%60usecycles%60)
>
>
></details>
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


Outputs the median value of the input.

---

### `range`

> **Inputs**
>
> 1. `Scalar | Series | Event`
>
> **Output:** `Scalar`


> **Shared options**
>
> <details open><summary>Aggregation options</summary>
> 
> The following option is available on all Aggregation steps.
>
> * [useCycles](#%60usecycles%60)
>
>
></details>
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


Outputs the range between the minimum and maximum 
value of the input.

---

### `rms`

> **Inputs**
>
> 1. `Series`
> 2. `Series`
>
> **Output:** `Series`


> **Shared options**
>
> <details open><summary>Aggregation options</summary>
> 
> The following option is available on all Aggregation steps.
>
> * [useCycles](#%60usecycles%60)
>
>
></details>
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


Outputs the Root Mean Square (root of the average squared deviations) between two arrays.

---

### `standardDeviation`

**Alias:**  stdDev

> **Inputs**
>
> 1. `Scalar | Series | Event`
>
> **Output:** `Scalar`


> **Shared options**
>
> <details open><summary>Aggregation options</summary>
> 
> The following option is available on all Aggregation steps.
>
> * [useCycles](#%60usecycles%60)
>
>
></details>
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


Outputs the standard deviation value of the input.

---

### `sum`

> **Inputs**
>
> 1. `Scalar | Series | Event`
>
> **Output:** `Scalar`


> **Shared options**
>
> <details open><summary>Aggregation options</summary>
> 
> The following option is available on all Aggregation steps.
>
> * [useCycles](#%60usecycles%60)
>
>
></details>
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


Outputs the sum of all values of the input.

---

