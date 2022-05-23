# Event generator steps

- [peakFinder](#peakfinder)
- [threshold](#threshold)

These are steps that accepts a series (numeric array or single 
component) input and outputs an event result.


---

## Steps

### `peakFinder`

**Inputs**
>
> 1. `Series`
>

**Output:** `Event`

**Options**
>
> #### `distance`
>
> **Type:** `Number | Range`  
> **Required:** `False`  
> **Default value:** `null`  
>
> Required minimal horizontal distance (>= 1) in samples 
> between neighbouring peaks. 
>
> Smaller peaks are removed first until the condition is 
> fulfilled for all remaining peaks.
>
> #### `height`
>
> **Type:** `Number | Range`  
> **Required:** `False`  
> **Default value:** `null`  
>
> Required height of peaks. Either a number or a 2-element 
> array. The first element is always interpreted as the 
> minimal and the second, if supplied, as the maximal 
> required height.
>
> #### `prominence`
>
> **Type:** `Number | Range`  
> **Required:** `False`  
> **Default value:** `null`  
>
> Required prominence of peaks. Either a number or a 2-element 
> array. The first element is always interpreted as the minimal 
> and the second, if supplied, as the maximal required prominence.
>
> #### `relHeight`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `0.5`  
>
> Used for calculation of the peaks width, thus it is only used 
> if width is given. 
>
> Chooses the relative height at which the peak width is 
> measured as a percentage of its prominence. 1.0 calculates 
> the width of the peak at its lowest contour line while 0.5 
> evaluates at half the prominence height. Must be at least 0.
>
> #### `sequence`
>
> **Type:** `SequenceOptions`  
> **Required:** `False`  
> **Default value:** `0.5`  
>
> Allows to classify peaks using a pattern and select peaks 
> from the pattern to use as the output. 
>
> See below for further information.>
>
> **Child options:**
>
>
> > #### `sequence.ranges`
> >
> > **Type:** `String`  
> > **Required:** `False`  
> > **Default value:** `L 50 H`  
> >
> > Classification of the peak heights. This option expects a string 
> > consisting of 1-character labels separated by a boundary value.
> >
> > The boundary values represent a percentage between 0 – 100 which 
> > defined the end of the previous label's range and the beginning of 
> > the next label's range.
> >
> > The entire range 0 – 100 represents the difference between the 
> > lowest peak and the highest peak. All peaks will be somewhere in 
> > this range, and the `ranges` option allows you to customize how 
> > the peaks are labelled.
> >
> > The default `ranges` value is: `L 50 H`. This labels the peaks 
> > that end up in the bottom 50% of the peak heights as `L`, and the 
> > remaining top 50% as `H`.
> >
> > The syntax, `L 50 H`, is equivalent to writing `0 L 50 H 100`. 
> >
> > The outer boundaries `0` and `100` is assumed though and are 
> > not required.
> >
> > If you would like to classify the peaks into three groups, the 
> > bottom 25% as `L`, the top 25% and `H`, and anything in between 
> > as `M`, you can supply the following string: `L 25 M 75 H`.
> >
> > The labels used should each be 1 character long, but can be 
> > whatever you want as long as it corresponds to the pattern used 
> > in the `pattern` option.
> >
> >
> > #### `sequence.pattern`
> >
> > **Type:** `String`  
> > **Required:** `True`  
> > **Default value:** `null`  
> >
> > A pattern describing a sequence of classified peak heights using the 
> > labels defined in the `ranges` option.
> >
> > If you have supplied the `ranges` string `L 50 H`, and you want 
> > to find the following sequence of peaks: "a **low peak** followed 
> > by a **low peak** followed by a **high peak**, you can define the 
> > `pattern` as `LLH`.
> >
> > Each matching pattern sequence is stored and the pattern indices in 
> > `keep` determines which of the peaks that are returned.
> >
> >
> > #### `sequence.keep`
> >
> > **Type:** `Number array`  
> > **Required:** `True`  
> > **Default value:** `null`  
> >
> > An array of indices from the `pattern` labels to keep in the output. 
> > The index is zero-based, i.e., the first item in the sequence pattern 
> > is 0, the last in the sequence is the (length of the pattern) - 1.
> >
> > If the `pattern` was defined as `LLH` and we wanted to keep only 
> > the _first_ (low) peak in each matching sequence, we would set 
> > `keep` to `[0]`.
> >
> > Conversely if we wanted to keep the _last_ (high) peak in each sequence, 
> > the `keep` should be `[2]`.
> >
> > To keep both the _first_ **and** _last_ peaks in the sequence, the 
> > `keep` option should be set to `[0, 2]`.
> >
> > Peaks in the sequence pattern not indexed by `keep` will be ignored 
> > in the output.
> >
>
> #### `width`
>
> **Type:** `Number | Range`  
> **Required:** `False`  
> **Default value:** `null`  
>
> Required width of peaks in samples. Either a number or a 
> 2-element array. The first element is always interpreted 
> as the minimal and the second, if supplied, as the 
> maximal required width.
>
> #### `window`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `null`  
>
> Used for calculation of the peaks prominences, thus it is 
> only used if one of the arguments prominence or width 
> is given.
>
> A window length in samples that optionally limits the 
> evaluated area for each peak to a subset of x. 
> The peak is always placed in the middle of the window 
> therefore the given length is rounded up to the next 
> odd integer. This parameter can speed up the calculation.
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


Find peaks inside a signal based on peak properties.

At first, it will detect _any_ peak-like features in the signal. 
If any of the options `distance`, `height`, `prominence`, 
or `width` is defined, it will use those properties to filter 
out peaks that match the criteria.

As a last step, if the `sequence` option is used, it will 
match the peaks against a sequence to return a subset of 
the peaks.

As a general rule, the peakFinder step is sensitive to noise 
in the data, so if noise is expected, first run the data 
through a [low-pass filter](./filters).

Based on the SciPy [find_peaks](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.find_peaks.html) function.

---

### `threshold`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `value`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `0`  
>
> The threshold value to use.
>
> #### `direction`
>
> **Type:** `String`  
> **Required:** `False`  
> **Allowed values:** `up | down | both`  
> **Default value:** `both`  
>
> The direction of crossing the threshold to record.
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


This step will register an event for every frame where the signal 
passes the specified threshold `value`.

By default, an event is registered when the signal crosses the 
threshold in either an ascending or descending direction. 

By configuring the `direction` option, you can specify a 
certain direction that will trigger the event; 
`up` (ascending) or `down` (descending).

---

