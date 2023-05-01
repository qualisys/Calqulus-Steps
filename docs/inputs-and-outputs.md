# Inputs and outputs

- [Inputs](#inputs)
  - [Named inputs](#named-inputs)
    - [Components](#components)
    - [Frames](#frames)
    - [Variable inputs](#variable-inputs)
    - [From a specific measurement](#from-a-specific-measurement)
  - [Value inputs](#value-inputs)
  - [Addressing results from previous steps](#addressing-results-from-previous-steps)
- [Options](#options)
- [Outputs](#outputs)
  - [Output shorthand, the arrow](#output-shorthand-the-arrow)
  - [Output immutability](#output-immutability)
- [Measurement filtering](#measurement-filtering)
  - [Filter options](#filter-options)
  - [Output nodes for specific measurements](#output-nodes-for-specific-measurements)

# Inputs

Inputs for a step is supplied on the following format:

```yaml
- step1: input
- step2: [multiple, inputs, here]
```

As shown in the example above, multiple inputs are assigned by using an array.

## Numeric inputs

Some steps takes numeric inputs, for example, the `add` step accepts an array of numbers:

```yaml
- add: [1, 5]
```

Some steps can also accept nested arrays of numbers:

```yaml
- add: [[1, 1], [5, 20]]
```

## Named inputs

Most commonly, you will be using a named input. This will either be:

- a signal containing data from the measurement, i.e., a segment or marker, or
- an exported signal on the global scope, or
- a signal output on the local scope.

If a locally scoped signal exists with _the same name_ as a globally scoped signal, the input will use the locally scoped signal.

### Components

For named signals with components, such as a segment or marker, you can
select one of the components by typing a dot (.) followed by the name of the
component.

For example, if you only want to use the **x** component of the Hips segment, you could use this syntax:

```yaml
- step1: Hips.x
```

## Mixed inputs

You can mix numbers in arrays with named signals. When a signal is used in an
array, any neighbouring numbers will be expanded to the same number of frames
as the signal. For example, `[myMarker.x, 3, 5]` is equivalent with

`[[20, 20, 100], [3, 3, 3], [5, 5, 5]]`

given that `myMarker.x = [20, 20, 100]`.

The added dimension represents frames, and the above example can be thought
of as one array (or vector) per frame:

`frame 1: [20, 3, 5]`  
`frame 2: [20, 3, 5]`  
`frame 3: [100, 3, 5]`

If multiple named signals of different lengths are used within the same array,
the shorter signals will be padded with `NaN`s so that all sequences have the
same number of frames.

## Variable inputs

It is possible to get information about the session or measurement by importing a variable. Variables start with a dollar sign (\$) and can either be statically named or fetching field values from the session or measurement.

### Static variables

- `$framerate` - returns the measurement (marker) frame rate in frames per second.
- `$analogFramerate` - returns the frame rate used for analog signals (EMG, etc.) for the measurement.
- `$length` - returns the number of (marker) frames of the measurement.

#### Example

```yaml
- parameter: Measurement_Duration
  steps:
    - divide: [$length, $framerate]
```

_This example shows how to use the `$length` and `$framerate` to calculate the measurement duration in seconds._

### Measurement & session field values

- `$field(Field Name)` - returns the value of the **measurement field** specified within the brackets. If no measurement field was found, returns the value of a **session field** of the same name. The name of the field is case sensitive.

- `$field(Field Name, measurement)` - returns the value of the **measurement field** specified within the brackets. The name of the field is case sensitive.

- `$field(Field Name, trial)` - the argument `trial` is an alias for `measurement` and returns a **measurement field** value like above.

- `$field(Field Name, session)` - returns the value of the **session field** specified within the brackets. The name of the field is case sensitive.

### Value casting

If a field value is fully numeric, it will automatically be cast as a numeric value rather than a string. However, if the value is a number followed by a string – such as a unit – the field value will be treated as a string.

To force the interpretation of the field to be numeric, pass in the value `numeric` as a third parameter to the `field` syntax, like so: `$field(Field Name, measurement, numeric)`.

If the value was not able to be parsed as a number, the result will be `NaN`.

**_Note:_** _This will only work when the field begins with a numeric value. For more information on how the parsing is done, refer to the `parseFloat` function [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat)._

#### Examples

```yaml
- parameter: Speed_Diff
  steps:
    - subtract: [$field(Treadmill Speed, measurement), Caclulated_Running_Speed]
```

_This example shows how to use a `Treadmill Speed` measurement field to calculate the difference between the entered speed and the calculated speed._

```yaml
- parameter: BMI
  steps:
    - multiply:
        [$field(Subject Height, session), $field(Subject Height, session)]
    - divide: [$field(Subject Weight, session), $prev]
```

_This example shows how to use the `Subject Height` and `Subject Weight` session fields to calculate the subject BMI._

## Select value at specific event

For named signals, you can get an input at only the frames corresponding to an event by typing an @ sign, followed by the name of the event, like so:

```yaml
- step1: Hips@LTO
```

The above example will return a scalar containing the values for the Hips segment at the frames from the `LTO` event (defined elsewhere).

It is also possible to enter an explicit frame number to return the value at this specific frame. Instead of entering an event name, simply specify the frame number you want to use. To specify a frame number counting from the end, enter a negative value.

```yaml
- step1: Hips@1
```
_This example shows how to reference the value of the first frame of the data._

```yaml
- step1: Hips@-1
```
_This example shows how to reference the value of the last frame of the data by specifying a negative value._

***Note:*** *Only integers are supported. Frame indices are 1-based, i.e. to get the first frame, enter the value 1.*

## Select signal from a specific measurement

To get a signal from a specific measurement, you can use one – or a combination – of the options described in the [Measurement filtering](#measurement-filtering) section to target a specific measurement, formatted as query strings.

### Examples

```yaml
- step1: Hips?name=static*
```

_Example of targeting the input `Hips` from a measurement where the name begins with `static`._

```yaml
- step1: Hips?fields[type]=MyType
```

_Example of targeting the input `Hips` from a measurement where the type is `MyType`._

```yaml
- step1: Hips?name=static*&fields[type]=MyType
```

_Example of targeting the input `Hips` from a measurement where the name begins with `static`_ **and** _the type is `MyType`._

```yaml
- step1: Hips?name=static*&index=last
```

_Example of targeting the input `Hips` from the_ **last** _matching measurement where the name begins with `static`._

## Value inputs

You can also supply values directly as in input, for example a number, or an array of numbers. This is useful in certain steps, for example if you want to multiply the signal with a constant:

```yaml
- multiply: [Hips, 2] # Multiplies all components of the hip segment by 2
```

If you wanted to, for example, negate only the z-position of a segment, you
could do the following:

```yaml
- multiply: [Hips, [1, 1, -1]]
```

## Addressing results from previous steps

In addition to using named inputs to target the output of a previous step, you can also use the special input `$prev(n)`, where `n` is a number indicating how many steps backwards in history to pick the output from.

To get the output from the previous step, you can use `$prev(1)` or, in shorter form, simply `$prev`.

To get the output from 2 steps before the current step, use `$prev(2)`, etc.

You can target the output from any of the steps before the current step, simply count the number of steps backwards to use as `n`.

The following two examples accomplishes the same thing, but where one is using named outputs / inputs and the other is using `$prev(n)`.

```yaml
- parameter: MyParameter
  steps:
    - import: Hips.x => hips
    - add: [2, 3]
      output: five
    - add: [hips, five]
```

_Example of steps using named inputs and outputs._

```yaml
- parameter: MyParameter
  steps:
    - import: Hips.x
    - add: [2, 3]
    - add: [$prev(2), $prev]
```

_Example of steps using `$prev(n)`._

### Example of filtering on \$prev(n)

```yaml
- parameter: MyParameter
  steps:
    - import: Hips
    - add: [$prev(2).x@LFS, 3]
```

_Example of steps using component and event filters on `$prev(n)`._

**_Note:_** _Changing the order of steps or adding/removing steps could cause `$prev(n)` to address an unintended output._

## Omitting inputs

If your step has no inputs, it will use the previous result by default.

### Example

```yaml
- parameter: MyParameter
  steps:
    - segment: Hips
    - max:
```

Has the same effect as:

```yaml
- parameter: MyParameter
  steps:
    - segment: Hips
    - max: $prev
```

# Options
Steps can support additional input via options. For example, the `Round` step
has a `precision` option used to customize the precision of the rounding operation.

In basic use cases, the option's value can be entered directly, for example as a
number, string, boolean or array.

```yaml
- parameter: MyParameter
  steps:
    - marker: myMarker.x
    - round: $prev
      precision: 3 # Hard coded option value.
```

In other cases, what you pass to the option
might need to be calculated based on your pipeline. Luckily, options can receive
named inputs just like the main input to a step.

```yaml
- parameter: MyCalculatedHeightParam
  steps:
    - step1: SomeInput
    # ... 

- parameter: MyOtherParameter
  steps:
    - marker: myMarker.x
    - peakFinder: $prev
      height: MyCalculatedHeightParam # Using a named input.
```

# Outputs

To define the output of a step, you use one (or both) of two options: `output` or `export`.

The `output` exposes the results on a **local scope** (local to the current
node, eg parameter). In other words, it's only available for the steps after
the one where it was declared within the same parent node.

```yaml
- parameter: test
  steps:
    - multiply: [Hips.x, 2]
      output: double_hips
    - subtract: [double_hips, 4]
```

_Example of a local output being used in another step in the same scope._

The `export` exposes the results on a **global scope**. Any step in the entire document can reference it. All exported results will also end up in the resulting JSON used in the report.

```yaml
- parameter: test
  steps:
    - multiply: [Hips.x, 2]
      export: double_hips

- parameter: test2
  steps:
    - subtract: [double_hips, 4]
```

_Example of a globally scoped output being used in another step in a separate scope._

## Output shorthand, the arrow

For steps where you only declare a single named input, you can use the arrow shorthand, like so:

```yaml
- step1: Hips.x => my_output
```

This is a more compact equivalent of writing the following:

```yaml
- step1: Hips.x
  output: my_output
```

Unfortunately, the shorthand isn't available unless your input consist of a single named output.

The following examples are **_invalid syntax_**:

```yaml
- step1: [Hips.x, 2] => my_output
- step2: 2 => my_output
- step2: [2] => my_output
```

## Output immutability

Once an output has been generated, it will not be overwritten by subsequent steps or output nodes.

If all exports for an output node exists in the global scope, that output node will be skipped from processing. Similarly, if all outputs for a step node exists in the local or global scope, that step will be skipped.

This feature is an integral part of the architecture of Calqulus and enables high performance for calculations which share dependencies on signals.

# Measurement filtering

When importing a signal or defining an output node, you can specify a measurement from which the signal should be imported – or for which measurement an output node should run.

You can filter measurements by name and by field values and you can use wildcard characters `*` to formulate patterns to match partial values. The matching of values is case-insensitive.

When using a measurement filter, a list of matching measurements is created. By specifying the `index` option, you can define which of the matching measurements should apply.

## Filter options

- **name** – To target a measurement by name.
- **fields[field name]** – To target a measurement by a field value.
- **index** – Out of a number of matching measurements, pick the nth match. Either a 1-based index, or the values `first` or `last` to select the first or last match, respectively.

To use filtering when importing a signal, see the [Inputs > Named inputs > From a specific measurement](#from-a-specific-measurement) section.

## Output nodes for specific measurements

When an output node should only be calculated for a certain type of measurement, or when the calculation differ between measurements, you can filter the applicable measurements for an output node using the `where` property using the options described in the [Measurement filtering](#measurement-filtering) section.

This also means you can define multiple output nodes for the same signal, but where the steps are different for the different types of measurements.

If no `index` option is set, the node is calculated for all applicable measurements, otherwise only the measurement for the specified match index is calculated.

The `where` property is available for [Parameter](./nodes/parameter.md), [Event](./nodes/event.md), and [Space](./nodes/space.md) nodes.

### Examples

```yaml
- parameter: MyParam
  where:
    name: Static*
  steps:
    - add: [2, 3]
```

_Example of an output node which will output `MyParam` for measurements where the name begins with `static`._

```yaml
- parameter: MyParam
  where:
    fields:
      type: MyType
  steps:
    - add: [2, 3]
```

_Example of an output node which will output `MyParam` for measurements where the `type` field equals `MyType`._

```yaml
- parameter: MyParam
  where:
    name: Static*
    fields:
      type: MyType
  steps:
    - add: [2, 3]
```

_Example of an output node which will output `MyParam` for measurements where the name begins with `static`_ **and** _the `type` field equals `MyType`._

```yaml
- parameter: MyParam
  where:
    name: '!Static*'
  steps:
    - add: [2, 3]
```

_Example of an output node which will output `MyParam` for measurements where the name does not begin with `Static`._

```yaml
- parameter: MyParam
  where:
    name: Static*
  index: last
```

_Example of an output node which will output `MyParam` for the_ **last** _measurement match where the name begins with `static`._
