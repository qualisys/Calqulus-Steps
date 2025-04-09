# Changelog

All notable changes to this project will be documented in this file.

## [1.6.0] 2025-04-09

## Added

* Reading body mass from field or force plate. ([#68](https://github.com/qualisys/Calqulus-Steps/pull/68)) (!4190)
* Step for calculating the cumulative length of a curve ([#70](https://github.com/qualisys/Calqulus-Steps/pull/70))
* Handles different frame rates between markers and skeletons by upsampling the lower framerate signals to match. (!4205)

## [1.5.0] 2025-02-25

## Added

* Support for differing marker and skeleton frame rate. ([#66](https://github.com/qualisys/Calqulus-Steps/pull/66))

## [1.4.1] 2024-09-20

### Fixed

* Issue in `SequenceUtil.sequenceByFrameMap`. ([#57](https://github.com/qualisys/Calqulus-Steps/pull/57))

## [1.4.0] 2024-06-25

### Added

* Option to sort output in concatenate step. ([#52](https://github.com/qualisys/Calqulus-Steps/pull/52)) (!2863)

### Fixed

* Problem in applying force filter on a pipeline node. (!2805)
* Issue in `QuaternionSequence.ensureContinuity` method. ([#53](https://github.com/qualisys/Calqulus-Steps/pull/53))

### Changed

* Events are always sorted in JSON export. ([#52](https://github.com/qualisys/Calqulus-Steps/pull/52)) (!2863)

## [1.3.0] 2024-05-07

### Added

* Ability to access force plate data in pipelines. ([#47](https://github.com/qualisys/Calqulus-Steps/pull/47)) (!2706)

## [1.2.0] 2024-05-07

### Added

* Inverse dynamics support. ([#45](https://github.com/qualisys/Calqulus-Steps/pull/45))
 - Added support for joints. Segments now have a distalJoint and a proximalJoint.
 - Added various math functions.
 - Added class for calculating body segment parameters.
 - Documentation regarding available joint names.

## [1.1.2] 2024-02-27

### Added

* Documentation regarding new `export` property for parameters & events. ([#44](https://github.com/qualisys/Calqulus-Steps/pull/44))


## [1.1.1] 2024-02-15

### Fixed

* Regressions in `eventMask` and `count` steps. ([#43](https://github.com/qualisys/Calqulus-Steps/pull/43))

## [1.1.0] 2024-02-15

### Added

* New steps: `root`, `sqrt`, `cbrt`, and `power` (alias `pow`). ([#31](https://github.com/qualisys/Calqulus-Steps/pull/31))
* Analog data model. ([#39](https://github.com/qualisys/Calqulus-Steps/pull/39))
* Support for `include` and `exclude` options for `eventDuration` and `eventMask` steps. ([#37](https://github.com/qualisys/Calqulus-Steps/pull/37))
* Support for `exist` and `empty` functions in `if` step. ([#35](https://github.com/qualisys/Calqulus-Steps/pull/35))
* Allow more input data types (anything but signals with components) in `if` step. ([#35](https://github.com/qualisys/Calqulus-Steps/pull/35))
* Documentation regarding templates, measurement data, EMG. ([#35](https://github.com/qualisys/Calqulus-Steps/pull/35))

### Fixed

* Support spaces in signal names in `if` step. ([#35](https://github.com/qualisys/Calqulus-Steps/pull/35))
* Support field accessor syntax in `if` step. ([#35](https://github.com/qualisys/Calqulus-Steps/pull/35))
* Support dot notation syntax in `if` step. ([#34](https://github.com/qualisys/Calqulus-Steps/pull/34))
* Support for `include` and `exclude` options for `eventDuration` and `eventMask` steps. ([#37](https://github.com/qualisys/Calqulus-Steps/pull/37))
* Return scalar value when both operands are scalar in arithmetic steps. ([#32](https://github.com/qualisys/Calqulus-Steps/pull/32))

### Changed

* Changed syntax for field access to use semicolons instead of commas. (!2090)
* Do not stop processing due to empty/missing inputs in `if` step. ([#35](https://github.com/qualisys/Calqulus-Steps/pull/35))
* Defers checking the `then` and `else` option inputs until they are needed in `if` step. ([#35](https://github.com/qualisys/Calqulus-Steps/pull/35))
* Ensure that frames in `eventMask` step are not negative. ([#38](https://github.com/qualisys/Calqulus-Steps/pull/38))
* Ignore events that are outside of the measurement range in `eventMask` step. ([#40](https://github.com/qualisys/Calqulus-Steps/pull/40))
* More flexible handling of data types in `concat` step. ([#36](https://github.com/qualisys/Calqulus-Steps/pull/36))
* Automatically unpack number-like arrays for options. ([#33](https://github.com/qualisys/Calqulus-Steps/pull/33))

## [1.0.0] 2023-06-01

**Initial release. No changelog was kept up until v1.1.0.**
