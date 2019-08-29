var readiumReader = null;

define(['./TOCJsonCreator', 'Settings'], function (TOCJsonCreator, Settings) {
    var externalcontrols = null;


    var ExternalControls = function () {
        this.metadata = null;
        this.reader = null;
        this.channel = null;
        this.auto_bookmark = true;
        this.TocJsonObject = null;
        this.currentPackageDocument = null;
        this.readerSettings = null;
    };

    ExternalControls.prototype.epubLoaded = function (metadata, currentPackageDocument, reader) {
        if (func_exists("onEpubLoadSuccess") && func_exists("onTOCLoaded")) {
            var self = this;
            this.metadata = metadata;
            this.reader = reader;
            this.currentPackageDocument = currentPackageDocument;
            this.readerSettings = getDefaultSettings(); // out of the box, first time reader settings

            //TODO REMOVE
            readiumReader = reader;

            Settings.get('reader', function (readerSettings) {
                var readerSettings = readerSettings || self.readerSettings;
                var newSettings = JSON.parse(JSON.stringify(getDefaultSettings()));
                for (var prop in readerSettings) {
                    if (readerSettings.hasOwnProperty(prop)) {
                        newSettings[prop] = readerSettings[prop];
                    }
                }
                self.readerSettings = newSettings;
                updateReader(self.reader, self.readerSettings);
            });


            currentPackageDocument.generateTocListDOM(function (dom) {
                self.TocJsonObject = TOCJsonCreator.createTOCJson(TOCJsonCreator.getFixedTocElement(dom));
                onTOCLoaded(self.hasTOC());
            });

            this.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData) {
                //this.paginationChangeInfo = pageChangeData;
            });

            onEpubLoadSuccess(externalcontrols);
        }
    };

    ExternalControls.prototype.epubFailed = function (error) {
        if (func_exists("onEpubLoadFail")) {
            onEpubLoadFail(error);
        }
    };

    ExternalControls.prototype.registerChannel = function (func) {
        this.channel = func;
    };


    /* ----------- RELATED TO PAGES NAVIGATION ----------- */
    ExternalControls.prototype.nextPage = function () {
        this.reader.openPageRight();
    };

    ExternalControls.prototype.prevPage = function () {
        this.reader.openPageLeft();
    };

    ExternalControls.prototype.hasNextPage = function () {
        return this.reader.getPaginationInfo().canGoRight();
    };

    ExternalControls.prototype.hasPrevPage = function () {
        return this.reader.getPaginationInfo().canGoPrev();
    };
    /* ----------- RELATED TO PAGES NAVIGATION END ----------- */


    /* ----------- RELATED BOOKMARK ----------- */
    ExternalControls.prototype.makeBookMark = function () {
        this.channel("BOOKMARK_CURRENT_PAGE");
    };

    ExternalControls.prototype.setAutoBookmark = function ($boolean) {
        this.auto_bookmark = $boolean;
    };

    ExternalControls.prototype.isAutoBookmark = function () {
        return this.auto_bookmark;
    };
    /* ----------- RELATED BOOKMARK END ----------- */


    /* ----------- RELATED TOC ----------- */
    ExternalControls.prototype.getTOCJson = function () {
        return JSON.stringify(this.TocJsonObject);
    };

    ExternalControls.prototype.hasTOC = function () {
        return (this.TocJsonObject != null);
    };

    ExternalControls.prototype.goToPage = function (href) {
        var tocUrl = this.currentPackageDocument.getToc();
        this.reader.openContentUrl(href, tocUrl, undefined);
    };
    /* ---------- RELATED TOC END -------- */

    /* ---------- RELATED TO SETTINGS ----- */

    ExternalControls.prototype.changeFontSize = function (size) {
        this.readerSettings = cloneUpdate(this.readerSettings, "fontSize", size);
        updateReader(this.reader, this.readerSettings);
    };

    ExternalControls.prototype.getRecommendedFontSizeRange = function () {
        return {min: 60, max: 170}
    };

    ExternalControls.prototype.getAvailableThemes = function () {
        return [
            {name: "Author Style", id: "author-theme"},
            {name: "Black & White", id: "default-theme"},
            {name: "Night Mode", id: "night-theme"},
            {name: "Old Theame", id: "parchment-theme"},
            {name: "Blue Theme", id: "ballard-theme"},
            {name: "Vancouver Theme", id: "vancouver-theme"}
        ]
    };

    ExternalControls.prototype.setTheme = function (theme_id) {
        this.readerSettings = cloneUpdate(this.readerSettings, "theme", theme_id);
        updateReader(this.reader, this.readerSettings);
    };

    ExternalControls.prototype.getAvailableScrollOptions = function () {
        return [
            {name: "Automatic", id: "auto"},
            {name: "Scroll Document", id: "scroll-doc"},
            {name: "Scroll Continuous", id: "scroll-continuous"},
        ]
    };

    ExternalControls.prototype.setScrollOption = function (option_id) {
        this.readerSettings = cloneUpdate(this.readerSettings, "scroll", option_id);
        updateReader(this.reader, this.readerSettings);
    };

    ExternalControls.prototype.getAvailableDisplayFormats = function () {
        return [
            {name: "Automatic", id: "auto"},
            {name: "Double Page", id: "double"},
            {name: "Single Page", id: "single"},
        ]
    };

    ExternalControls.prototype.setDisplayFormat = function (option_id) {
        this.readerSettings = cloneUpdate(this.readerSettings, "syntheticSpread", option_id);
        updateReader(this.reader, this.readerSettings);
    };

    ExternalControls.prototype.getRecommendedColumnWidthRange = function () {
        return {min: 500, max: 2000}
    };

    ExternalControls.prototype.changeColumnMaxWidth = function (int_size) {
        this.readerSettings = cloneUpdate(this.readerSettings, "columnMaxWidth", int_size);
        updateReader(this.reader, this.readerSettings);
    };

    ExternalControls.prototype.getCurrentReaderSettings = function(){
        return this.readerSettings;
    };







    function func_exists(fname) {
        return (typeof window[fname] === 'function');
    }

    function getDefaultSettings() {
        return {
            fontSize: 100,
            fontSelection: 0, //0 is the index of default for our purposes.
            syntheticSpread: "auto",
            scroll: "auto",
            columnGap: 60,
            columnMaxWidth: 550,
            columnMinWidth: 400,
            theme: "default-theme"
        }
    }

    function updateReader(reader, readerSettings) {
        reader.updateSettings(readerSettings); // triggers on pagination changed
        if (readerSettings.theme) {
            $("html").attr("data-theme", readerSettings.theme);

            var bookStyles = getBookStyles(readerSettings.theme);
            reader.setBookStyles(bookStyles);
            $('#reading-area').css(bookStyles[0].declarations);
        }
        Settings.put('reader', readerSettings);
    }

    function getPropertyFromClass(classOrId, property) {
        var FirstChar = classOrId.charAt(0);
        var Remaining = classOrId.substring(1);
        var elem = (FirstChar == '#') ? document.getElementById(Remaining) : document.getElementsByClassName(Remaining)[0];
        return window.getComputedStyle(elem, null).getPropertyValue(property);
    }


    function getBookStyles(theme) {
        var isAuthorTheme = (theme === "author-theme");
        var bgColor = getPropertyFromClass("." + theme, "background-color");
        var color = getPropertyFromClass("." + theme, "color");
        return [{
            selector: ':not(a):not(hypothesis-highlight)', // or "html", or "*", or "", or undefined (styles applied to whole document)
            declarations: {
                backgroundColor: isAuthorTheme ? "" : bgColor,
                color: isAuthorTheme ? "" : color
            }
        }, {
            selector: 'a', // so that hyperlinks stand out (otherwise they are invisible, and we do not have a configured colour scheme for each theme (TODO? add hyperlinks colours in addition to basic 2x params backgroundColor and color?).
            declarations: {
                backgroundColor: isAuthorTheme ? "" : bgColor,
                color: isAuthorTheme ? "" : color
            }
        }];
    }

    function cloneUpdate(object, attr, value) {
        let newObject = JSON.parse(JSON.stringify(object));
        newObject[attr] = value;
        return newObject;
    }

    return {
        getInstance: function () {
            if (externalcontrols === null) {
                externalcontrols = new ExternalControls();
            }
            return externalcontrols;
        }
    }
});
