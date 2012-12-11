    function getSummaryDataByTime(minLat, maxLat, minLng, maxLng, minYear, maxYear) {
        var timeline = getData(minLat, maxLat, minLng, maxLng, minYear, maxYear).timeline;
        console.log(timeline);
        var aggregatedTime = countAggregator(timeline);
        return timeline;
    }

    function countAggregator(data) {
        var result = {};
        for (var mainKey in data) {
            console.log(mainKey);
            console.log(data[mainKey]);
            var values = data[mainKey];
            var count = 0;
            for (var subKey in values) {
                count += values[subKey];
            }
            result[mainKey] = count;
        }
        console.log(result);
        return result;
    }


    function getData(minLat, maxLat, minLng, maxLng, minYear, maxYear) {
        console.log("Getting data from php...");
        var result;
        var filterJSON = JSON.stringify({min_latitude: minLat, max_latitude: maxLat, min_longitude: minLng, max_longitude: maxLng, min_year: minYear, max_year: maxYear});
        $.get("/vs/php/query.php",
                {"q" : filterJSON},
                function(data) {
                    console.log(data);
//                    result = $.parseJSON(data);
                    retult = data;
                },
                'json')
         .success(function(data) { console.log("success"); })
         .error(function(e) { 
            console.log("error"); 
            console.log(e.responseText); 
         });

         return result;        
    }

