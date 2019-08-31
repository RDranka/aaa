define(['jquery', './TreineticEpubReader', 'readium_shared_js/helpers'], function($, TreineticEpubReader, Helpers){

    $(function(){
        var urlParams = Helpers.getURLQueryParams();
        // embedded, epub
        // (epub is ebookURL)
        TreineticEpubReader.loadUI(urlParams);

        $(document.body).on('click', function()
        {
            $(document.body).removeClass("keyboard");
        });

        $(document).on('keyup', function(e)
        {
            $(document.body).addClass("keyboard");
        });
    });
});
