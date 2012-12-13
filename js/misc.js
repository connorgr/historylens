
    var optionsLoaded = false;
    var options = [];

    function populateOptions() {
        var numOptions = options.length;
        for (var i = 0; i < numOptions; ++i) {
            $('#topicSelect').append(new Option(options[i], options[i], false, false));
        }
        $('.chzn-select').chosen({allow_single_deselect: true});
        $('#topicSelect').change(topicSearchInput);
        optionsLoaded = true;
    }

    function topicSearchInput() {
        var topic = this.value;
        console.log(topic);
        getDocuments(-90, 90, -180, 180, startYear, endYear, [topic]);
    }

    function populateDocList(documents) {
        console.log(documents);
        var numDocs = documents.length;
        for (var i = 0; i < numDocs; ++i) {
            var doc = documents[i];
            $('#docList').append('<tr><td><a href=' + doc.url + '>' + doc.title
                + '</a></td><td>' + doc.pubYear + '</td></tr>');
        }
    }
