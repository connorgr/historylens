
/**
 * Constructor for the timeline visualization object.
 * container - the object containing the visualization.
 */
function timelineViz (container) {
    getSummaryByTime(0, 0, 0, 0, 0, 0);

    var test = [[{"x": 0, "y": 3}, {"x": 1, "y": 5}, {"x": 2, "y": 1}, {"x": 3, "y": 2}], [{"x": 0, "y": 1}, {"x": 1, "y": 3}, {"x": 2, "y": 5}, {"x": 3, "y": 3}]];
    var numTopic = 2; // number of layers
    var numSample = 20; // number of samples per layer
    var numYear = summary.length;
    var absoluteScale = false;
    
    var stack = d3.layout.stack().offset("zero");


    /* Create filters */
    var filteredRecords = crossfilter(records);
    var recordsByTime = filteredRecords.dimension(function(d) {return d.year;});
    var recordsByTopic = filteredRecords.dimension(function(d) {return d.topic});

    /* Populate the array for detail view */
    recordsByTopic.filter("A");
    var binnedValueA = recordsByTime
        .group(function(d) { return Math.floor((d - 1812) / (200 / numSample)); })
        .reduceSum(function(d) { return d.count; })
        .order(function(d) { return d.key; })
        .all();

    recordsByTopic.filter("B");
    var binnedValueB = recordsByTime
        .group(function(d) { return Math.floor((d - 1812) / (200 / numSample)); })
        .reduceSum(function(d) { return d.count; })
        .order(function(d) { return d.key; })
        .all();

    var layerData = groupsToLayers([binnedValueA, binnedValueB]);

    var layer = stack(layerData);
    
    var width = 960;
    var oHeight = 50;
    var dHeight = 200;
    var ovBarWidth = width / numYear;
    
    var x = d3.scale.linear()
        .domain([0, numSample - 1])
        .range([0, width]);


    var y = d3.scale.linear()
        .domain([0, d3.max(layer, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([dHeight, 0]);

    var brushX = d3.scale.linear()
        .range([0, width]);

    var colorPalette = d3.scale.category10().range();
    var brush = d3.svg.brush().x(brushX).extent([0, 1])
        .on("brushstart", brushStart)
        .on("brush", brushMove)
        .on("brushend", brushEnd);

    var vizDetail = d3.svg.area()
        .interpolate("basis")
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    var svgTimeOverview = d3.select(container).append("svg")
        .attr("width", width + 40 +  'px')
        .attr("height", oHeight + 'px')
        .append("g")
        .attr("width", width + 'px')
        .attr("transform", "translate (20, 0)");

    var timeOVBars = svgTimeOverview.selectAll()
        .data(summary)
        .enter().append("rect")
        .attr("class", "timeOVBar selected")
        .attr("width", width / numYear)
        .attr("height", oHeight)
        .attr("x", function(d, i) {
            d.x0 = i * ovBarWidth;
            d.x1 = d.x0 + ovBarWidth;
            return d.x0;
         });

    var vizBrush = svgTimeOverview.append("g")
        .attr("class", "brush")
        .call(brush);
        
    vizBrush.selectAll("rect").attr("height", oHeight);
    vizBrush.selectAll(".resize").append("path").attr("d", resizePath);

    var svgTimeDetail = d3.select(container).append("svg")
        .attr("width", width + 40 + 'px')
        .attr("height", dHeight + 'px')
        .append("g")
        .attr("width", width + 'px')
        .attr("transform", "translate (20, 0)");

    svgTimeDetail.selectAll("path")
        .data(layer)
        .enter().append("path")
        .attr("d", vizDetail)
        .style("fill", function(d, i) { return colorPalette[i]; });

    function resizePath(d) {
        var e = +(d == "e"),
            x = e ? 1 : -1,
            y = oHeight / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
    }

    function brushStart() {
        console.log("start");
    }

    function brushMove() {
        var extent = brush.extent();
        timeOVBars.classed("selected", function(d) {
            return d.x0 >= extent[0] * width && d.x1 <= extent[1] * width ;
        });
        updateDetailView();
    }

    function brushEnd() {
        updateDetailView();
    }

    function updateDetailView() {
        var extent = brush.extent();

        // Adjust the extent so that it always covers numSample * x year;
        var startYear = Math.ceil(extent[0] * width / ovBarWidth) + 1812;
        var endYear = Math.floor(extent[1] * width / ovBarWidth) - 1 + 1812;
        var adjustedSpan = Math.round((endYear - startYear + 1) / numSample) * numSample;
        extent[0] = Math.ceil(extent[0] * width / ovBarWidth) * ovBarWidth / width;
        extent[1] = (extent[0] * width + adjustedSpan * ovBarWidth) / width;
        endYear = startYear + adjustedSpan - 1;
        svgTimeOverview.select(".brush").call(brush.extent(extent));
        timeOVBars.classed("selected", function(d) {
            return d.x0 >= extent[0] * width && d.x1 <= extent[1] * width ;
        });

        // Update the records for the detail view
        recordsByTime.filter([startYear, endYear+1]);
        var recordsA = recordsByTopic.filter("A").top(Infinity);
        var recordsB = recordsByTopic.filter("B").top(Infinity);

        var binFactor = adjustedSpan / numSample;
        binnedValueA = [];
        binnedValueB = [];
        for (var i = 0; i < numSample; ++i) {
            binnedValueA.push({key: i, value: 0});
            binnedValueB.push({key: i, value: 0});
        }
            
        for (var i = 0; i < adjustedSpan; ++i) {
            var index = Math.floor(i / binFactor);
            binnedValueA[index].value += recordsA[i].count;
            binnedValueB[index].value += recordsB[i].count;
        }

        layerData = groupsToLayers([binnedValueA, binnedValueB]);
        layer = stack(layerData);
        if (!absoluteScale) {
             y = d3.scale.linear()
                .domain([0, d3.max(layer, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
                .range([dHeight, 0]);
        }
        
        layerTransition(layer);    
    }

    function layerTransition(newLayer) {
        svgTimeDetail.selectAll("path")
            .data(newLayer)
            .transition()
            .duration(1)
            .attr("d", vizDetail);
    }

    function groupsToLayers(groups) {
        var length = groups.length;
        var result = [];
        for (var i = 0; i < length; ++i) {
            var group = groups[i];
            var stackLayer = [];
            for (var j = 0; j < numSample; ++j) {
                var elem = group[j];
                stackLayer.push({x: elem.key, y: elem.value});
            }
            result.push(stackLayer);
        }
        return result;
    }

    function getSummaryByTime(minLat, maxLat, minLng, maxLng, minTime, maxTime) {
        console.log("getting data from php...");
        var result;
        var filterJSON = JSON.stringify({min_latitude: -90, max_latitude: 90});
        $.get("/vs/php/query.php",
                {"q" : filterJSON},
                function(data) {
                    result = $.parseJSON(data);
                })
         .error(function(e) { console.log("error"); console.log(e.responseText); result = $.parseJSON(e.responseText); });

         console.log(result);
    }
}


