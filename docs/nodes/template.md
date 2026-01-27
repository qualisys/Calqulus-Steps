# Template

A template node imports a separate Calqulus pipeline file into the current pipeline. This enables, for example, splitting a pipeline up into parts that can be reused in multiple pipelines, or to make the pipelines more readable.

Templates can be nested, i.e., a pipeline template can have references to other pipeline templates.

As all outputs from pipelines are globally accessible, you can access all the outputs from a pipeline template from its parent pipeline. You can also access all outputs from *outside the template* from *inside a template*. However, to improve readability, consider keeping references from a template pipeline to parent (or sibling) pipelines to a minimum.

A template can be optionally loaded depending on the conditions defined in the `where` option. Read more in the [Measurement filtering](../inputs-and-outputs.md#measurement-filtering) section of the Inputs and Outputs document.

## Template paths

You define the path to the template file as the main input to the `template` node, like so:

``` yaml
- template: templates/my-template.calqulus.yaml
```

### Relative paths
Normally, a path is relative to its parent pipeline file. Consider the following setup:

#### Example file structure
* `running/overground.calqulus.yaml`
* `running/templates/events.calqulus.yaml`
* `running/templates/foot-events.calqulus.yaml`

Your main pipeline is `running/overground.calqulus.yaml` and you want to use the template located at `running/templates/events.calqulus.yaml`, the template should be imported as such:

*In `running/overground.calqulus.yaml`:* 
``` yaml
- template: templates/events.calqulus.yaml
```

If this template is loading another template, the path should be entered relative to the parent template file. For example, if the template `running/templates/events.calqulus.yaml` is importing the template `running/templates/foot-events.calqulus.yaml`, the path is relative to the `events.calqulus.yaml` file:

*In `running/templates/foot-events.calqulus.yaml`:* 
``` yaml
- template: foot-events.calqulus.yaml
```

### Absolute paths
You can also reference a template relative to the main pipeline document by prepending the path with a forward slash `/`. This means that the path will be resolved relative to the path of the main pipeline file, no matter if the template is loaded within nested templates.

For example, considering the last example in the previous section, it can also be expressed as:

*In `running/templates/foot-events.calqulus.yaml`:* 
``` yaml
- template: /templates/foot-events.calqulus.yaml
```

_**Note:** You cannot traverse to a path above the main pipeline file, only to the same directory level or deeper. For example, if your main pipeline file is `running/overground.calqulus.yaml`, you cannot resolve a template in a directory higher up in the chain, such as `../my_template.calqulus.yaml` (a file in the parent directory of the `running` directory)_

## Options

### `where`

> **Type:** `Map`  
> **Required:** `False`  
> **Default value:** `null`

Filter for measurements where this node should be calculated. Read more in the [Measurement filtering](../inputs-and-outputs.md#measurement-filtering) section of the Inputs and Outputs document.

## Examples

`my-template.calqulus.yaml`
``` yaml
- template: templates/my-template.calqulus.yaml

- parameter: main_is_five
  steps:
    - add: [template_is_four, 1] # references a signal from a template.
```

`templates/my-template.calqulus.yaml`
``` yaml
- parameter: template_is_two
  steps: 
    - add: [1, 1]

- parameter: template_is_four
  steps: 
    - add: [template_is_two, template_also_two]

- parameter: template_also_two
  steps: 
    - import: template_is_two
```
