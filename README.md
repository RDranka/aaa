# Treinetic-epub-reader

Treinetic-epub-reader is a fork of popular [readium-js-viewer](https://raw.githubusercontent.com/readium/readium-js-viewer) but customized and simplified the usage of the library. This project is an initiative of Treinetic (Pvt) Ltd, Sri Lanka. Contact us via www.treinetic.com and get your software product done by the experts.

<img src="https://drive.google.com/uc?export=view&id=1uuTSkMEc_wAPOSsumnWWC50YGD-2e81n" width="100%" />

## Usage

1. Install the library

```bash 
npm install @treinetic/treinetic-epub-reader --save
```
    
2. refer `css` and `js` lib in your html ( jquery is a must )

```html
<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<link rel="stylesheet" type="text/css" href="../node_modules/@treinetic/treinetic-epub-reader/dist/TreineticEpubReader.min.css">
<script type="text/javascript" src="../node_modules/@treinetic/treinetic-epub-reader/dist/TreineticEpubReader.min.js"></script>
```

3. create placeholder divs for the reader.

```html
<div id="epub-reader-frame"></div>
```

4. Javascript 
```javascript

//Register the reader events and get reader controller object ( note that these are just callbacks you can't treat them as events though )

var exControls = TreineticEpubReader.handler();
exControls.registerEvent("onEpubLoadSuccess", function () {

});

exControls.registerEvent("onEpubLoadFail", function () {

});

exControls.registerEvent("onTOCLoaded", function (hasTOC) {
    if (!hasTOC) {
       let toc =  exControls.getTOCJson();
    }
    // you can use following api calls after this
    /**
    exControls.hasNextPage()
    exControls.nextPage();
    exControls.hasPrevPage()
    exControls.prevPage();
    exControls.makeBookMark();
    exControls.changeFontSize(int);
    exControls.changeColumnMaxWidth(int);
    exControls.setTheme("theme-id-goes-here");
    exControls.setScrollMode("scroll-type-id-goes-here");
    exControls.setDisplayFormat("display-format-id-goes-here");

    extcontrols.getRecommendedFontSizeRange()
    extcontrols.getRecommendedColumnWidthRange()
    var list = extcontrols.getAvailableThemes();
    var list = extcontrols.getAvailableScrollModes();
    var list = extcontrols.getAvailableDisplayFormats();
    var settings = extcontrols.getCurrentReaderSettings();
    **/
});


// You can feed epub file as well as extracted path of the epub 
// if you are planning to use epub file directly make sure that worker js files inside `ZIPJS` the `dist` is copied outside to a accessible location.
// and set the root folder path of those files to 'jsLibRoot'  
var config = TreineticEpubReader.config();
config.jsLibRoot = "src/ZIPJS/";

TreineticEpubReader.create("#epub-reader-frame");
TreineticEpubReader.open("assets/epub/epub_1.epub");

To see a code sample open `sample` folder inside the `dist`
```

## License

**BSD-3-Clause** ( http://opensource.org/licenses/BSD-3-Clause )

See [license.txt](./license.txt).


## Development

### Git initialisation

* `git clone --recursive -b BRANCH_NAME https://github.com/Treinetic/TreineticEpubReader.git TreineticEpubReader` (replace "BRANCH_NAME" with e.g. "development")
* `cd TreineticEpubReader`
* `git submodule update --init --recursive` to ensure that the TreineticEpubReader chain of dependencies is initialised (readium-js, readium-shared-js)
* `git checkout BRANCH_NAME && git submodule foreach --recursive "git checkout BRANCH_NAME"` (or simply `cd` inside each repository / submodule, and manually enter the desired branch name: `git checkout BRANCH_NAME`) Git should automatically track the corresponding branch in the 'origin' remote.


Advanced usage (e.g. TravisCI) - the commands below automate the remote/origin tracking process (this requires a Bash-like shell):

* ``for remote in `git branch -r | grep -v \> | grep -v master`; do git branch --track ${remote#origin/} $remote; done`` to ensure that all Git 'origin' remotes are tracked by local branches.
* ``git checkout `git for-each-ref --format="%(refname:short) %(objectname)" 'refs/heads/' | grep $(git rev-parse HEAD) | cut -d " " -f 1` `` to ensure that Git checks-out actual branch names (as by default Git initializes submodules to match their registered Git SHA1 commit, but in detached HEAD state)

(repeat for each repository / submodule)


### Source tree preparation

* `npm run prepare:all` (to perform required preliminary tasks, like patching code before building)
 * OR: `yarn run prepare:yarn:all` (to use Yarn instead of NPM for node_module management)

Note that in some cases, administrator rights may be needed in order to install dependencies, because of NPM-related file access permissions (the console log would clearly show the error). Should this be the case, running `sudo npm run prepare:all` usually solves this.

Note that the above command executes the following:

* `npm install` (to download dependencies defined in `package.json` ... note that the `--production` option can be used to avoid downloading development dependencies, for example when testing only the pre-built `build-output` folder contents)
* `npm update` (to make sure that the dependency tree is up to date)
* + some additional HTTP requests to the GitHub API in order to check for upstream library updates (wherever Readium uses a forked codebase)


### Typical workflow

No RequireJS optimization:

* `npm run http` (to launch an http server. This automatically opens a web browser instance to the HTML files in the `dev` folder, choose `dev-sample.html` which do include only the reader view)
* Hack away! (e.g. source code in the `src/js` folder)
* Press F5 (refresh / reload) in the web browser

Or to use optimized Javascript bundles (single or multiple):

* `npm run build` (to update the RequireJS bundles in the build output folder)
* `npm run http:watch` (to launch an http server. This automatically opens a web browser instance to the HTML files in the `dev` folder, choose `index_RequireJS_single-bundle.html` or `index_RequireJS_multiple-bundles.html`, or the `*LITE.html` variants which do include only the reader view, not the ebook library view)
* `npm run http` (same as above, but without watching for file changes (no automatic rebuild))

And finally to update the distribution package.

* `npm run tr_build` 

Also note that the built-in local HTTP server functionality (`npm run http`) is primarily designed to serve the Readium application at development time in its "exploded" form (`dev`, `src`, `node_modules`, etc. folders). It is also possible to use any arbitrary HTTP server as long as the root folder is `readium-js-viewer` (so that the application assets ; CSS, images, fonts ; can be loaded relative to this base URL). Example with the built-in NodeJS server: `node node_modules/http-server/bin/http-server -a 127.0.0.1 -p 8080 -c-1 .`. Also note that the `127.0.0.1` IP address which is used by default when invoking the `npm run http` command can be set to `0.0.0.0` in order to automatically bind the HTTP server to the local LAN IP, making it possible to open the Readium app in a web browser from another machine on the network. Simply set the `RJS_HTTP_IP` environment variable to `0.0.0.0` (e.g. using `export RJS_HTTP_IP="0.0.0.0"` from the command line), or for a less permanent setting: `RJS_HTTP_IP="0.0.0.0" npm run http` (the environment variable only "lasts" for the lifespan of the NPM command).

Remark: a log of HTTP requests is preserved in `http_app-ebooks.log`. This file contains ANSI color escape codes, so although it can be read using a regular text editor, it can be rendered in its original format using the shell command: `cat http_app.log` (on OSX / Linux), or `sed "s,x,x,g" http_app-ebooks.log` (on Windows).


### HTTP CORS (separate domains / origins, app vs. ebooks)

By default, a single HTTP server is launched when using the `npm run http` task, or its "watch" and "nowatch" variants (usage described in the above "Typical workflow" section).
To launch separate local HTTP servers on two different domains (in order to test HTTP CORS cross-origin app vs. ebooks deployment architecture), simply invoke the equivalent tasks named with `http2` instead of `http`. For example: `npm run http2`. More information about real-world HTTP CORS is given in the "Cloud reader deployment" section below.

Remark: logs of HTTP requests are preserved in two separate files `http_app.log` and `http_ebooks.log`. They contains ANSI color escape codes, so although they can be read using a regular text editor, they can be rendered in their original format using the shell command: `cat http_app.log` (on OSX / Linux), or `sed "s,x,x,g" http_app.log` (on Windows).


### Forking

Assuming a fork of `https://github.com/Treinetic/TreineticEpubReader` is made under `USER` at `https://github.com/USER/TreineticEpubReader`, the `.gitmodules` file ( https://github.com/Treinetic/readium-js-viewer/blob/develop/.gitmodules ) will still point to the original submodule URL (at `Treinetic`, instead of `USER`). Thankfully, one can simply modify the `.gitmodules` file by replacing `https://github.com/Treinetic/` with `https://github.com/USER/`, and do this for every submodule (`readium-js-viewer` > `readium-js` > `readium-shared-js`). Then the Git command `git submodule sync` can be invoked, for each submodule.


### Plugins integration

When invoking the `npm run build` command, the generated `build-output` folder contains RequireJS module bundles that include the default plugins specified in `readium-js/readium-js-shared/plugins/plugins.cson` (see the plugins documentation https://github.com/readium/readium-shared-js/blob/develop/PLUGINS.md ). Developers can override the default plugins configuration by using an additional file called `plugins-override.cson`. This file is git-ignored (not persistent in the Git repository), which means that Readium's default plugins configuration is never at risk of being mistakenly overridden by developers, whilst giving developers the possibility of creating custom builds on their local machines.

For example, the `annotations` plugin can be activated by adding it to the `include` section in `readium-js/readium-js-shared/plugins/plugins-override.cson`.
Then, in order to create / remove highlighted selections, simply comment `display:none` for `.icon-annotations` in the `src/css/viewer.css` file (this will enable an additional toolbar button).


## RequireJS bundle optimisation

Note that by default, compiled RequireJS bundles are minified / mangled / uglify-ed. You can force the build process to generate non-compressed Javascript bundles by setting the `RJS_UGLY` environment variable to "no" or "false" (any other value means "yes" / "true").

This may come-in handy when testing / debugging the Chrome Extension (Packaged App) in "developer mode" directly from the `dist` folder (i.e. without the sourcemaps manually copied into the script folder).

## Tests

Mocha-driven UI tests via Selenium (not PhantomJS, but actual installed browsers accessed via WebDriver):

* `npm run test:firefox`
* `npm run test:chrome`
* `npm run test:chromeApp`

`npm run test` (runs all of the above)

PS: you may need to install the Chrome WebDriver from https://sites.google.com/a/chromium.org/chromedriver/downloads

Via SauceLabs:

* `npm run test:sauce:firefox`
* `npm run test:sauce:chrome`
* `npm run test:sauce:chromeApp`

`npm run test:sauce` (runs all of the above)

Travis (Continuous Integration) automatically uses a chromeApp and Firefox test matrix (2x modes), and uses SauceLabs to actually run the test. See https://travis-ci.org/readium/readium-js-viewer/
