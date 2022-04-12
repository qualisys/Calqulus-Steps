# Geometry steps

- [distance](#%60distance%60)
- [magnitude](#%60magnitude%60)
- [plane](#%60plane%60)
- [project](#%60project%60)
- [unitVector](#%60unitvector%60)


---

## Steps

### `distance`

> **Inputs**
>
> 1. `Scalar | Series (<vector> | <segment>)`
> 2. `Scalar | Series (<vector> | <segment>)`
>
> **Output:** `Scalar | Series`


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


Accepts marker or segment sequences and calculates the distance 
between the points (Euclidian norm).

It assumes that the values are comparable by index. If the sequence 
length differs, the calculation will be done up until the shortest 
length of the input sequences.

---

### `magnitude`

> **Inputs**
>
> 1. `Scalar | Series (<vector> | <segment>)`
>
> **Output:** `Scalar | Series`


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


Accepts a vector or a segment sequence and calculates 
the magnitude of it (Euclidian norm).

---

### `plane`

> **Inputs**
>
> 1. `Scalar | Series (<vector> | <segment>)`
> 2. `Scalar | Series (<vector> | <segment>)`
> 3. `Scalar | Series (<vector> | <segment>)`
>
> **Output:** `Plane`


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


Takes three marker or segment sequences and returns the plane 
which intersects all three points.

It assumes that the values are comparable by index. If the sequence 
length differs, the calculation will be done up until the shortest 
length of the input sequences.

---

### `project`

> **Inputs**
>
> 1. `Scalar | Series (<vector> | <segment>)`
> 2. `Plane`
>
> **Output:** `Scalar | Series (<vector> | <segment>)`


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


Orthogonally projects a point onto a plane and returns the 
location of the projected point.

***Note:*** *The plane will remain in the space used when 
creating it, applying a space to the `project` step will 
apply the space to the vector / segment, but the plane will 
be left untouched.*

---

### `unitVector`

> **Inputs**
>
> 1. `Series (<vector> | <segment>)`
>
> **Output:** `Series (<vector> | <segment>)`


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


Calculates the unit vector i.e. the new vector has the same 
direction of the input vector but its norm equals 1.

---

