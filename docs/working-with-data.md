# Working with data

## Available data
The data that is available depends on your measurement. Typically there will be
marker and skeletal data.

Calqulus can import the following kinds of data from your measurements:
* Marker
* Skeletal (accessible via *segments*)
* EMG
* Kinetics (accessible via *joints*).

## Importing data
To access data in a Calqulus pipeline you can either reference it by name
directly or use a step node to explicitly import it, for example using
the [*import*](./nodes/steps/import.md) step.

#### Examples
The following examples shows how you can work with segments in three different ways.

_Using *segment step*._
```yaml
- parameter: segmentUsingSegmentStep
  steps:
   - segment: LeftLeg => shank
   - segment: LeftUpLeg => thigh
   - angle: [shank, thigh]
```

_Using *import step*._
```yaml
- parameter: segmentImportStep
  steps:
   - import: LeftLeg
     output: shank
   - import: LeftUpLeg
     output: thigh
   - angle: [shank, thigh]
```

_Using direct reference._
```yaml
- parameter: segmentByName
  steps:
   - angle: [LeftLeg, LeftUpLeg]
```

_Just like with segments, you can access joints using `import` or by directly refering to the joint by name._
```yaml
- parameter: jointImportStep
  steps:
   - import: [RightKnee]
     output: knee
   - multiply: [knee.fx, knee.fy]
```

```yaml
- parameter: jointByName
  steps:
   - multiply: [RightKnee.fx, RightKnee.fy]
```


See [segment names](./segments.md) and [joint names](./joints.md) for a
complete reference of available segment & joint names.

## Components
You can access components of your data using dot (.) notation.

_Example of multiplying the x and y component of a marker._
```yaml
- parameter: xy
  steps:
   - multiply: [MyMarker.x, MyMarker.y]
```

## Available components
### Marker
**Position**
* x, y, z

### Segment
**Position**
* x, y, z

**Orientation**
* rx, ry, rz, rw

### Joint
**Position**
* x, y, z

**Force**
* fx, fy, fz

**Moment**
* mx, my, mz

**Power**
* px, py, pz

## Quick reference
### Segments
| Left         | Unilateral | Right         |
| :----------- | :--------- | :------------ |
|              | Head       |               |
|              | Neck       |               |
| LeftShoulder |            | RightShoulder |
| LeftArm      |            | RightArm      |
| LeftForeArm  |            | RightForeArm  |
| LeftHand     |            | RightHand     |
|              | Spine2     |               |
|              | Spine1     |               |
|              | Spine      |               |
|              | Hips       |               |
| LeftUpLeg    |            | RightUpLeg    |
| LeftLeg      |            | RightLeg      |
| LeftFoot     |            | RightFoot     |
| LeftToeBase  |            | RightToeBase  |

### Joints
| Left                  | Unilateral       | Right              |
| :-------------------- | :--------------- | :----------------- |
| LeftHip               |                  | RightHip           |
| LeftKnee              |                  | RightKnee          |
| LeftAnkle             |                  | RightAnkle         |


### Markers (Sports marker set)
| Left                  | Unilateral       | Right              |
| :-------------------- | :--------------- | :----------------- |
|                       | HeadFront        |                    |
| HeadL                 |                  | HeadR              |
|                       | Chest            |                    |
| WaistLFront           |                  | WaistRFront        |
|                       | SpineThoracic2   |                    |
|                       | SpineThoracic12  |                    |
|                       | WaistBack        |                    |
| WaistLFront           |                  | WaistRFront        |
| WaistL                |                  | WaistR             |
| LShoulderTop          |                  | RShoulderTop       |
| LElbowOut             |                  | RElbowOut          |
| LElbowIn              |                  | RElbowIn           |
| LWristIn              |                  | RWristIn           |
| LWristOut             |                  | RWristOut          |
| LThighFrontLow        |                  | RThighFrontLow     |
| LKneeOut              |                  | RKneeOut           |
| LKneeIn               |                  | RKneeIn            |
| LShinFrontHigh        |                  | RShinFrontHigh    |
| LAnkleOut             |                  | RAnkleOut          |
| LForefoot5            |                  | RForefoot5         |
| LForefoot2            |                  | RForefoot2         |
| LArm                  |                  | RArm               |
| LHand2                |                  | RHand2             |
| LHeelBack             |                  | RHeelBack          |
| LHeelBack             |                  | RHeelBack          |