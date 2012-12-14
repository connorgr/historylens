
    // Time 
    
    function getSummaryDataByTime(minLat, maxLat, minLng, maxLng, regionLevel, minYear, maxYear) {
        getData(minLat, maxLat, minLng, maxLng, regionLevel, minYear, maxYear, binByTime);
    }

    function binByTime(data) {
        var summary = [];
        var topics = [];
        for (var i = 0; i < 10; ++i) {
            topics[i] = [];
        }
        var timeline = data.timeline;
        for (var mainKey in timeline) {
            var topicPairs = timeline[mainKey];
            var count = 0;
            var i = 0;
            for (var subKey in topicPairs) {
                var singleCount = parseInt(topicPairs[subKey]);
                count += singleCount;
                topics[i++].push({year: mainKey, count: singleCount});
                if (!optionsLoaded) {
                    if ($.inArray(subKey, options) < 0) { options.push(subKey); };
                }
                if (i >= 10) { break; }
            }
            summary.push({year: mainKey, count: count});
        }
        if (!optionsLoaded) {
            populateOptions();
        }        
        updateTimeView(summary, topics);
    }


/*
    function timeCountAggregator(data) {
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
*/

    // Space

    function getSummaryDataByLoc(minLat, maxLat, minLng, maxLng, regionLevel, minYear, maxYear, redraw) {
        console.log("Getting data from php...");
        var filterJSON = JSON.stringify({min_latitude: minLat, max_latitude: maxLat, min_longitude: minLng, max_longitude: maxLng, min_year: minYear, max_year: maxYear, regionLevel: regionLevel, original_data: 0});
        console.log(filterJSON);
        $.get("/vs/php/query.php",
                {"q" : filterJSON},
                function(data) {
                    console.log(data);
                    binByLoc(data, regionLevel, redraw);
                },
                'json')
         .success(function(data) { console.log("success"); })
         .error(function(e) { 
            console.log("error"); 
            console.log(e.responseText); 
         });
    }

    function binByLoc(data, regionLevel, redraw) {
      var summary = locCountAggregator(data.map);
      if (regionLevel === 1) {
        countries = summary;
      }
      else if (regionLevel === 2) {
        regions = summary;
      }
      else {
        cities = summary;
      }
//      updateLocData(summary);
      if (firstLoad) {
        updateMapView();
        firstLoad = false;
      }
      if (redraw) {
        updateMapView();
      }
//      updateMapView(summary);
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
        result.push({key: mainKey, lat: values.lat, lng: values.long, 
            count: count, placeName: values.placeName, topics: values.topics});
      }
      console.log(result);
      return result;
    }

    // Time & Space

    function getSummaryDataByBoth(minLat, maxLat, minLng, maxLng, regionLevel, minYear, maxYear) {
        getData(minLat, maxLat, minLng, maxLng, regionLevel, minYear, maxYear, binByBoth);        
    }

    function binByBoth(data) {
        binByTime(data);
        updateLocData(data.map);
//        updateMapView(data.map);
    }

    // Documents

    function getDocuments(minLat, maxLat, minLng, maxLng, minyear, maxYear, topic) {
        console.log("Getting data from php...");
        var filterJSON = JSON.stringify({min_latitude: minLat, max_latitude: maxLat, min_longitude: minLng, max_longitude: maxLng, min_year: minYear, max_year: maxYear, topics: topic, original_data: 0});
        console.log(filterJSON);
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
        var filterJSON = JSON.stringify({min_latitude: minLat, max_latitude: maxLat, min_longitude: minLng, max_longitude: maxLng, min_year: minYear, max_year: maxYear, regionLevel: regionLevel, original_data: 0});
        console.log(filterJSON);
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

