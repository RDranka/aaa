var DEVICE_TYPES = {
    ANDROID: "ANDROID",
    IOS: "IOS"
};

var exControls = null;
var events = {};

/**
* this method is mostely for non mobile devices
* */
function registerEvent(eventName, func) {
    events[eventName] = func;
}

/**
 * This function get Called from the Reader when an epub file
 * successfully loaded, we can use this to trigger mobile event
 * **/
function onEpubLoadSuccess(externalcontrols) {
    if(events["onEpubLoadSuccess"]){
        events["onEpubLoadSuccess"](externalcontrols);
    }
    exControls = externalcontrols;
    Log.debug("epub Loaded");
}

/**
 * This function get Called from the Reader when an epub file
 * failed to load, we can use this to trigger mobile event
 * **/
function onEpubLoadFail(error) {
    if(events["onEpubLoadFail"]){
        events["onEpubLoadFail"](error);
    }
    Log.debug("epub load failed");
}

/**
 * This function get Called from the reader when the epub loaded and
 * then the TOC is loaded, you can check @param hasToc to check
 * whether the epub has TOC or not
 * */
function onTOCLoaded(hasToC) {
    if(events["onTOCLoaded"]){
        events["onTOCLoaded"](hasToC);
    }
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


/*--------------- TOC ----------------------------------- */
function getTOCJson() {
    return exControls.getTOCJson();
}

function goToPage(href) {
    exControls.goToPage(href);
}
/*--------------- TOC END-------------------------------- */

function Log() {
    
}
Log.debug = function (debug) {
    console.log(debug);
};





