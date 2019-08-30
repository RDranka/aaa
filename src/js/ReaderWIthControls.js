define([
    "readium_shared_js/globals",
    "./ModuleConfig",
    "Settings",
    "./ReaderSettingsDialog",
    "./Keyboard",
    "readium_shared_js/helpers"
], function (
    Globals,
    moduleConfig,
    Settings,
    SettingsDialog,
    Keyboard,
    Helpers
) {

    var KEYS = {
        READER_STORAGE_KEY: "reader"
    };

    var ebookURL_filepath = null;
    var embedded = null;
    var readium = null;

    function init(data) {
        setUserKeyboardPreferences();
        Keyboard.scope('reader');
        ebookURL_filepath = getEpubURLFilePath(data.epub);
        embedded = data.embedded;
        unsubscribeFromReaderEvents();
        initReader("#epub-reader-frame");
    }

    function initReader(reader_frame_element) {
        var settings = setReaderPreferences();

        var readerOptions = {
            el: reader_frame_element,
            annotationCSSUrl: moduleConfig.annotationCSSUrl,
            mathJaxUrl: moduleConfig.mathJaxUrl,
            fonts: moduleConfig.fonts
        };

        var readiumOptions = {
            jsLibRoot: moduleConfig.jsLibRoot,
            openBookOptions: {}
        };

        if (moduleConfig.useSimpleLoader) {
            readiumOptions.useSimpleLoader = true;
        }

        var openPageRequest = getOpenPageRequest(settings,ebookURL_filepath);
        var urlParams = Helpers.getURLQueryParams();
        var goto = urlParams['goto'];
        openPageRequest = goto ? getPageUrlWithSavedParams(goto) : openPageRequest;
        readium = new Readium(readiumOptions, readerOptions);
        window.READIUM = readium;
    }
    
    var loadPluginsWithReadiumSDK = function () {
        
    }

    var getPageUrlWithSavedParams = function (goto) {
            console.log("Goto override? " + goto);
            try {
                var gotoObj;
                var openPageRequest_ = undefined;

                if (goto.match(/^epubcfi\(.*?\)$/)) {
                    var gotoCfiComponents = goto.slice(8, -1).split('!'); //unwrap and split at indirection step
                    gotoObj = {
                        spineItemCfi: gotoCfiComponents[0],
                        elementCfi: gotoCfiComponents[1]
                    };
                } else {
                    gotoObj = JSON.parse(goto);
                }

                // See ReaderView.openBook(
                // e.g. with accessible_epub_3:
                // &goto={"contentRefUrl":"ch02.xhtml%23_data_integrity","sourceFileHref":"EPUB"}
                // or: {"idref":"id-id2635343","elementCfi":"/4/2[building_a_better_epub]@0:10"} (the legacy spatial bookmark is wrong here, but this is fixed in intel-cfi-improvement feature branch)
                if (gotoObj.idref) {
                    if (gotoObj.spineItemPageIndex) {
                        openPageRequest_ = {
                            idref: gotoObj.idref,
                            spineItemPageIndex: gotoObj.spineItemPageIndex
                        };
                    } else if (gotoObj.elementCfi) {

                        _debugBookmarkData_goto = new BookmarkData(gotoObj.idref, gotoObj.elementCfi);

                        openPageRequest_ = {idref: gotoObj.idref, elementCfi: gotoObj.elementCfi};
                    } else {
                        openPageRequest_ = {idref: gotoObj.idref};
                    }
                } else if (gotoObj.contentRefUrl && gotoObj.sourceFileHref) {
                    openPageRequest_ = {
                        contentRefUrl: gotoObj.contentRefUrl,
                        sourceFileHref: gotoObj.sourceFileHref
                    };
                } else if (gotoObj.spineItemCfi) {
                    openPageRequest_ = {spineItemCfi: gotoObj.spineItemCfi, elementCfi: gotoObj.elementCfi};
                }

                if (openPageRequest_) {
                    return openPageRequest_;
                    console.debug("Open request (goto): " + JSON.stringify(openPageRequest));
                }
            } catch (err) {
                console.error(err);
            }
        return null;
    };

    var getOpenPageRequest = function (settings,ebookURL_filepath) {
        if (settings[ebookURL_filepath]) {
            // JSON.parse() *first* because Settings.getMultiple() returns raw string values from the key/value store (unlike Settings.get())
            var bookmark = JSON.parse(settings[ebookURL_filepath]);
            // JSON.parse() a *second time* because the stored value is readium.reader.bookmarkCurrentPage(), which is JSON.toString'ed
            bookmark = JSON.parse(bookmark);
            if (bookmark && bookmark.idref) {
                return  {idref: bookmark.idref, elementCfi: bookmark.contentCFI};
            }
        }
        return null;
    };

    var setUserKeyboardPreferences = function () {
        Settings.get(KEYS.READER_STORAGE_KEY, function (json) {
            Keyboard.applySettings(json);
        });
    };

    var setReaderPreferences = function () {
        var set = null;
        Settings.getMultiple(['reader', ebookURL_filepath], function (settings) {
            set = settings;
            // Note that unlike Settings.get(), Settings.getMultiple() returns raw string values (from the key/value store), not JSON.parse'd !
            // Ensures default settings are saved from the start (as the readium-js-viewer defaults can differ from the readium-shared-js).
            if (!settings.reader) {
                settings.reader = {};
            } else {
                settings.reader = JSON.parse(settings.reader);
            }
            /*
            We use the default settings in the SettingsDialog however we are not planning to use any other feature other than
            that
            * */
            for (var prop in SettingsDialog.defaultSettings) {
                if (SettingsDialog.defaultSettings.hasOwnProperty(prop)) {
                    if (!settings.reader.hasOwnProperty(prop) || (typeof settings.reader[prop] == "undefined")) {
                        settings.reader[prop] = SettingsDialog.defaultSettings[prop];
                    }
                }
            }
            // Note: automatically JSON.stringify's the passed value!
            Settings.put('reader', settings.reader);
        });
        return set; // getMultiple is not actually asynchronous so that is why I have done this;
    };

    var getEpubURLFilePath = function (ebookURL) {
        return Helpers.getEbookUrlFilePath(ebookURL);
    };

    var unsubscribeFromReaderEvents = function () {
        if (readium && readium.reader) {
            Globals.logEvent("__ALL__", "OFF", "ReaderWithControls.js");
            readium.reader.off();
        }
        if (window.ReadiumSDK) {
            Globals.logEvent("PLUGINS_LOADED", "OFF", "EReaderWithControls.js");
            ReadiumSDK.off(ReadiumSDK.Events.PLUGINS_LOADED);
        }
    };

    return {
        loadUI: init,
    }

});
