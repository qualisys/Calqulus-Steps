# Logic steps

- [if](#if)

These are steps that run logical expressions.


---

## Steps

### `if`

**Inputs**
>
> 1. `Logical expression`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `then`
>
> **Type:** `any`  
> **Required:** `True`  

>
> #### `else`
>
> **Type:** `any`  
> **Required:** `True`  

>

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


Runs a logical expression. The return value is determined by the 
result of the expression, and the `then` and `else` options.

The following operators are supported:

<pre><  >  >=  <=  ==  !=  &&  ||  !</pre>

Parentheses can be used to influence the order of evaluation.

You are able to use "functions" in the expression to validate if a 
signal is empty or exists. The following functions are supported:

* `empty(signalName)` - Returns true if the signal is empty, 
i.e. the signal does not exist or the value is falsy but not zero
(false, null, NaN, empty string). The value zero (0) is not
considered empty because it is a valid value for a signal.
* `exists(signalName)` - Returns true if the signal exists, 
i.e. the signal is _defined_. This function does not validate 
the _value_ of the signal but _only_ if the signal is defined 
or not. The signal value could be falsy, but as long as the 
signal is defined, this function will return true.

***Note:** Due to the way YAML is parsed, you must wrap expressions
beginning with an exclamation mark in quotes, e.g. `"!empty(mySignal)"`.*

***Note:** In order to be able to evaluate missing signals, this 
step does not validate the inputs to the expression. To validate 
a signal's existence, use the `exists` function.*

***Note:** The validation of the inputs to the `then` and `else` 
options are deferred until they are needed. This means that if the 
expression evaluates to true, but the `then` option is missing, 
the step will not fail until the `then` option is needed. This is 
done to allow for the use of references to signals that may only be 
able to be resolved in certain circumstances, e.g. when the 
expression evaluates to true.*

## Examples

``` yaml
- parameter: myCondition
  steps:
    - segment: RightFoot => rfoot
    - segment: LeftFoot => lfoot
    - if: 10 > 5
      then: rfoot
      else: lfoot
```

``` yaml
- if: (posY > 10 || posY < 5) && posX != 0
  then: posY
  else: posX
```

The following example shows how you can check for the existence of values in a
signal. If `mySignal` has values, the resulting signal would be `mySignal`, otherwise
the result is `myDefault`.

``` yaml
- if: "!empty(mySignal)"
  then: mySignal
  else: myDefault
```

The following example shows how you can check for the existence of of a
signal. If `mySignal` exists, the resulting signal would be `mySignal`, 
otherwise the result is `myDefault`.

``` yaml
- if: exists(mySignal)
  then: mySignal
  else: myDefault
```

The following example shows how you can compare values from measurement fields.

``` yaml
- if: $field(My Field; measurement; numeric) > $field(My Other Field; measurement; numeric)
  then: mySignal
  else: myDefault
```

The following example shows how to return a field value if it is not empty, otherwise return a default value.

``` yaml
- if: "!empty($field(My Field; measurement; numeric))"
  then: $field(My Field; measurement; numeric)
  else: myDefault
```


---

