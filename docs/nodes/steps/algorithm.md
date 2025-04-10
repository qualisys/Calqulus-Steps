# Algorithm steps

- [abs](#abs)
- [convert](#convert)
- [diff](#diff)
- [dotProduct / dot](#dotproduct)
- [gapFill](#gapfill)
- [integral](#integral)
- [negate](#negate)
- [power / pow](#power)
- [qbrt](#qbrt)
- [root](#root)
- [round](#round)
- [sort](#sort)
- [sqrt](#sqrt)

These are steps that takes a single input (scalar / series / events /
numbers) and runs a defined algorithmic function over them and outputs 
a resulting signal of the same type as the input.


---

## Steps

### `abs`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


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


Outputs the absolute value for each value in the input signal.

---

### `convert`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `from`
>
> **Type:** `String`  
> **Required:** `True`  
> **Default value:** `null`  
>
> Defines the unit to convert **from**.
>
> #### `to`
>
> **Type:** `String`  
> **Required:** `True`  
> **Default value:** `null`  
>
> Defines the unit to convert **to**.
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


For each value of the input, converts it according to 
the units defined in the `from` and `to` options.

For example, to convert from radians to degrees, set
`from` to `rad` and `to` to `deg`.

<details><summary><strong>For a list of supported units, click 
here.</strong></summary>

Units may generally be converted within a "type". Each unit may 
have one or more aliases, i.e., alternative spellings,
abbreviations, or synonyms.

In addition to the following units, combination of units 
are also available, such as `m/s`, `N*m` (alternatively
`N m`), `m²` (alternatively `m^2`, `m2`), etc.
### Acceleration

| Unit | Aliases |
|------|------|
| `Gal` |  |
| `gee` |  |

### Activity

| Unit | Aliases |
|------|------|
| `katal` | `kat`, `Katal` |
| `unit` | `U`, `enzUnit` |

### Angle

| Unit | Aliases |
|------|------|
| `degree` | `°`, `deg`, `degrees` |
| `gradian` | `gon`, `grad`, `grads` |
| `radian` | `rad`, `radians` |
| `rotation` |  |

### Angular Velocity

| Unit | Aliases |
|------|------|
| `rpm` |  |

### Area

| Unit | Aliases |
|------|------|
| `acre` | `acres` |
| `hectare` |  |
| `sqft` |  |

### Capacitance

| Unit | Aliases |
|------|------|
| `farad` | `F`, `Farad` |

### Charge

| Unit | Aliases |
|------|------|
| `Ah` |  |
| `coulomb` | `C`, `Coulomb` |

### Conductance

| Unit | Aliases |
|------|------|
| `siemens` | `S`, `Siemens` |

### Currency

| Unit | Aliases |
|------|------|
| `cents` |  |
| `dollar` | `USD` |

### Current

| Unit | Aliases |
|------|------|
| `ampere` | `A`, `Ampere`, `amp`, `amps` |

### Energy

| Unit | Aliases |
|------|------|
| `Calorie` | `Cal`, `Calories` |
| `Wh` |  |
| `btu` | `BTU`, `BTUs` |
| `calorie` | `cal`, `calories` |
| `erg` | `ergs` |
| `joule` | `J`, `Joule`, `joules` |
| `therm-US` | `th`, `therm`, `therms`, `Therm` |

### Force

| Unit | Aliases |
|------|------|
| `dyne` | `dyn` |
| `newton` | `N`, `Newton` |
| `pound-force` | `lbf` |

### Frequency

| Unit | Aliases |
|------|------|
| `hertz` | `Hz`, `Hertz` |

### Illuminance

| Unit | Aliases |
|------|------|
| `lux` |  |

### Inductance

| Unit | Aliases |
|------|------|
| `henry` | `H`, `Henry` |

### Information

| Unit | Aliases |
|------|------|
| `bit` | `b`, `bits` |
| `byte` | `B`, `bytes` |

### Information Rate

| Unit | Aliases |
|------|------|
| `Bps` |  |
| `bps` |  |

### Length

| Unit | Aliases |
|------|------|
| `AU` | `astronomical-unit` |
| `angstrom` | `ang`, `angstroms` |
| `datamile` | `DM` |
| `fathom` | `fathoms` |
| `foot` | `ft`, `feet`, `'` |
| `furlong` | `furlongs` |
| `inch` | `in`, `inches`, `"` |
| `league` | `leagues` |
| `light-minute` | `lmin` |
| `light-second` | `ls` |
| `light-year` | `ly` |
| `meter` | `m`, `meters`, `metre`, `metres` |
| `mil` | `mils` |
| `mile` | `mi`, `miles` |
| `naut-mile` | `nmi` |
| `parsec` | `pc`, `parsecs` |
| `pica` | `picas` |
| `point` | `pt`, `points` |
| `redshift` | `z`, `red-shift` |
| `rod` | `rd`, `rods` |
| `yard` | `yd`, `yards` |

### Luminous Power

| Unit | Aliases |
|------|------|
| `lumen` | `lm` |

### Magnetism

| Unit | Aliases |
|------|------|
| `gauss` | `G` |
| `maxwell` | `Mx`, `maxwells` |
| `oersted` | `Oe`, `oersteds` |
| `tesla` | `T`, `teslas` |
| `weber` | `Wb`, `webers` |

### Mass

| Unit | Aliases |
|------|------|
| `AMU` | `u`, `amu` |
| `carat` | `ct`, `carats` |
| `dalton` | `Da`, `Dalton`, `Daltons`, `daltons` |
| `dram` | `drams`, `dr` |
| `grain` | `grains`, `gr` |
| `gram` | `g`, `grams`, `gramme`, `grammes` |
| `kilogram` | `kg`, `kilograms` |
| `metric-ton` | `tonne` |
| `ounce` | `oz`, `ounces` |
| `pound` | `lbs`, `lb`, `pounds`, `#` |
| `short-ton` | `tn`, `ton` |
| `slug` | `slugs` |
| `stone` | `stones`, `st` |

### Potential

| Unit | Aliases |
|------|------|
| `volt` | `V`, `Volt`, `volts` |

### Power

| Unit | Aliases |
|------|------|
| `horsepower` | `hp` |
| `volt-ampere` | `VA` |
| `volt-ampere-reactive` | `var`, `Var`, `VAr`, `VAR` |
| `watt` | `W`, `watts` |

### Pressure

| Unit | Aliases |
|------|------|
| `atm` | `ATM`, `atmosphere`, `atmospheres` |
| `bar` | `bars` |
| `cmh2o` | `cmH2O` |
| `inHg` |  |
| `inh2o` | `inH2O` |
| `mmHg` |  |
| `pascal` | `Pa`, `Pascal` |
| `psi` |  |
| `torr` |  |

### Radiation

| Unit | Aliases |
|------|------|
| `becquerel` | `Bq`, `becquerels` |
| `curie` | `Ci`, `curies` |
| `gray` | `Gy`, `grays` |
| `roentgen` | `R` |
| `sievert` | `Sv`, `sieverts` |

### Resistance

| Unit | Aliases |
|------|------|
| `ohm` | `Ohm`, `Ω`, `Ω` |

### Speed

| Unit | Aliases |
|------|------|
| `fps` |  |
| `knot` | `kt`, `kn`, `kts`, `knots` |
| `kph` |  |
| `mph` |  |

### Substance

| Unit | Aliases |
|------|------|
| `mole` | `mol` |

### Temperature

| Unit | Aliases |
|------|------|
| `celsius` | `°C`, `degC`, `centigrade` |
| `fahrenheit` | `degF` |
| `kelvin` | `degK` |
| `rankine` | `degR` |
| `temp-C` | `tempC` |
| `temp-F` | `tempF` |
| `temp-K` | `tempK` |
| `temp-R` | `tempR` |

### Time

| Unit | Aliases |
|------|------|
| `century` | `centuries` |
| `day` | `d`, `days` |
| `decade` | `decades` |
| `fortnight` | `fortnights` |
| `hour` | `h`, `hr`, `hrs`, `hours` |
| `minute` | `min`, `mins`, `minutes` |
| `second` | `s`, `sec`, `secs`, `seconds` |
| `week` | `wk`, `weeks` |
| `year` | `y`, `yr`, `years`, `annum` |

### Viscosity

| Unit | Aliases |
|------|------|
| `poise` | `P` |
| `stokes` | `St` |

### Volume

| Unit | Aliases |
|------|------|
| `beerbarrel` | `bl`, `bl-us`, `beerbarrels`, `beer-barrel`, `beer-barrels` |
| `beerbarrel-imp` | `blimp`, `bl-imp`, `beerbarrels-imp`, `beer-barrel-imp`, `beer-barrels-imp` |
| `bushel` | `bu`, `bsh`, `bushels` |
| `cup` | `cu`, `cups` |
| `fluid-ounce` | `floz`, `fluid-ounces` |
| `fluid-ounce-imp` | `flozimp`, `floz-imp`, `fluid-ounces-imp` |
| `gallon` | `gal`, `gallons` |
| `gallon-imp` | `galimp`, `gallons-imp` |
| `liter` | `l`, `L`, `liters`, `litre`, `litres` |
| `oilbarrel` | `bbl`, `oilbarrels`, `oil-barrel`, `oil-barrels` |
| `pint` | `pt`, `pints` |
| `pint-imp` | `ptimp`, `pints-imp` |
| `quart` | `qt`, `quarts` |
| `tablespoon` | `tb`, `tbsp`, `tbs`, `tablespoons` |
| `teaspoon` | `tsp`, `teaspoons` |

</details>

---

### `diff`

**Inputs**
>
> 1. `Scalar | Series | Event`
>

**Output:** `Scalar | Series | Event`


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


Outputs the difference between each value in the input. 
Since this compares value `n` with `n+1`, the output 
signal will be shorter by one item.

---

### `dotProduct`

**Alias:**  dot

**Inputs**
>
> 1. `Series | Scalar`
> 2. `Series | Scalar`
>

**Output:** `Series`


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


Calculates the dot product between two vectors. 

The output length will be equal to the length of the first vector sequence. 

The second vector sequence needs to be singular or equal to the first vector sequence in length.

A lone vector in the second input will be used to calculate the dot product between itself 
and all vectors contained in the first vector sequence. 

---

### `gapFill`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `type`
>
> **Type:** `String`  
> **Required:** `False`  
> **Allowed values:** `linear | spline`  
> **Default value:** `spline`  

>
> #### `maxGapLength`
>
> **Type:** `String`  
> **Required:** `False`  
> **Default value:** `0.1s`  

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


Outputs a resulting signal of the same type as the input signal 
where gaps are filled using interpolation.  

***Note:*** *Gaps at the beginning or end of the signal will 
not be interpolated.*

---

### `integral`

**Inputs**
>
> 1. `Series`
>

**Output:** `Scalar | Series`

**Options**
>
> #### `scalar`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `false`  
>
> Returns the integral as a single value scalar.
>
> #### `useCycles`
>
> **Type:** `Boolean`  
> **Required:** `False`  
> **Default value:** `True`  
>
> If the signal has cycles defined, the integral step will be run 
> separately over each signal, and a list of values are returned, 
> one for each cycle.
>
> To avoid this behavior, set `useCycles` to `false`.
>
> For information on how to set event cycles on a signal, 
> see the [eventMask](./event-utils.md) step.
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


Returns the cumulative integral between neighboring frames in a data series, using the trapezoidal rule. 
It returns a series by default.

---

### `negate`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


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


Outputs the negated value for each value in the input signal.

---

### `power`

**Alias:** pow

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `exponent`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `2`  
>
> Defines the exponent to raise the input to. If the exponent is
> omitted, the default value of 2 will be used.
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


Computes the power of the input signal by raising it to the specified
exponent. By default, the exponent is 2, which means that the input
signal is squared.

---

### `qbrt`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


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


Computes the cube root of the input signal.

---

### `root`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `index`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `2`  
>
> Defines the index of the root to take - the nth root of the input.
> For example, if the index is 2, the square root of the input will
> be taken. If the index is 3, the cube root of the input will be
> taken.
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


Computes the root of the input signal by taking the nth root of the
input. By default, the index is 2, which means that the square root
of the input signal is taken.

---

### `round`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `precision`
>
> **Type:** `Number`  
> **Required:** `False`  
> **Default value:** `0`  

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


Outputs a resulting signal of the same type as the input signal 
where every value is rounded to the specific precision.

The precision is specified as the number of decimal places to 
include in the result.

## Examples

The value `1234.567` will be rounded to the following values 
given a certain precision:

* Precision `0`: `1235` *(This is the default precision).*
* Precision `1`: `1234.6`
* Precision `2`: `1234.57`
* Precision `3`: `1234.567`


---

### `sort`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`

**Options**
>
> #### `order`
>
> **Type:** `String`  
> **Required:** `False`  
> **Allowed values:** `asc | desc`  
> **Default value:** `asc`  

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


Sorts the input in the specified order. By default, the values are sorted
in ascending order. The order can be changed by setting the `order`
property to `desc`.

---

### `sqrt`

**Inputs**
>
> 1. `Scalar | Series | Event | Number`
>

**Output:** `Scalar | Series | Event | Number`


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


Computes the square root of the input signal.

---

