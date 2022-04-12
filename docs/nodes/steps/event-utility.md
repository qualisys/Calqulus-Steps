# Event utility steps

- [eventDuration](#eventduration)
- [eventMask](#eventmask)
- [eventTime](#eventtime)

These are steps that uses events as inputs to affect the output 
in various ways.


---

## Steps

### `eventDuration`

> **Inputs**
>
> 1. `Event`
> 2. `Event`
>
> **Output:** `Scalar`


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


This step takes 2 event inputs and outputs an array of durations 
(in seconds).

Inputs 1 and 2 will be combined into pairs - from values in 
input 1 to values in input 2.

The duration is calculated using the frame rate from either 
the "from", or "to" input event.

---

### `eventMask`

> **Inputs**
>
> 1. `Series | Event`
> 2. `Event`
> 3. `Event`
>
> **Output:** `Scalar | Series | Event | Number`

> **Options**
>
> #### `replacement`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `null`  
>
> Replacement value to use for masked values. If not set, 
> masked values will be removed from the output signal. 
>
> The `replacement` property has no effect when the signal 
> input is an event.

> #### `truncate`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `False`  
>
> Whether or not the signal should be truncated, i.e., if values 
> that were not within an "event pair" should be removed or not. 
>
> This will only apply if `replacement` does not have a value.

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


This is a step which takes a signal and 2 event inputs and 
outputs a filtered signal with values only appearing in 
between the events.

Inputs 2 and 3 will be combined into pairs from values in 
input 2 to values in input 3.

These pairs can be used to filter the values in input 1.

These event pairs, or _cycles_ are also stored on the 
resulting signal, which can be used in 
[aggregations](./aggregation) to aggregate over event 
cycles. The signal will keep the cycle information no 
matter if the signal was truncated or not.

If the signal input is an event, only event frames that is 
within the span of one of the event pairs will be returned.

The optional parameter `replacement` will, if set, replace 
masked values with the given value. If `replacement` is not 
set and `truncate` is `true` – the masked values will be 
removed. The `replacement` property has no effect when the 
signal input is an event.

If `replacement` is not set and `truncate` is `false` 
(default behavior), the output signal is untouched, except 
that the event cycles are annotated on the signal.

---

### `eventTime`

> **Inputs**
>
> 1. `Event`
>
> **Output:** `Scalar`


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


This step takes an event input and converts each frame value 
to a time value (in seconds).

The time is calculated using the frame rate from the signal.

---

