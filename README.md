# CodeCheck Type Coverage

Track missing type coverage to ensure type safety

## Installation

```
yarn add --dev codecheck-type-coverage
```

or

```
npm install --dev codecheck-type-coverage
```

## Usage

Add to your `codecheck.js` file:

```typescript
import { typeCoverage } from "codecheck-type-coverage";

export async function main() {
  await typeCoverage();

  // ...
}
```

## API

### typeCoverage(options: Options): Promise<void>

#### options

Type: `{ tsconfigPath?: string; }`

**tsconfigPath**

Default: `tsconfig.json`<br>
Description: Path to typescript project configuration
