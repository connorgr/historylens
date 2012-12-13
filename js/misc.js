
    var optionsLoaded = false;
    var options = [];

    function populateOptions() {
        console.log("options");
        var numOptions = options.length;
        for (var i = 0; i < numOptions; ++i) {
            $('topicSelect').append(new Option(options[i], i, false, false));
        }
        optionsLoaded = true;
    }
