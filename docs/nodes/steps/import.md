# Import steps

- [event](#event)
- [import](#import)
- [marker](#marker)
- [segment](#segment)

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
> * [export](./index.md#export)
> * [output](./index.md#output)
> * [set](./index.md#set)
> * [space](./index.md#space)
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
> * [export](./index.md#export)
> * [output](./index.md#output)
> * [set](./index.md#set)
> * [space](./index.md#space)
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
> * [export](./index.md#export)
> * [output](./index.md#output)
> * [set](./index.md#set)
> * [space](./index.md#space)
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
> * [export](./index.md#export)
> * [output](./index.md#output)
> * [set](./index.md#set)
> * [space](./index.md#space)
>
>
></details>
>


Imports a segment series by name.

---

