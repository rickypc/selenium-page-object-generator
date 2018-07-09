<a target="_blank" href="https://chrome.google.com/webstore/detail/epgmnmcjdhapiojbohkkemlfkegmbebb">![Install from Chrome Web Store](/images/chrome-web-store.png "Click here to install this extension from the Chrome Web Store")</a>
<a target="_blank" href="https://addons.opera.com/en/extensions/details/selenium-page-object-generator">![Install from Opera Addons Catalog](/images/opera-addons-catalog.png "Click here to install this extension from the Opera Addons Catalog")</a>


Selenium Page Object Generator
==============================

A nimble and flexible [Selenium Page Object Model](https://code.google.com/p/selenium/wiki/PageObjects) generator to improve [agile testing](https://en.wikipedia.org/wiki/Agile_testing) [process velocity](https://en.wikipedia.org/wiki/Velocity_(software_development)).

Selenium Page Object Generator is an essential tool to improve your workflow. It will generate [Page Object Model](http://martinfowler.com/bliki/PageObject.html) on active [Chrome](https://www.google.com/chrome/browser/desktop/index.html) or [Opera](http://www.opera.com/) tab with a single click, provided that all of the options and template are configured. The generated Page Object Model will be saved to pre-configured Chrome or Opera download folder.

Selenium Page Object Generator is also available in command line by installing [Node.JS](https://nodejs.org/en/) package from [NPM Registry](https://www.npmjs.com/package/selenium-page-object-generator).

The template is using [Handlebars.js](http://handlebarsjs.com/) expression, a clean logic-less semantic templating language.

This is an early BETA release, it expected to have rough edges, and limited functionality. It currently support 3 different targets: [Java](https://en.wikipedia.org/wiki/Java_(programming_language)), [C#](https://en.wikipedia.org/wiki/C_Sharp_(programming_language)), [Ruby](https://en.wikipedia.org/wiki/Ruby_(programming_language)) and [Robot Framework](http://robotframework.org/).

For more information on how to use the generated Page Object file:

Java: [https://code.google.com/p/selenium/wiki/PageFactory#The](https://code.google.com/p/selenium/wiki/PageFactory#The)

C#: [http://relevantcodes.com/pageobjects-and-pagefactory-design-patterns-in-selenium/#post-5229](http://relevantcodes.com/pageobjects-and-pagefactory-design-patterns-in-selenium/#post-5229)

Robot Framework: [http://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html#taking-resource-files-into-use](http://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html#taking-resource-files-into-use)

Ruby: [https://github.com/cheezy/page-object](https://github.com/cheezy/page-object)

(You need to use Chrome 40+ or Opera 15+ or Node.JS 5.x to try this out)

Installation
-

- To install the newest released version on Chrome browser, please download it from [Chrome web store](https://chrome.google.com/webstore/detail/epgmnmcjdhapiojbohkkemlfkegmbebb).
- To install the newest released version on Opera browser, please download it from [Opera addons catalog](https://addons.opera.com/en/extensions/details/selenium-page-object-generator).
- To install the newest released version on command line, please install [Node.js](https://nodejs.org/) and run command below:

```bash
$ npm install selenium-page-object-generator
```

Command Line Usage
-
Selenium Page Object Generator accepts the following command line arguments:

```bash
selenium-page-object-generator [options]

  -h, --help                                 Show this help message and exit.
  -v, --version                              Show program's version number and exit.
  -t, --target {cs,java,robot, rb}           Generator target
  -n, --name [PageName]                      Page name (no-spaces)
  -d, --destination [DestinationPageName]    Destination page name (no-spaces) (optional)
  -s, --source [source.html]                 Source file
```

Examples
-
To generate Java page object:

```bash
$ node_modules/.bin/selenium-page-object-generator -t java -n MySite -s source.html
```

Development Dependencies
-
You will need to install [Node.js](https://nodejs.org/) as a local development dependency. The `npm` package manager comes bundled with all recent releases of `Node.js`.

`npm install` will attempt to resolve any `npm` module dependencies that have been declared in the project’s `package.json` file, installing them into the `node_modules` folder.

```bash
$ npm install
```

Development
-
To build the sources into corresponding packages, run:

```bash
$ npm run build
```

The `/build` folder and `/dist` folder are created. All built files are placed in the `build` folder, and the distribution ready packages are placed in `dist` folder.

Run Unit Tests
-
To make sure we did not break anything, let's run:

```bash
$ npm test
```

Distribution
-
Once the changes are in-place and ready for distribution, update `package.json` with new version, and run:

```bash
$ npm run build
```

The `/dist` folder will contain distribution ready packages.

Contributing
-
If you would like to contribute code to Selenium Page Object Generator project you can do so through GitHub by forking the repository and sending a pull request.

When submitting code, please make every effort to follow existing conventions and style in order to keep the code as readable as possible. Please also include appropriate test cases.

Before your code can be accepted into the project you must also sign the [Selenium Page Object Generator CLA](https://goo.gl/forms/Bax4dq33Q7) (Individual Contributor License Agreement).

That's it! Thank you for your contribution!

License
-
Copyright (c) 2015, 2016, 2018 Richard Huang.

This browser extension is free software, licensed under: [GNU Affero General Public License (AGPL-3.0)](http://www.gnu.org/licenses/agpl-3.0.en.html).

Documentation and other similar content are provided under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).

Licenses and Acknowledgements for Incorporated Software
-

- [Handlebars](http://handlebarsjs.com/) is an [open source](http://opensource.org) software provided under [MIT license](http://opensource.org/licenses/MIT).
- [jQuery](https://jquery.com/) is an [open source](http://opensource.org) software provided under [MIT license](http://opensource.org/licenses/MIT).

Screenshot
-
![screenshot](/images/screenshot-opera-1.png)
