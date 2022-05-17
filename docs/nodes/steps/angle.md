# Angle steps

- [angle](#angle)
- [angularVelocity](#angularvelocity)
- [jointAngle](#jointangle)
- [jointAngleVelocity](#jointanglevelocity)

The steps `jointAngle` and `jointAngleVelocity` exist for the 
sake of backwards compatibility and offer the same functionality 
as the `angle` and `angularVelocity` steps.

## Shared options

The following options are available on all Angle steps.

> #### `project`
>
> **Type:** `String | <PlaneSequence>`  
> **Required:** `False`  
> **Allowed values:** `xy | xz | yz`  
> **Default value:** `null`  
>
> If set to a string, the angle will be calculated in two dimensions on the 
> specified coordinate plane by ignoring the component of the 
> input signals which is not part of the plane.
>
> Using a PlaneSequence, projects the input vectors on the provided plane. 
>
> **_Note:_** _The projection is only applied for vector-based 
> angles and is ignored when calculating joint angles._

> #### `rotationOrder`
>
> **Type:** `String`  
> **Required:** `False`  
> **Allowed values:** `XYZ | YZX | ZXY | XZY | YXZ | ZYX | XYX | XZX | YXY | YZY | ZXZ | ZYZ`  
> **Default value:** `XYZ`  
>
> The rotation order to use for calculating the Euler angle. 
> Possible rotation orders are:
>
> Cardan sequence:
> - XYZ
> - YZX
> - ZXY
> - XZY
> - YXZ
> - ZYX
>
> Euler sequence:
> - XYX
> - XZX
> - YXY
> - YZY
> - ZXZ
> - ZYZ

>


---

## Steps

### `angle`

> **Inputs**
>
> 1. `Scalar | Series`
> 2. `Scalar | Series` (optional)
> 3. `Scalar | Series` (optional)
> 4. `Scalar | Series` (optional)
>
> **Output:** `Scalar | Series`


> **Shared options**
>
> <details open><summary>Angle options</summary>
> 
> The following options are available on all Angle steps.
>
> * [project](#project)
> * [rotationOrder](#rotationorder)
>
>
></details>
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


The angle step performs slightly different operation depending on 
the type and number of inputs.

**_Note:_** _For cases where multiple inputs are given of varying 
lengths, the returning array will be the maximum length and the 
last value will be repeated for the shorter inputs to fill the gap._

**One input**: `<segment>`   
Computes the euler angle of the specified segment, in degrees.

**Two inputs**: `(<segment>, <segment>) | (<vector>, <vector>)`   
Given two segments: Computes the relative (euler) angle between 
the specified segments, in degrees.

Given two vectors: Computes relative angle between the 
specified vectors, in radians.

**Three inputs**: `<vector>, <vector>, <vector>`   
Computes the angle between the two vectors defined by the 
specified points (`v0 -> v1`, `v1 -> v2`), in radians. 
The points can be specified as arrays or with named
vector signals (ie markers).

Given the inputs `v1`, `v2` and `v3`, the resulting angle 
is given by:

``` javascript
angleBetween(v1 - v0, v1 - v2)
```

**Four inputs**: `<vector>, <vector>, <vector>, <vector>`   
Computes the angle between the two lines formed by 
(`v0 -> v1`, `v2 -> v3`), in radians. The points can be 
specified as arrays or with named vector signals (ie markers).

---

### `angularVelocity`

> **Inputs**
>
> 1. `Scalar | Series` the parent segment
> 2. `Scalar | Series` the segment
> 3. `Scalar | Series` the reference segment
> 4. `Scalar | Series` the resolution segment
>
> **Output:** `Scalar | Series`

> **Options**
>
> #### `useRotationOrder`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `false`  
>
> If set to false it means that the angular velocity between the 
> segment and refernce segment is transformed to be expressed 
> into the resolution coordinate system.
>
> If set to true it means that angular velocity between the segment
> and refernce segment is transformed to be expressed into the 
> joint coordinate system using the Euler/Cardan sequence.

>

> **Shared options**
>
> <details open><summary>Angle options</summary>
> 
> The following options are available on all Angle steps.
>
> * [project](#project)
> * [rotationOrder](#rotationorder)
>
>
></details>
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


This step calculates the joint angular velocity based on the 
textbook Research Methods in Biomechanics (2nd Edition). 

You can visit http://www.kwon3d.com/theory/euler/avel.html for 
more details.

This is different from calculating the first-order derivate of 
the joint angle because each axis of the joint angle are 
different from the axes of the segment coordinate systems.

**Please consider which implementation would be correct to use 
in your instance**.

---

### `jointAngle`

> **Inputs**
>
> 1. `Scalar | Series`
> 2. `Scalar | Series` (optional)
>
> **Output:** `Scalar | Series`


> **Shared options**
>
> <details open><summary>Angle options</summary>
> 
> The following options are available on all Angle steps.
>
> * [project](#project)
> * [rotationOrder](#rotationorder)
>
>
></details>
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


Performs the same computation as `angle`, but does not handle 
three or four inputs.

---

### `jointAngleVelocity`

> **Inputs**
>
> 1. `Scalar | Series` the parent segment
> 2. `Scalar | Series` the segment
> 3. `Scalar | Series` the reference segment
> 4. `Scalar | Series` the resolution segment
>
> **Output:** `Scalar | Series`

> **Options**
>
> #### `useRotationOrder`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `false`  
>
> If set to false it means that the angular velocity between the 
> segment and refernce segment is transformed to be expressed 
> into the resolution coordinate system.
>
> If set to true it means that angular velocity between the segment
> and refernce segment is transformed to be expressed into the 
> joint coordinate system using the Euler/Cardan sequence.

>

> **Shared options**
>
> <details open><summary>Angle options</summary>
> 
> The following options are available on all Angle steps.
>
> * [project](#project)
> * [rotationOrder](#rotationorder)
>
>
></details>
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


Performs the same computation as `angularVelocity`.

---

