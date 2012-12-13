
    // Time 
    
    function getSummaryDataByTime(minLat, maxLat, minLng, maxLng, regionLevel, minYear, maxYear) {
        getData(minLat, maxLat, minLng, maxLng, regionLevel, minYear, maxYear, binByTime);
    }

    function binByTime(data) {
        var summary = countAggregator(data.timeline);
        updateTimeView(summary);
    }

    function countAggregator(data) {
        console.log(optionsLoaded);
        var result = {};
        for (var mainKey in data) {
            var values = data[mainKey];
            var count = 0;
            for (var subKey in values) {
                count += parseInt(values[subKey]);
                if (!optionsLoaded) {
                    if ($.inArray(subKey, options) < 0) { options.push(subKey); };
                }
            }
            result[mainKey] = count;
        }
        if (!optionsLoaded) {
            populateOptions();
        }
        return result;
    }

    // Space

    function getSummaryDataByLoc(minLat, maxLat, minLng, maxLng, regionLevel, minYear, maxYear) {
        getData(minLat, maxLat, minLng, maxLng, regionLevel, minYear, maxYear, binByLoc);
    }

    function binByLoc(data) {
        var summary = locCountAggregator(data.map);
        updateMapView(summary);
        //updateMapView(data.map);
    }

    function locCountAggregator(data) {
        var result = [];
        for (var mainKey in data) {
            var values = data[mainKey];
            var topics = values.topics;
            var count = 0;
            for (var subKey in topics) {
                count += parseInt(topics[subKey]);
            }
            result.push({key: mainKey, lat: values.lat, lng: values.long, count: count, placeName: values.placeName});
        }
        console.log(result);
        return result;
    }

    // Documents

    function getDocuments(minLat, maxLat, minLng, maxLng, minyear, maxYear, topic) {
        console.log("Getting data from php...");
        var filterJSON = JSON.stringify({min_latitude: minLat, max_latitude: maxLat, min_longitude: minLng, max_longitude: maxLng, min_year: minYear, max_year: maxYear, topic: topic});
        $.get("/vs/php/query.php",
                {"q" : filterJSON},
                function(data) {
                    console.log(data);
                    populateDocList(data.document);
                },
                'json')
         .success(function(data) { console.log("success"); })
         .error(function(e) { 
            console.log("error"); 
            console.log(e.responseText); 
         });        
    }

    // Base functions

    function getData(minLat, maxLat, minLng, maxLng, regionLevel, minYear, maxYear, callback) {
        console.log("Getting data from php...");
        var filterJSON = JSON.stringify({min_latitude: minLat, max_latitude: maxLat, min_longitude: minLng, max_longitude: maxLng, min_year: minYear, max_year: maxYear, regionLevel: regionLevel});
        $.get("/vs/php/query.php",
                {"q" : filterJSON},
                function(data) {
                    console.log(data);
                    callback(data);
                },
                'json')
         .success(function(data) { console.log("success"); })
         .error(function(e) { 
            console.log("error"); 
            console.log(e.responseText); 
         });
    }       

