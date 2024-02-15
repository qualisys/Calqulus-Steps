# Changelog

All notable changes to this project will be documented in this file.

## [1.1.1] 2024-02-15

### Fixed

* Regressions in `eventMask` and `count` steps.

## [1.1.0] 2024-02-15

### Added

* New steps: `root`, `sqrt`, `cbrt`, and `power` (alias `pow`). (#31)
* Analog data model. (#39)
* Support for `include` and `exclude` options for `eventDuration` and `eventMask` steps. (#37)
* Support for `exist` and `empty` functions in `if` step. (#35)
* Allow more input data types (anything but signals with components) in `if` step. (#35)
* Documentation regarding templates, measurement data, EMG. (#35)

### Fixed

* Support spaces in signal names in `if` step. (#35)
* Support field accessor syntax in `if` step. (#35)
* Support dot notation syntax in `if` step. (#34)
* Support for `include` and `exclude` options for `eventDuration` and `eventMask` steps. (#37)
* Return scalar value when both operands are scalar in arithmetic steps. (#32)

### Changed

* Do not stop processing due to empty/missing inputs in `if` step. (#35)
* Defers checking the `then` and `else` option inputs until they are needed in `if` step. (#35)
* Ensure that frames in `eventMask` step are not negative. (#38)
* Ignore events that are outside of the measurement range in `eventMask` step. (#40)
* More flexible handling of data types in `concat` step. (#36)
* Automatically unpack number-like arrays for options. (#33)

## [1.0.0] 2023-06-01

**Initial release. No changelog was kept up until v1.1.0.**
