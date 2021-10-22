<h1 align="center">@nhost/nhost-js</h1>
<h2 align="center">Nhost JavaScript SDK</h2>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.2.1-blue.svg?cacheSeconds=2592000" />
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="license: MIT" />
  </a>
  <a href="https://commitizen.github.io/cz-cli">
    <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="commitizen: friendly" />
  </a>
  <a href="https://prettier.io">
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="code style: prettier" />
  </a>
</p>

## Get Started

### Install

```
npm install @nhost/nhost-js
# or yarn
yarn add @nhost/nhost-js
```

### Initialize

```js
import { NhostClient } from '@nhost/nhost-js';

const nhost = new NhostClient({
  backendUrl: 'https://xxx.nhost.run',
});
```

## Features

### GraphQL

Access Nhost Auth methods using `nhost.graphql`.

### Authentication

Access Nhost Auth methods using `nhost.auth`.

### Storage

Access Nhost Storage methods using `nhost.storage`.

### Functions

Access Nhost Functions methods via `nhost.functions`.

## Documentation

[Coming soon](https://docs.nhost.io)
