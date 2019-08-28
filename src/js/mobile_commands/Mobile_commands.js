var DEVICE_TYPES = {
    ANDROID: "ANDROID",
    IOS: "IOS"
};

var exControls = null;

function onEpubLoadSuccess(externalcontrols) {
    exControls = externalcontrols;
    Log.debug("epub Loaded");
}

function onEpubLoadFail(error) {
    Log.debug("epub load failed");
}

/**
 * @return {string}
 */
function getBackgroundColorsList() {
    return JSON.stringify([
        "Default", "Black and White", "Arabian Nights", "Sands of Dune", "Ballard Blues"
    ]);
}

function getCurrentFontSize() {

}

function getCurrentPageWidth() {

}

function getCurrentDisplayFormat() {

}

function getCurrentScrollMode() {

}

function getFontSizeRange(type) {
    if (type === DEVICE_TYPES.ANDROID) {
        return JSON.stringify({"min": 10, "max": 25});
    } else {
        return JSON.stringify({"min": 10, "max": 25});
    }
}

function getPageWidthRange(type) {
    if (type === DEVICE_TYPES.ANDROID) {
        return JSON.stringify({"min": 10, "max": 25});
    } else {
        return JSON.stringify({"min": 10, "max": 25});
    }
}


function setFontSize(size) {

}

function setBackgroundColor(id) {

}


function setPageWidth(width) {

}

function setDisplayFormat(format) {

}

function setScrollMode(scrollMode) {

}

/* ----------- RELATED TO PAGES NAVIGATION ----------- */
function nextPage() {
    exControls.nextPage();
}

function prevPage() {
    exControls.prevPage();
}

function hasNextPage() {
    return exControls.hasNextPage();
}

function hasPrevPage() {
    return exControls.hasPrevPage();
}
/* ----------- RELATED TO PAGES NAVIGATION END ----------- */



/*------------ BOOKMARKS ----------------------------------*/
function makeBookmark() {
    return exControls.makeBookMark();
}
//Default is set to auto book mark, and to
function setAutoBookmark($boolean) {
    return exControls.setAutoBookmark($boolean);
}
/*------------ BOOKMARKS END ------------------------------*/


function Log() {
    
}
Log.debug = function (debug) {
    console.log(debug);
};





