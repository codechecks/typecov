<p align="center">
  <img src="./meta/check.png" width="700" alt="codechecks.io">
  <h3 align="center">TypeCov</h3>
  <p align="center">Track missing type coverage in TypeScript projects to ensure type safety</p>

  <p align="center">
    <a href="https://circleci.com/gh/codechecks/typecov"><img alt="Build Status" src="https://circleci.com/gh/codechecks/typecov/tree/master.svg?style=svg"></a>
    <a href="/package.json"><img alt="Software License" src="https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square"></a>
    <a href="https://codechecks.io"><img src="https://raw.githubusercontent.com/codechecks/docs/master/images/badges/badge-default.svg?sanitize=true" alt="codechecks.io" /></a>
  </p>
</p>

## Features

👉 track type coverage defined as `the count of symbols whose type is not any / the total count of symbols`<br>
👉 display type coverage directly in GitHub<br>
👉 set minimal type coverage and automatically fail PRs<br>
👉 supports monorepos<br>

## Motivation

Despite using `--strict` mode in tsconfig you can still have `any`s in your codebase. This tool gives you a good overview if PR that you are going to merge increases or decreases overall type coverage and where exactly types should be improved.

## Install

```sh
npm install --save-dev typecov
```

## Usage

TypeCov is built on [CodeChecks.io](https://codechecks.io) - open source code review automation platform.

Are you new to codechecks? Check out [getting started guide (it's simple)](https://github.com/codechecks/docs/blob/master/getting-started.md)!

Install package and then add to your `codechecks.yml` file:

```yml
checks:
  - name: typecov
    options:
      # atLeast: 99
      # name: webapp
      # tsconfigPath: ./tsconfig.prod.json
```

Under the hood it uses [type-coverage](https://github.com/plantain-00/type-coverage) package.

## API

### typecov(options: Options): Promise\<void>

#### options

```typescript
interface Options {
  name?: string; // will be added to check name
  tsconfigPath?: string; //defaults to tsconfig.json
  atLeast?: number;
  ignoreFiles?: string[];
  ignoreCatch?: boolean;
  strict?: boolean;
}
```

##### name

optional `string`<br>
Defaults: `Type Coverage`<br>
Specify the name for check. Might be useful in monorepos.

##### tsconfigPath

optional `string`<br>
Default: `tsconfig.json`<br>
Path to typescript project configuration

##### atLeast

optional `number`<br>
Defaults: `undefined`<br>
Example: `atLeast: 99`<br>
Fail if coverage rate < this value.

##### ignoreFiles

optional `string[]`<br>
Defaults: `undefined`<br>
Specify the ignored for checks files.
See [type-coverage's description](https://github.com/plantain-00/type-coverage#ignore-files) for the reference.

##### ignoreCatch

optional `string`<br>
Defaults: `undefined`<br>
See [type-coverage's description](https://github.com/plantain-00/type-coverage#ignore-catch) for the reference.

##### strict

optional `string`<br>
Defaults: `undefined`<br>
See [type-coverage's description](https://github.com/plantain-00/type-coverage#strict-mode) for the reference.

## Contributing

All contributions are welcomed. Read more in [CONTRIBUTING.md](./CONTRIBUTING.md)

## Licence

MIT @ [codechecks.io](https://codechecks.io)
