# Step nodes

A step node takes an input and some options and outputs a value.

## Step node categories

- [Aggregation](./aggregation.md)
- [Algorithm](./algorithm.md)
- [Angle](./angle.md)
- [Arithmetic](./arithmetic.md)
- [Data structure](./data-structure.md)
- [Event generator](./event-generator.md)
- [Event utility](./event-utility.md)
- [Filter](./filter.md)
- [Geometry](./geometry.md)
- [Import](./import.md)
- [Kinematic](./kinematic.md)
- [Logic](./logic.md)
- [Trigonometry](./trigonometry.md)


## Shared options

The following options is available on all steps and regards 
common tasks like data exports.

> #### `export`
>
> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `undefined`  
>
> If this option is set, the result of this step will be exposed 
> on the global scope, as well as being exported to the resulting 
> JSON file.
>
> The value of this option will be the name of the exported data 
> and can be used to load the resulting data in other steps.
>

> #### `output`
>
> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `undefined`  
>
> If this option is set, the result of this step will be exposed 
> on the local scope.
>
> The value of this option will be the name of the output data 
> and can be used to load the resulting data in other steps 
> _within the same output node_.
>
> You can also use the short-form "arrow syntax" to define 
> an output.
>

> #### `set`
>
> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `null`  
>
> Used to specify which _set_ the exported parameter will use. 
> In most cases, this will be either `left` or `right`.
>
> This option is only used in two cases; where there is also 
> an `export` option set, or on the last step in a list. 
> In the latter case, the step's `set` is used only if 
> there's no `set` defined on the parent output node.
>
> If this option is not set, the JSON output will use set: null.
>

> #### `space`
>
> **Type:** `Space`  
> **Required:** `False`  
> **Default value:** `null`  
>
> This option lets you reference a space where you want the input 
> data for the step to be translated into.
>
> All named inputs will automatically be converted.
>
> **_NOTE:_** _This is **not yet implemented** for segments._
>

