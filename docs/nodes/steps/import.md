# Import steps

- [event](#%60event%60)
- [import](#%60import%60)
- [marker](#%60marker%60)
- [segment](#%60segment%60)

These are steps that imports a specific type of step by name.


---

## Steps

### `event`

> **Inputs**
>
> 1. `Event`
>
> **Output:** `Event`


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


Imports an event by name.

---

### `import`

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


Generic import of any input by name.

---

### `marker`

> **Inputs**
>
> 1. `Series`
>
> **Output:** `Series`

> **Options**
>
> #### `origin`
>
> **Type:** `<vector> | [<x>, <y>, <z>]`  
> **Required:** `False`  
> **Default value:** `N/A`  
>
> This option can be used to create a new marker signal, 
> with a custom x, y and z coordinate.

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


Imports a marker series by name or creates a new signal 
with a custom origin.

---

### `segment`

> **Inputs**
>
> 1. `Series`
>
> **Output:** `Series`


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


Imports a segment series by name.

---

