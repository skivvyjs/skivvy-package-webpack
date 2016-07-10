# Skivvy package: `webpack`

[![npm version](https://img.shields.io/npm/v/@skivvy/skivvy-package-webpack.svg)](https://www.npmjs.com/package/@skivvy/skivvy-package-webpack)
![Stability](https://img.shields.io/badge/stability-stable-brightgreen.svg)
[![Build Status](https://travis-ci.org/skivvyjs/skivvy-package-webpack.svg?branch=master)](https://travis-ci.org/skivvyjs/skivvy-package-webpack)

> Compile JavaScript using webpack


## Installation

```bash
skivvy install webpack
```


## Overview

This package allows you to compile JavaScript using webpack from within the [Skivvy](https://www.npmjs.com/package/skivvy) task runner.


## Included tasks

### `webpack`

Compile JavaScript using webpack

#### Usage:

```bash
skivvy run webpack
```


#### Configuration settings:

The `webpack` task accepts all the standard [webpack configuration settings](http://webpack.github.io/docs/configuration.html), plus the following additional settings:

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| `watch` | `boolean` | No | `false` | Watch files for changes |
| `config` | `string` | No | `null` | Path to external `webpack.config.js` |

> N.B. Any additional task settings will override the corresponding values in the `webpack.config.js` file.
