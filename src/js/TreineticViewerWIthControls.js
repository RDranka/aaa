define(['jquery', './EpubLibrary', './EpubReader', './ReaderWIthControls', 'readium_shared_js/helpers', 'URIjs'], function ($, EpubLibrary, EpubReader, ReaderWIthControls, Helpers, URI) {

    var _initialLoad = true; // replaces pushState() with replaceState() at first load
    var initialLoad = function () {

        var urlParams = Helpers.getURLQueryParams();

        var ebookURL = urlParams['epub'];
        var libraryURL = urlParams['epubs'];
        var embedded = urlParams['embedded'];

        // we use triggerHandler() so that the pushState logic is invoked from the first-time open

        if (ebookURL) {
            //EpubReader.loadUI(urlParams);
            var eventPayload = {embedded: embedded, epub: ebookURL, epubs: libraryURL};
            $(window).triggerHandler('readepub', eventPayload);
        } else {
            //EpubLibrary.loadUI({epubs: libraryURL});
            var eventPayload = libraryURL;
            $(window).triggerHandler('loadlibrary', eventPayload);
        }

        $(document.body).on('click', function () {
            $(document.body).removeClass("keyboard");
        });

        $(document).on('keyup', function (e) {
            $(document.body).addClass("keyboard");
        });
    };

    var pushState = $.noop;
    var replaceState = $.noop;


    var libraryView = function (libraryURL, importEPUB) {
        EpubLibrary.unloadUI();
        if (libraryURL) {
            EpubLibrary.loadUI({epubs: libraryURL});
        } else {
            EpubLibrary.loadUI({epubs: undefined, importEPUB: importEPUB});
        }
    };

    var readerView = function (data) {
        EpubLibrary.unloadUI();
        ReaderWIthControls.loadUI(data);
    };

    $(window).on('readepub', function (e, eventPayload) {

        if (!eventPayload || !eventPayload.epub) return;

        var ebookURL_filepath = Helpers.getEbookUrlFilePath(eventPayload.epub);

        var epub = eventPayload.epub;
        if (epub && (typeof epub !== "string")) {
            epub = ebookURL_filepath;
        }

        ebookURL_filepath = EpubReader.ensureUrlIsRelativeToApp(ebookURL_filepath);

        var epubs = eventPayload.epubs;
        epubs = EpubReader.ensureUrlIsRelativeToApp(epubs);

        var urlState = Helpers.buildUrlQueryParameters(undefined, {
            epub: ebookURL_filepath,
            epubs: (epubs ? epubs : undefined),
            embedded: (eventPayload.embedded ? eventPayload.embedded : undefined)
        });

        var func = _initialLoad ? replaceState : pushState;
        func(
            {epub: epub, epubs: epubs},
            "Readium Viewer",
            urlState
        );

        _initialLoad = false;

        readerView(eventPayload);
    });

    $(window).on('loadlibrary', function (e, eventPayload) {
        var libraryURL = undefined;
        var importEPUB = undefined;
        if (typeof eventPayload === "string") {
            libraryURL = eventPayload;
        } else { //File/Blob
            importEPUB = eventPayload;
        }

        libraryURL = EpubReader.ensureUrlIsRelativeToApp(libraryURL);

        var urlState = Helpers.buildUrlQueryParameters(undefined, {
            epubs: (libraryURL ? libraryURL : undefined),
            epub: " ",
            goto: " "
        });

        var func = _initialLoad ? replaceState : pushState;
        func(
            {epubs: libraryURL},
            "Readium Library",
            urlState
        );

        _initialLoad = false;

        libraryView(libraryURL, importEPUB);
    });


    if (window.File) {
        var fileDragNDropHTMLArea = $(document.body);
        fileDragNDropHTMLArea.on("dragover", function (ev) {
            ev.stopPropagation();
            ev.preventDefault();

            //$(ev.target)
            fileDragNDropHTMLArea.addClass("fileDragHover");
        });
        fileDragNDropHTMLArea.on("dragleave", function (ev) {
            ev.stopPropagation();
            ev.preventDefault();

            //$(ev.target)
            fileDragNDropHTMLArea.removeClass("fileDragHover");
        });
        fileDragNDropHTMLArea.on("drop", function (ev) {
            ev.stopPropagation();
            ev.preventDefault();

            //$(ev.target)
            fileDragNDropHTMLArea.removeClass("fileDragHover");

            var files = ev.target.files || ev.originalEvent.dataTransfer.files;

            if (files.length) {

                var file = files[0];
                console.log("File drag-n-drop:");
                console.log(file.name);
                console.log(file.type);
                console.log(file.size);

                if (file.type == "application/epub+zip" || (/\.epub[3?]$/.test(file.name))) {
                    var urlParams = Helpers.getURLQueryParams();
                    //var ebookURL = urlParams['epub'];
                    var libraryURL = urlParams['epubs'];
                    var embedded = urlParams['embedded'];

                    var eventPayload = {embedded: embedded, epub: file, epubs: libraryURL};
                    $(window).triggerHandler('readepub', eventPayload);
                }

            }
        });
    }

    $(initialLoad);
});
