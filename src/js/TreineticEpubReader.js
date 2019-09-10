define([
    "readium_shared_js/globals",
    "./ModuleConfig",
    'jquery',
    './Spinner',
    "Settings",
    './TOCJsonCreator',
    './ExternalControls',
    './TreineticHelpers',
    "./ReaderSettingsDialog",
    "./Keyboard",
    './gestures',
    'readium_js/Readium',
    "readium_shared_js/helpers",
    'readium_shared_js/models/bookmark_data',
], function (
    Globals,
    moduleConfig,
    $,
    spinner,
    Settings,
    TOCJsonCreator,
    ExternalControls,
    TreineticHelpers,
    SettingsDialog,
    Keyboard,
    GesturesHandler,
    Readium,
    Helpers,
    BookmarkData,
) {

    var KEYS = {
        READER_STORAGE_KEY: "reader"
    };

    var ebookURL_filepath = null;
    var readium = null;
    var gesturesHandler = null;
    var currentPackageDocument;
    var wasFixed;


    function init(data) {
        setUserKeyboardPreferences();
        Keyboard.scope('reader');
        ebookURL_filepath = getEpubURLFilePath(data.epub);
        unsubscribeFromReaderEvents();
        setTimeout(function () {
            initReader("#epub-reader-frame", data);
        }, 0);
        return ExternalControls.getInstance();
    }

    function initReader(reader_frame_element, data) {
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

        var openPageRequest = getOpenPageRequest(settings, ebookURL_filepath);
        var urlParams = Helpers.getURLQueryParams();
        var goto = urlParams['goto'];
        openPageRequest = goto ? getPageUrlWithSavedParams(goto) : openPageRequest;
        readium = new Readium(readiumOptions, readerOptions);
        window.READIUM = readium;
        loadPluginsWithReadiumSDK(readerOptions);
        setupKeyEvents(data);

        var readerSettings = {syntheticSpread: "auto", scroll: "auto"};
        if (!data.embedded) {
            readerSettings = settings.reader || SettingsDialog.defaultSettings;
        }
        handleReaderEvents();
        TreineticHelpers.updateReader(readium.reader, readerSettings);
        loadEpub(readerSettings, data.epub, openPageRequest);

    }

    var loadEpub = function (readerSettings, ebookURL, openPageRequest) {
        readium.openPackageDocument(ebookURL, function (packageDocument, options) {
            if (!packageDocument) {
                console.error("ERROR OPENING EBOOK: " + ebookURL_filepath);
                spin(false);
                ExternalControls.getInstance().epubFailed("epubfailed");
                return;
            }
            currentPackageDocument = packageDocument;
            currentPackageDocument.generateTocListDOM(function (dom) {
                var tocjson = TOCJsonCreator.createTOCJson(TOCJsonCreator.getFixedTocElement(dom));
                ExternalControls.getInstance().onTOCLoad(tocjson);
            });
            wasFixed = readium.reader.isCurrentViewFixedLayout();

            ExternalControls.getInstance().epubLoaded(options.metadata, packageDocument, readium.reader);
            ExternalControls.getInstance().registerChannel(function (message) {
                if (message === "BOOKMARK_CURRENT_PAGE") {
                    savePlace();
                }
            });

        }, openPageRequest);
    };

    var handleReaderEvents = function () {
        readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOAD_START, function ($iframe, spineItem) {
            Globals.logEvent("CONTENT_DOCUMENT_LOAD_START", "ON", "EpubReader.js [ " + spineItem.href + " ]");
            spin(true);
            if (ExternalControls.getInstance().isAutoBookmark()) {
                savePlace();
            }
        });

        readium.reader.on(ReadiumSDK.Events.FXL_VIEW_RESIZED, function () {
            Globals.logEvent("FXL_VIEW_RESIZED", "ON", "EpubReader.js");
            setScaleDisplay(); //TODO find what this is
        });

        readium.reader.on(ReadiumSDK.Events.CONTENT_DOCUMENT_LOADED, function ($iframe, spineItem) {

        });

        readium.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData) {
            Globals.logEvent("PAGINATION_CHANGED", "ON", "EpubReader.js");

            if (ExternalControls.getInstance().isAutoBookmark()) {
                savePlace();
            }
            spin(false);
        });
    };

    var setupKeyEvents = function (data) {
        readium.reader.addIFrameEventListener('keydown', function (e) {
            Keyboard.dispatch(document.documentElement, e.originalEvent);
        });

        readium.reader.addIFrameEventListener('keyup', function (e) {
            Keyboard.dispatch(document.documentElement, e.originalEvent);
        });

        readium.reader.addIFrameEventListener('focus', function (e) {
            $('#reading-area').addClass("contentFocus");
            $(window).trigger("focus");
        });

        readium.reader.addIFrameEventListener('blur', function (e) {
            $('#reading-area').removeClass("contentFocus");
        });
        Keyboard.on(Keyboard.NightTheme, 'reader', function () {
            if (!data.embedded) {
                Settings.get('reader', function (json) {
                    json = !json ? {} : json;
                    var isNight = json.theme === "night-theme";
                    json.theme = isNight ? "author-theme" : "night-theme";
                    Settings.put('reader', json);
                    TreineticHelpers.updateReader(readium.reader, json);
                });
            }
        });

        //use these if you want to show hide keyboard based on the keyboard key events, for now I'll keep it empty
        Keyboard.on(Keyboard.ToolbarHide, 'reader', function () {
        });
        Keyboard.on(Keyboard.ToolbarShow, 'reader', function () {
        });

        Keyboard.on(Keyboard.PagePrevious, 'reader', function () {
            if (!isWithinForbiddenNavKeysArea()) prevPage();
        });

        Keyboard.on(Keyboard.PagePreviousAlt, 'reader', prevPage);

        Keyboard.on(Keyboard.PageNextAlt, 'reader', nextPage);

        Keyboard.on(Keyboard.PageNext, 'reader', function () {
            if (!isWithinForbiddenNavKeysArea()) nextPage();
        });

        var setTocSize = function () {
            var height = ExternalControls.getInstance().getReaderHeight();
            if(height){
                $('#app-container').height(height);
            }else{
                if($('#app-container').length > 0){
                    var appHeight = $(document.body).height() - $('#app-container')[0].offsetTop;
                    $('#app-container').height(appHeight);
                }
            }
        };

        $(window).on('resize', setTocSize);
        setTocSize();
    };


    var nextPage = function () {
        if (readium.reader && readium.reader.getPaginationInfo().canGoRight()) {
            readium.reader.openPageRight();
        }
    };

    var prevPage = function () {
        if (readium.reader && readium.reader.getPaginationInfo().canGoPrev()) {
            readium.reader.openPageLeft();
        }
    };

    //TODO CHECK HOW PLUGINS WORK
    var loadPluginsWithReadiumSDK = function (readerOptions) {
        ReadiumSDK.on(ReadiumSDK.Events.PLUGINS_LOADED, function () {
            Globals.logEvent("PLUGINS_LOADED", "ON", "EpubReader.js");

            if (!readium.reader.plugins.highlights) {
                $('.icon-annotations').css("display", "none");
            } else {
                readium.reader.plugins.highlights.initialize({
                    annotationCSSUrl: readerOptions.annotationCSSUrl
                });
                readium.reader.plugins.highlights.on("annotationClicked", function (type, idref, cfi, id) {
                    readium.reader.plugins.highlights.removeHighlight(id);
                });
            }

            if (readium.reader.plugins.hypothesis) {
                // Respond to requests for UI controls to make space for the Hypothesis sidebar
                readium.reader.plugins.hypothesis.on("offsetPageButton", function (offset) {
                    if (offset === 0) {
                        $('#right-page-btn').css('right', offset);
                    } else {
                        $('#right-page-btn').css('right', offset - $('#right-page-btn').width()); // 40px
                    }
                });
                readium.reader.plugins.hypothesis.on("offsetNavBar", function (offset) {
                    $('#app-navbar').css('margin-right', offset);
                    $('#reading-area').css('right', offset); // epub-reader-container
                });
            }
        });

        gesturesHandler = new GesturesHandler(readium.reader, readerOptions.el);
        gesturesHandler.initialize();
    };

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

    var getOpenPageRequest = function (settings, ebookURL_filepath) {
        if (settings[ebookURL_filepath]) {
            // JSON.parse() *first* because Settings.getMultiple() returns raw string values from the key/value store (unlike Settings.get())
            var bookmark = JSON.parse(settings[ebookURL_filepath]);
            // JSON.parse() a *second time* because the stored value is readium.reader.bookmarkCurrentPage(), which is JSON.toString'ed
            bookmark = JSON.parse(bookmark);
            if (bookmark && bookmark.idref) {
                return {idref: bookmark.idref, elementCfi: bookmark.contentCFI};
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

    var savePlace = function () {
        var bookmarkString = readium.reader.bookmarkCurrentPage();
        Settings.put(ebookURL_filepath, bookmarkString, $.noop);
        if (window.history && window.history.replaceState) {

            var urlParams = Helpers.getURLQueryParams();
            var ebookURL = urlParams['epub'];
            if (!ebookURL) return;

            ebookURL = ensureUrlIsRelativeToApp(ebookURL);
            var bookmark = JSON.parse(bookmarkString) || {};
            var epubs = urlParams['epubs'];

            var gotoParam = generateQueryParamCFI(bookmark);

            var url = Helpers.buildUrlQueryParameters(undefined, {
                epub: ebookURL,
                epubs: (epubs ? epubs : " "),
                embedded: " ",
                goto: {value: gotoParam ? gotoParam : " ", verbatim: true}
            });

            history.replaceState(
                {epub: ebookURL, epubs: (epubs ? epubs : undefined)},
                "Readium Viewer",
                url
            );
        }
    };

    var ensureUrlIsRelativeToApp = function (ebookURL) {

        if (!ebookURL || (ebookURL.indexOf("http") !== 0)) {
            return ebookURL;
        }

        var isHTTPS = (ebookURL.indexOf("https") === 0);

        var CORS_PROXY_HTTP_TOKEN = "/http://";
        var CORS_PROXY_HTTPS_TOKEN = "/https://";

        // Ensures URLs like http://crossorigin.me/http://domain.com/etc
        // do not end-up loosing the double forward slash in http://domain.com
        // (because of URI.absoluteTo() path normalisation)
        var CORS_PROXY_HTTP_TOKEN_ESCAPED = "/http%3A%2F%2F";
        var CORS_PROXY_HTTPS_TOKEN_ESCAPED = "/https%3A%2F%2F";

        // case-insensitive regexp for percent-escapes
        var regex_CORS_PROXY_HTTPs_TOKEN_ESCAPED = new RegExp("/(http[s]?):%2F%2F", "gi");

        var appUrl =
            window.location ? (
                window.location.protocol
                + "//"
                + window.location.hostname
                + (window.location.port ? (':' + window.location.port) : '')
                + window.location.pathname
            ) : undefined;

        if (appUrl) {
            console.log("EPUB URL absolute: " + ebookURL);
            console.log("App URL: " + appUrl);

            ebookURL = ebookURL.replace(CORS_PROXY_HTTP_TOKEN, CORS_PROXY_HTTP_TOKEN_ESCAPED);
            ebookURL = ebookURL.replace(CORS_PROXY_HTTPS_TOKEN, CORS_PROXY_HTTPS_TOKEN_ESCAPED);
            ebookURL = new URI(ebookURL).relativeTo(appUrl).toString();

            if (ebookURL.indexOf("//") === 0) { // URI.relativeTo() sometimes returns "//domain.com/path" without the protocol
                ebookURL = (isHTTPS ? "https:" : "http:") + ebookURL;
            }

            ebookURL = ebookURL.replace(regex_CORS_PROXY_HTTPs_TOKEN_ESCAPED, "/$1://");
            console.log("EPUB URL relative to app: " + ebookURL);
        }

        return ebookURL;
    };

    var generateQueryParamCFI = function (bookmark) {
        if (!bookmark.idref) {
            return;
        }

        var contentCFI = !bookmark.contentCFI ? "/0" : bookmark.contentCFI;
        var spineItemPackageCFI = readium.reader.spine().getItemById(bookmark.idref).cfi;
        var completeCFI = 'epubcfi(' + spineItemPackageCFI + contentCFI + ')';

        // encodeURI is used instead of encodeURIComponent to not excessively encode all characters
        // characters '/', '!', '@', and ':' are allowed in the query component of a URI as per RFC 3986 section 3.4
        return encodeURI(completeCFI);
    };

    var isWithinForbiddenNavKeysArea = function () {
        return document.activeElement &&
            (
                document.activeElement === document.getElementById('volume-range-slider')
                || document.activeElement === document.getElementById('time-range-slider')
                || document.activeElement === document.getElementById('rate-range-slider')
                || jQuery.contains(document.getElementById("mo-sync-form"), document.activeElement)
                || jQuery.contains(document.getElementById("mo-highlighters"), document.activeElement)
            );
    };

    //TODO SET THE SPINNER IN A WAY THAT IT CAN BE CHANGED DYANMICALLY
    var spin = function (on) {
        if (on) {
            //console.error("do SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
            if (spinner.willSpin || spinner.isSpinning) return;

            spinner.willSpin = true;

            setTimeout(function () {
                if (spinner.stopRequested) {
                    //console.debug("STOP REQUEST: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                    spinner.willSpin = false;
                    spinner.stopRequested = false;
                    return;
                }
                //console.debug("SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.isSpinning = true;
                spinner.spin($('#reading-area')[0]);

                spinner.willSpin = false;

            }, 100);
        } else {

            if (spinner.isSpinning) {
//console.debug("!! SPIN: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.stop();
                spinner.isSpinning = false;
            } else if (spinner.willSpin) {
//console.debug("!! SPIN REQ: -- WILL: " + spinner.willSpin + " IS:" + spinner.isSpinning + " STOP REQ:" + spinner.stopRequested);
                spinner.stopRequested = true;
            }
        }
    };


    return {
        loadUI: init,
        handler: function () {
            return ExternalControls.getInstance();
        },
        config: function () {
            return moduleConfig;
        },
        ensureUrlIsRelativeToApp: ensureUrlIsRelativeToApp
    }

});
