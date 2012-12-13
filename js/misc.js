
    var optionsLoaded = false;
    var options = [];
    $('#topicSelect').chosen().change(topicSearchInput);


    function populateOptions() {
        var numOptions = options.length;
        for (var i = 0; i < numOptions; ++i) {
            $('#topicSelect').append(new Option(options[i], i, false, false));
        }
        $('.chzn-select').chosen({allow_single_deselect: true});
        optionsLoaded = true;
    }

    function topicSearchInput() {
        console.log("???");
        var topic = this.value;
        console.log(topic);
        getDocuments(-90, 90, -180, 180, startYear, endYear, [topic]);
    }

    function populateDocList() {
        
    }
