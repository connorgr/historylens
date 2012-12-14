    var optionsLoaded = false;
    var options = [];
//    var useOrigData = 1;

    function populateOptions() {
        var numOptions = options.length;
        for (var i = 0; i < numOptions; ++i) {
            $('#topicSelect').append(new Option(options[i], options[i], false, false));
        }
        $('.chzn-select').chosen({allow_single_deselect: true});
        $('#topicSelect').change(topicSearchInput);
        optionsLoaded = true;

        initLegend();
    }

    function topicSearchInput() {
        var topic = this.value;
        console.log(topic);
        getDocuments(minLat, maxLat, minLng, maxLng, startYear, endYear, [topic]);
    }

    function populateDocList(documents) {
        console.log(documents);
        var numDocs = documents.length;
        $('#docList').empty();
        for (var i = 0; i < numDocs; ++i) {
            var doc = documents[i];
            $('#docList').append('<tr><td><a href=' + doc.url + '>' + doc.title
                + '</a></td><td>' + doc.pubYear + '</td></tr>');
        }
    }
