# Event utility steps

- [eventDuration](#eventduration)
- [eventMask](#eventmask)
- [eventTime](#eventtime)
- [refineEvent](#refineevent)

These are steps that uses events as inputs to affect the output 
in various ways.


---

## Steps

### `eventDuration`

**Inputs**
>
> 1. `Event`
> 2. `Event`
>

**Output:** `Scalar`


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


This step takes 2 event inputs and outputs an array of durations 
(in seconds).

Inputs 1 and 2 will be combined into pairs - from values in 
input 1 to values in input 2.

The duration is calculated using the frame rate from either 
the "from", or "to" input event.

---

### `eventMask`

**Inputs**
>
> 1. `Series | Event`
> 2. `Event`
> 3. `Event`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
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
>
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

**Inputs**
>
> 1. `Event`
>

**Output:** `Scalar`


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


This step takes an event input and converts each frame value 
to a time value (in seconds).

The time is calculated using the frame rate from the signal.

---

### `refineEvent`

**Inputs**
>
> 1. `Event`
>

**Output:** `Event`

**Options**
>
> #### `sequence`
>
> **Type:** `Event[]`  
> **Required:** `True`  
>
> A sequence of events. This must include at least one instance of the main input event.
>
> #### `exclude`
>
> **Type:** `Event[]`  
> **Required:** `False`  
>
> Event(s) that will invalidate an event sequence if found within it.
>
> #### `cyclic`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `True`  
>
> Whether or not to treat sequences as cyclic (`true` as default).
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


This step allows you to easily pick out frames from an event only when 
they appear in a specific sequence of other events.

The main input of this step is the event you want to select frames from.

The required option `sequence` defines a sequence of events to happen 
in order. This option requires at least one instance of the main input 
event (otherwise, no event would be able to be picked from the sequence).

Multiple instances of the main input event can be supplied to the sequence
to enable more complex patterns of events.

The optional option `exclude` defines events that cannot occur in a 
sequence. If it does, the sequence is invalidated, meaning no events will 
be picked from this sequence.

The `exclude` option cannot contain any signals defined in the 
`sequence` option.

The optional option `cyclic` defines whether or not the sequence should 
be treated as cyclic, i.e., if the sequence starts and ends with the same 
events, those events are included in the next "match-finding" iteration 
of the sequence. This is useful for refining event cycles where the end 
event is the start event of the next cycle.

The `cyclic` option is `true` by default and has to be explicitly set 
to `false` to disable.

---

