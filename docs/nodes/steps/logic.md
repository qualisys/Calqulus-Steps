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

Only numbers and single-element arrays can be part of operands in the
expression. In addition, a single input can be used to check for existence 
of values.

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
- if: mySignal
  then: mySignal
  else: myDefault
```


---

