qtools
======

Tools to manage AWS queues

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/qtools.svg)](https://npmjs.org/package/qtools)
[![Codecov](https://codecov.io/gh/theBenForce/qtools/branch/master/graph/badge.svg)](https://codecov.io/gh/theBenForce/qtools)
[![Downloads/week](https://img.shields.io/npm/dw/qtools.svg)](https://npmjs.org/package/qtools)
[![License](https://img.shields.io/npm/l/qtools.svg)](https://github.com/theBenForce/qtools/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g qtools
$ qtools COMMAND
running command...
$ qtools (-v|--version|version)
qtools/0.0.0 darwin-x64 node-v12.13.1
$ qtools --help [COMMAND]
USAGE
  $ qtools COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`qtools hello [FILE]`](#qtools-hello-file)
* [`qtools help [COMMAND]`](#qtools-help-command)

## `qtools hello [FILE]`

describe the command here

```
USAGE
  $ qtools hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ qtools hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/theBenForce/qtools/blob/v0.0.0/src/commands/hello.ts)_

## `qtools help [COMMAND]`

display help for qtools

```
USAGE
  $ qtools help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_
<!-- commandsstop -->
