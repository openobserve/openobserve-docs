---
title: Variables
description: Reference Synthetics variables as {{name}} in URLs and step values, and pick them from the suggestion list that opens when you type {{.
---

# Variables

Variables are reusable values you can reference as `{{name}}` anywhere a Synthetics check accepts one — the starting URL and the value of a `navigate`, `type`, `select`, or `press` step. When you type `{{` in one of these fields, a suggestion list opens offering every variable the check can resolve, and picking one inserts `{{NAME}}` at the caret with its stored spelling — so a case typo or a misremembered name cannot survive to run time.

## Where suggestions appear

The `{{` list is attached to the three inputs the check substitutes variables into:

| Field | Where |
|-------|-------|
| **Starting URL** | The browser test gate |
| **Starting URL** | **Configure > Details** |
| **Step value** | `navigate`, `type`, `select`, and `press` steps |

![TODO: screenshot of the variable suggestion list open under the Starting URL field, showing global and environment-scoped rows with a warning and a lock icon](images/placeholder.png)

## Using the list

Type `{{` to open the list. It filters case-insensitively as you keep typing, so `{{us` narrows to names beginning with `us`. Choosing a row splices `{{NAME}}` at the caret, replacing the open token and keeping everything else in the field untouched.

The list is keyboard-driven:

| Key | Action |
|-----|--------|
| **Up** / **Down** | Move the highlight, wrapping at either end |
| **Enter** / **Tab** | Insert the highlighted variable |
| **Escape** | Close the list |

Hovering a row moves the highlight. Moving the caret closes a stale list, so it never lingers where it no longer applies.

## Reading a row

Each row tells you where the variable comes from and whether it resolves for this check.

- **Scope** — a globe icon marks a global variable; an environments icon lists which environments define it.
- **Missing environments** — a warning icon appears when the name is not defined in one of the check's selected environments. Hover it to see which environments are missing.
- **Secret** — a lock icon marks a secret variable, whose value is masked in the UI.

![TODO: screenshot of the variable suggestion list open under a step value field in the journey step editor](images/placeholder.png)

Check-scoped variables are listed first, followed by the shared variables the check inherits.

## Resolution order

When a check-scoped variable and a shared variable share a name, the check-scoped one wins — and the list hides the overridden shared row, so what you see is what the run resolves.

The same suggestion list also powers the message field in the **LLM Playground**, so the two surfaces behave consistently.
