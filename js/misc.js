
    var optionsLoaded = false;
    var options = [];
    $('#topicSelect').change(topicSearchInput);


    function populateOptions() {
        console.log("options");
        var numOptions = options.length;
        for (var i = 0; i < numOptions; ++i) {
            console.log("append");
            $('#topicSelect').append(new Option(options[i], i, false, false));
        }
        $('.chzn-select').chosen({allow_single_deselect: true});
        optionsLoaded = true;
    }

    function topicSearchInput() {
        var topic = this.value;
        console.log(topic);
        getDocuments(-90, 90, -180, 180, startYear, endYear, [topic]);
    }

    function populateDocList() {
        
    }
