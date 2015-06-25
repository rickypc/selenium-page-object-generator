<a target="_blank" href="https://chrome.google.com/webstore/detail/epgmnmcjdhapiojbohkkemlfkegmbebb">![Try it now in Chrome Web Store](/images/chrome-web-store.png "Click here to install this extension from the Chrome Web Store")</a>


Selenium Page Object Generator
==============================

A nimble and flexible Selenium Page Object Model generator to improve agile testing process velocity.

(You need to use Chrome 40+ to try this out)

Installation
-
To install the newest released version, please download it from [Chrome web store](https://chrome.google.com/webstore/detail/epgmnmcjdhapiojbohkkemlfkegmbebb).

Development
-
To build the sources into corresponding packages, run:

```bash
$ gulp
```

The `/build` folder and `/dist` folder are created. All built files are placed in the `build` folder, and the distribution ready packages are placed in `dist` folder.

Distribution
-
Once the changes are in-place and ready for distribution, update `package.json` with new version, and run:

```bash
$ gulp
```

The `/dist` folder will contain distribution ready packages.

Dependencies
-
You’ll need to install [Node.js](https://nodejs.org/) as a local development dependency. The `npm` package manager comes bundled with all recent releases of `Node.js`.

`npm install` will attempt to resolve any `npm` module dependencies that have been declared in the project’s `package.json` file, installing them into the `node_modules` folder.

```bash
$ npm install
```

License
-
Copyright (c) 2015 Richard Huang.

This browser extension is free software, licensed under: [GNU Affero General Public License (AGPL-3.0)](http://www.gnu.org/licenses/agpl-3.0.en.html).

Screenshot
![screenshot](/images/popup.png)
