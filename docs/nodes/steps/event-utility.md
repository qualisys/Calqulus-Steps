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

**Options**
>
> #### `exclude`
>
> **Type:** `Number | Number array`  
> **Required:** `False`  
> **Default value:** `null`  
>
> One or more event signals that should invalidate an event
> sequence. If any of these events occur within a sequence,
> the sequence is invalidated.
>
> #### `include`
>
> **Type:** `Number | Number array`  
> **Required:** `False`  
> **Default value:** `null`  
>
> One or more event signals that should be included in an
> event sequence, otherwise it is excluded. If multiple 
> events are supplied, all of them must be present in each
> sequence for it to be included.
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
> #### `keep`
>
> **Type:** `Number | Number array`  
> **Required:** `False`  
> **Default value:** `null`  
>
> An index or an array of indices of events in each cycle to 
> keep. This allows you to keep only a subset of event instances 
> in each cycle.
>
> Negative numbers can be used to count from the end of the cycle, 
> e.g. -1 is the last event in the cycle.
>
> **_Note:_** _This only applies to event inputs._
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
> #### `exclude`
>
> **Type:** `Number | Number array`  
> **Required:** `False`  
> **Default value:** `null`  
>
> One or more event signals that should invalidate an event
> sequence. If any of these events occur within a sequence,
> the sequence is invalidated.
>
> #### `include`
>
> **Type:** `Number | Number array`  
> **Required:** `False`  
> **Default value:** `null`  
>
> One or more event signals that should be included in an
> event sequence, otherwise it is excluded. If multiple 
> events are supplied, all of them must be present in each
> sequence for it to be included.
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
input 2 to values in input 3. If there are multiple frames
in input 2 before a larger frame is found in input 3, the
last frame in input 2 will be paired with the frame in input 3.

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

## Examples

```yaml
- parameter: RFS_times
  steps:
    - eventTime: RFS
```


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

## Examples

This example picks the frames of event `A` only when it's followed 
by an event frame from the events `B` and `C`, respectively.

```yaml
- event: RefinedEvent
  steps:
    - refineEvent: A
      sequence: [A, B, C]
```

The next example does the same as above but also excludes sequences where 
an error named `ERR` occurs within.

```yaml
- event: RefinedEvent
  steps:
    - refineEvent: A
      sequence: [A, B, C]
      exclude: [ERR]
```

This example has a more intricate event pattern and picks the frames of 
event `A` only when it's followed by an event frame from the events 
`B` and `C`, then another instance of `A` followed by an event 
frame from the events `D` and `E`, respectively.

This will return two frames from `A` for each complete sequence found.

```yaml
- event: RefinedEvent
  steps:
    - refineEvent: A
      sequence: [A, B, C, A, D, E]
```


---

