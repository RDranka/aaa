define(['jquery', './TreineticEpubReader', 'readium_shared_js/helpers'], function($, TreineticEpubReader, Helpers){

    $(function(){
        var urlParams = Helpers.getURLQueryParams();
        // embedded, epub
        // (epub is ebookURL)

        // var xhr = new XMLHttpRequest();
        // xhr.onreadystatechange = function(){
        //     if (this.readyState == 4 && this.status == 200){
        //         var url = window.URL || window.webkitURL;
        //         var objectURL = url.createObjectURL(this.response);
        //         console.log(objectURL);
        //         TreineticEpubReader.loadUI({ epub : objectURL });
        //     }
        // }
        // xhr.open('GET', 'http://192.168.1.7/EPUB_BACKEND/public/api/v1.0/epub/preview/beed91406cd211e9a4c1ebdd16a6730e');
        // xhr.responseType = 'blob';
        // xhr.send();

        //http://127.0.0.1:8080/dev/index_RequireJS_no-optimize_tr_controls_only_lite.html?epub=

        //
        var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5ZWQ4ZmNiMDUwNTkxMWU5YWZiNDBmYzU4ZmM2YzY4YSIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3QvRVBVQl9CQUNLRU5EL3B1YmxpYy9hcGkvdjEuMC9sb2dpbiIsImlhdCI6MTU2NzkyOTU5MCwiZXhwIjoxNTY4NTM0MzkwLCJuYmYiOjE1Njc5Mjk1OTAsImp0aSI6IldrS2ZaYlROemFBWWdMMEsifQ.t6sskXKeEdgbd0Zq4WEa7SsVX_02bbwNykYXnXfFzTo";

        var exControls = TreineticEpubReader.handler();
        exControls.registerEvent("onEpubLoadSuccess", function () {
            console.log("EpubLoaded Success");
        });

        exControls.registerEvent("onEpubLoadFail", function () {
            console.log("EpubLoad Failed");
        });

        exControls.registerEvent("onTOCLoaded", function (hasTOC) {
            var message = {
                hasTOC : hasTOC,
                toc : []
            };
            if (!hasTOC) {
                message.toc =  JSON.parse(getTOCJson());
            }
            console.log("TOC", message);
        });


        TreineticEpubReader.loadUI({ epub : "http://192.168.1.7/EPUB_BACKEND/public/api/v1.0/epub/preview/beed91406cd211e9a4c1ebdd16a6730e?token="+token });
        //TreineticEpubReader.loadUI(urlParams);
    });
});
