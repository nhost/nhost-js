<p align="center">
  <a href="https://www.nhost.io/">
    <img alt="Nhost" src="https://raw.githubusercontent.com/nhost/nhost/main/assets/logo.png" width="237" />
  </a>
</p>
<h1 align="center">
  Nhost JavaScript SDK
</h1>

<h4 align="center">
  <a href="https://github.com/nhost/nhost-js">GitHub</a> |
  <a href="https://www.nhost.io/">Website</a> |
  <a href="https://www.nhost.io/blog">Blog</a> |
  <a href="https://www.linkedin.com/company/nhost">LinkedIn</a> |
  <a href="https://twitter.com/nhostio">Twitter</a> |
  <a href="https://docs.nhost.io/reference/sdk">Documentation</a> 
</h4>

<p align="center">
  <a href="https://github.com/nhost/nhost-js/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <!-- TODO Link to GitHub action or any CI/CD pipeline -->
  <a href="https://github.com/nhost/nhost-js/blob/main/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
  <a href="https://discord.gg/9V7Qb2U">
   <img src="https://img.shields.io/discord/552499021260914688?label=Discord&logo=Discord&colorB=7289da" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=nhostio">
    <img src="https://img.shields.io/twitter/follow/nhostio.svg?label=Follow%20@nhostio" alt="Follow @nhostio" />
  </a>
</p>

---

See the [reference documentation](https://docs.nhost.io/reference/sdk)

## 🚀 Quickstart

1. **Install the SDK**

   ```bash
   # Using NPM
   npm install @nhost/nhost-js

   # Using Yarn
   yarn add @nhost/nhost-js
   ```

2. Import and initialize a single nhost instance in your code:

   ```js
   import { NhostClient } from '@nhost/nhost-js'

   const nhost = new NhostClient({
     backendUrl: '<nhost-backend-url>'
   })
   ```

<!-- ## ⭐️ Features

The SDK comes with the following features:

- **name**: one-sentence description of the feature
- **name**: one-sentence description of the feature -->

## Contribution

Nhost tools are and will remain open-source and open to contributions. Whether its fixing bugs,
improving our documentation or simply spreading the word, please feel free to join in.

Please check [our contribution guide](https://github.com/nhost/nhost-js/blob/main/CONTRIBUTING.md)
for further details about how to contribute.

## Repository structure

The Nhost-js repository is a mono-repository managed using PNpm and Turborepo. It allows us to have
all Nhost packages in one place, and still distribute them as separate NPM packages.

## Licensed

Licensed under the [MIT License](https://github.com/nhost/nhost-js/blob/main/LICENSE)

## Thank you!
