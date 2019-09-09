window.process = undefined;
require(["readium_shared_js/globalsSetup"], function () {
    require(["jquery"], function ($) {

        require(["readium_js_viewer/TreineticEpubReader"], function (TreineticEpubReader) {
            window.TreineticEpubReader = TreineticEpubReader;
        });
    });
});
