# Data structure steps

- [concatenate](#%60concatenate%60)
- [vector](#%60vector%60)

These are steps that uses events as inputs to affect the output 
in various ways.


---

## Steps

### `concatenate`

> **Inputs**
>
> 1. `Scalar | Series | Event | Number`
> 2. `Scalar | Series | Event | Number`
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


The `concatenate` step takes any number of inputs (at least 2) 
of the same (or equivalent) types and appends the values into one 
output. This will be done on each component, if they exist.

---

### `vector`

> **Inputs**
>
> 1. `Scalar | Series | Number`
> 2. `Scalar | Series | Number`
>
> **Output:** `Scalar | Series | Number`


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


The `vector` step takes three inputs and outputs a vector 
sequence signal, where the three inputs will be assigned to 
the `x`, `y`, and `z` components, respectively.

If the inputs have different lengths, the output signal will 
be the length of the longest input and shorter inputs will be 
padded with `NaN` values.

---

