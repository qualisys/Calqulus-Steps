# Body Mass

The body mass (i.e., the weight of the subject) is essential for calculating inverse dynamics. During session processing, Calqulus determines the subject's body mass using one of the following sources:

- Force data from force plates during a static measurement.
- The value provided in the `Mass` or `Weight` field in QTM.

## Reading Body Mass from Force Plates

Calqulus first searches for a static measurement within the session. If multiple static files are found, the last one—based on alphabetical order—is selected.

Once a static measurement is identified, Calqulus checks for the presence of one or more force plates. For each force plate:

- The force magnitude is computed for every frame.
- If the median force magnitude is below 50N, the plate is considered inactive and is ignored.

Force magnitudes from all active force plates are then combined frame by frame. The standard deviation of these combined forces is calculated; if this value exceeds 50, it indicates that the subject was not stationary during the static measurement, and the force plate data is discarded.

Subsequently, all frames where the combined force magnitude is below 50N are filtered out. If no frames exceed this threshold, the force plate data is ignored. Otherwise, the median of the remaining frames is divided by the gravitational acceleration to estimate the body mass.

Finally, if the estimated body mass from the force plates exceeds 200kg, the data is deemed invalid and ignored.

If Calqulus is unable to determine the mass using the force plates at any point in this process, it will fall back to using the weight defined in the session fields or the default weight, as specified by the `Body weight mode`.

## Reading Body Mass from Fields

If the session includes a `Mass` or `Weight` field, its value is validated to ensure it is numeric and nonzero. Should the field be missing or contain an invalid value, Calqulus disregards it and uses the default weight instead.

## Specifying a Mode

The source used for determining body mass can be explicitly defined via the `Body weight mode` field in QTM. If this field is not provided, the system defaults to `Automatic` mode.

### Automatic Mode

When the `Body weight mode` is set to `Automatic`, Calqulus resolves the body mass in the following order:

1. **Force Plates:** Use force plate data if available and valid.
2. **Field Value:** Use the value from the `Mass` or `Weight` field if it exists and is nonzero.
3. **Default Weight:** Otherwise, use the default weight (65kg).

### Force Plate Mode

When the `Body weight mode` is set to `From force plate`, Calqulus follows this order:

1. **Force Plates:** Use force plate data if available and valid.
2. **Default Weight:** Otherwise, use the default weight (65kg).

### Entered Weight Mode

When the `Body weight mode` is set to `Entered`, Calqulus follows this order:

1. **Field Value:** Use the value from the `Mass` or `Weight` field if it exists and is nonzero.
2. **Default Weight:** Otherwise, use the default weight (65kg).
