# Logic steps

- [if](#%60if%60)

These are steps that run logical expressions.


---

## Steps

### `if`

> **Inputs**
>
> 1. `Logical expression`
>
> **Output:** `Scalar | Series | Event | Number`

> **Options**
>
> #### `then`
>
> **Type:** `any`  
> **Required:** `True`  
> #### `else`
>
> **Type:** `any`  
> **Required:** `True`  
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


Runs a logical expression. The return value is determined by the 
result of the expression, and the `then` and `else` options.

The following operators are supported:

<pre><  >  >=  <=  ==  !=  &&  ||  !</pre>

Parentheses can be used to influence the order of evaluation.

Only numbers and single-element arrays can be part of the expression.

---

