# Geometry steps

- [distance](#distance)
- [magnitude](#magnitude)
- [plane](#plane)
- [project](#project)
- [unitVector](#unitvector)


---

## Steps

### `distance`

**Inputs**
>
> 1. `Scalar | Series (<vector> | <segment>)`
> 2. `Scalar | Series (<vector> | <segment>)`
>

**Output:** `Scalar | Series`


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


Accepts marker or segment sequences and calculates the distance 
between the points (Euclidean norm).

It assumes that the values are comparable by index. If the sequence 
length differs, the calculation will be done up until the shortest 
length of the input sequences.

---

### `magnitude`

**Inputs**
>
> 1. `Scalar | Series (<vector> | <segment>)`
>

**Output:** `Scalar | Series`


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


Accepts a vector or a segment sequence and calculates 
the magnitude of it (Euclidean norm).

---

### `plane`

**Inputs**
>
> 1. `Scalar | Series (<vector> | <segment>)`
> 2. `Scalar | Series (<vector> | <segment>)`
> 3. `Scalar | Series (<vector> | <segment>)`
>

**Output:** `Plane`


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


Takes three marker or segment sequences and returns the plane 
which intersects all three points.

It assumes that the values are comparable by index. If the sequence 
length differs, the calculation will be done up until the shortest 
length of the input sequences.

---

### `project`

**Inputs**
>
> 1. `Scalar | Series (<vector> | <segment>)`
> 2. `Plane`
>

**Output:** `Scalar | Series (<vector> | <segment>)`


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


Orthogonally projects a point onto a plane and returns the 
location of the projected point.

***Note:*** *The plane will remain in the space used when 
creating it, applying a space to the `project` step will 
apply the space to the vector / segment, but the plane will 
be left untouched.*

---

### `unitVector`

**Inputs**
>
> 1. `Series (<vector> | <segment>)`
>

**Output:** `Series (<vector> | <segment>)`


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


Calculates the unit vector i.e. the new vector has the same 
direction of the input vector but its norm equals 1.

---

