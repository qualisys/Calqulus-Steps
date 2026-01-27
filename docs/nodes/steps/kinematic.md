# Kinematic steps

- [acceleration](#acceleration)
- [derivative](#derivative)
- [velocity](#velocity)

These are steps that takes a series input and runs a derivative 
function over them and outputs a resulting signal of the same 
type as the input.


---

## Steps

### `acceleration`

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


Derives the input signal to the second order.

**_Note:_** _Due to the temporal nature of this operation, 
the resulting first and last frames will be null._

**_Note:_** _This operation will split the series on gaps and 
derive each "slice" individually. The first and last frame on 
each "slice" will be null._

---

### `derivative`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
> 2. `Number` (min: 1, max: 2) (optional)
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


Derives the input signal to the order defined in `input 2`. 
If `input 2` is not set, the signal is derived to order 1.

Only the first and second order is supported.

**_Note:_** _Due to the temporal nature of this operation, 
the resulting first and last frames will be null._

**_Note:_** _This operation will split the series on gaps and 
derive each "slice" individually. The first and last frame on 
each "slice" will be null._

---

### `velocity`

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


Derives the input signal to the first order.

**_Note:_** _Due to the temporal nature of this operation, 
the resulting first and last frame will be null._

**_Note:_** _This operation will split the series on gaps and 
derive each "slice" individually. The first and last frame on 
each "slice" will be null._

---

