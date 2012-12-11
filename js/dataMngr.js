

//function dataMngr () {

    function getSummaryDataByTime(minLat, maxLat, minLng, maxLng, minYear, maxYear, viz) {
        console.log("summary");
        getData(minLat, maxLat, minLng, maxLng, minYear, maxYear, binByTime, viz);

//        var timeline = getData(minLat, maxLat, minLng, maxLng, minYear, maxYear).timeline;
//        console.log(timeline);
//        var aggregatedTime = countAggregator(timeline);
//        return timeline;
    }

    function binByTime(data, viz) {
        console.log(data);
        viz.updateView();
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


    function getData(minLat, maxLat, minLng, maxLng, minYear, maxYear, callback, viz) {
        console.log("Getting data from php...");
        var filterJSON = JSON.stringify({min_latitude: minLat, max_latitude: maxLat, min_longitude: minLng, max_longitude: maxLng, min_year: minYear, max_year: maxYear});
        $.get("/vs/php/query.php",
                {"q" : filterJSON},
                function(data) {
                    console.log(data);
                    callback(data, viz);
                },
                'json')
         .success(function(data) { console.log("success"); })
         .error(function(e) { 
            console.log("error"); 
            console.log(e.responseText); 
         });
    }
//}

