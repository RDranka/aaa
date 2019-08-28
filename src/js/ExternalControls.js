var readiumReader = null;

define([], function () {
    var externalcontrols = null;


    var ExternalControls = function () {
        this.metadata= null;
        this.reader = null;
        this.channel = null;
        this.auto_bookmark = true;
    };

    ExternalControls.prototype.epubLoaded = function (metadata, reader) {
        if(func_exists("onEpubLoadSuccess")){
            this.metadata = metadata;
            this.reader = reader;
            //TODO REMOVE
            readiumReader = reader;
            this.reader.on(ReadiumSDK.Events.PAGINATION_CHANGED, function (pageChangeData) {
                //this.paginationChangeInfo = pageChangeData;
            });

            onEpubLoadSuccess(externalcontrols);
        }
    };

    ExternalControls.prototype.epubFailed = function (error) {
        if(func_exists("onEpubLoadFail")){
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


    function func_exists(fname) {
        return (typeof window[fname] === 'function');
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
