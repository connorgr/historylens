
/**
 * Constructor for the timeline visualization object.
 * container - the object containing the visualization.
 */
//function timelineViz (container) {

    var numTopic = 1; // number of layers
    var numSample = 20; // number of samples per layer
    var absoluteScale = false;
    
    var stack = d3.layout.stack().offset("zero");
    
    var width = 960;
    var oHeight = 50;
    var dHeight = 200;
    
    var x = d3.scale.linear()
        .domain([0, numSample - 1])
        .range([0, width]);

    var brushX = d3.scale.linear()
        .range([0, width]);

    var colorPalette = d3.scale.category10().range();
    var brush = d3.svg.brush().x(brushX).extent([0, 1])
        .on("brushstart", brushStart)
        .on("brush", brushMove)
        .on("brushend", brushEnd);

    var svgTimeOverview;
    var vizBrush;
    var svgTimeDetail;

    var minYear = 1810;
    var maxYear = 2010;
    var numYear = maxYear - minYear;
    var timeOVBars;
    var sampleLines;
    var ovBarWidth = width / numYear;;
    var recordsByTime;
    var vizDetail;
    var recordsAssociative;
    var records;
    var svgYearLine;
    var yearStamps;

    // Create the data for overview bars which contain all the years between 
    // the minYear and the maxYear
    var allTime = [];
    for (var i = minYear; i <= maxYear; ++i) {
        allTime.push({year: i});
    }
            

    function initTimeline() {
        svgTimeOverview = d3.select('#areaTime').append("svg")
                .attr("width", width + 40 +  'px')
                .attr("height", oHeight + 'px')
                .append("g")
                .attr("width", width + 'px')
                .attr("transform", "translate (20, 0)");

        vizBrush = svgTimeOverview.append("g")
                .attr("class", "brush")
                .call(brush);        

        vizBrush.selectAll("rect").attr("height", oHeight);
        vizBrush.selectAll(".resize").append("path").attr("d", resizePath);

        svgYearLine = d3.select('#areaTime').append('svg')
                .attr("width", width + 40 +  'px')
                .attr('height', '50px')
                .append('g')
                .attr("width", width + 'px')
                .attr("transform", "translate (20, 0)");

        svgYearLine.append('line')
                .attr("x1", 0)
                .attr("x2", width)
                .attr('y1', 15)
                .attr('y2', 15)
                .attr('class', 'yearLine');

                
        svgTimeDetail = d3.select('#areaTime').append("svg")
                .attr("width", width + 40 + 'px')
                .attr("height", dHeight + 'px')
                .append("g")
                .attr("width", width + 'px')
                .attr("transform", "translate (20, 0)");

        // Setup the overview        
         timeOVBars = svgTimeOverview.selectAll()
        .data(allTime)
        .enter().append("rect")
        .attr("class", "timeOVBar selected")
        .attr("width", width / numYear)
        .attr("height", oHeight)
        .attr("x", function(d, i) {
            d.x0 = i * ovBarWidth;
            d.x1 = d.x0 + ovBarWidth;
            return d.x0;
         });

        getSummaryDataByTime(-90, 90, -180, 180, 1, 1810, 2010);
    }


    function updateTimeView(summary) {

        console.log(summary);

        records = [];
        recordsAssociative = {};
        for (var key in summary) {
            var numKey = parseInt(key);
            records.push({year: numKey, count: parseInt(summary[key])});
            recordsAssociative[numKey] = parseInt(summary[key]);
        }
        
        /* Create filters */
        var filteredRecords = crossfilter(records);
        recordsByTime = filteredRecords.dimension(function(d) { return d.year; });
    //    var recordsByTopic = filteredRecords.dimension(function(d) {return d.topic});

        /* Populate the array for detail view */
    /*        recordsByTopic.filter("A"); */
        var binnedValue = recordsByTime
            .group(function(d) { return Math.floor((d - minYear) / Math.ceil(numYear / numSample)); })
            .reduceSum(function(d) { return d.count; })
            .order(function(d) { return d.key; })
            .all();

        var yearLineData = [];
        var deltaY = numYear / numSample;
        var deltaW = width / numSample
        for (var i = 0; i < numSample; ++i) {
            yearLineData.push({year: Math.round(minYear + deltaY / 2 + deltaY * i), x: deltaW / 2 + deltaW * i});
        }

        svgYearLine.selectAll('text')
            .data(yearLineData)
            .enter().append('text')
            .attr('transform', function(d) { return 'translate(' + d.x + ', 30)'; })
            .text(function(d) { console.log(d); return d.year; });

        var layerData = groupsToLayers([binnedValue]);
        var layer = stack(layerData);

        console.log("layer");
        console.log(layer);

        var y = d3.scale.linear()
        .domain([0, d3.max(layer, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([dHeight, 0]);

        vizDetail = d3.svg.area()
            .interpolate("basis")
            .x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

         // Setup the lines at each sample point
        sampleLinesData = [];
        var delta = width / numSample + width / (2 * numSample);
        for (var i = 0; i < numSample; ++i) {
            var numLayer = layer.length;
            for (var j = 0; j < numLayer; ++j) {
                sampleLinesData.push({x1: i * delta, x2: i * delta, 
                    y1: y(layer[j][i].y), y2: dHeight, count: layer[j][i].y});
            }
        }
        
        sampleLines = svgTimeDetail.selectAll("line")
            .data(sampleLinesData)
            .enter().append("line")
            .attr("x1", function(d) { return d.x1; })
            .attr("x2", function(d) { return d.x2; })
            .attr("y1", function(d) { return d.y1; })
            .attr("y2", function(d) { return d.y2; })
            .attr("id", function(d, i) { return "sampleLine-" + i; })
            .attr("class", "sampleLine focus");

        sampleLines.append('text')
            .text(function(d) { return d.count; })
            .attr('transform', function(d) { return 'translate(' + d.x1 + ', ' + d.y1 + ')'; })
//            .on("mouseover", sampleLineMouseOver)
//            .on("mouseout", sampleLineMouseOut);


        // Setup the detail view
        svgTimeDetail.selectAll("path")
            .data(layer)
            .enter().append("path")
            .attr("d", vizDetail)
            .style("fill", function(d, i) { return colorPalette[i]; })
            .on("mouseover", sampleLineMouseOver);

        updateDetailView();
    }
        

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
        var startYear = Math.ceil(extent[0] * width / ovBarWidth) + minYear;
        var endYear = Math.floor(extent[1] * width / ovBarWidth) - 1 + minYear;
        var adjustedSpan = Math.round((endYear - startYear + 1) / numSample) * numSample;
        extent[0] = Math.ceil(extent[0] * width / ovBarWidth) * ovBarWidth / width;
        extent[1] = (extent[0] * width + adjustedSpan * ovBarWidth) / width;
        endYear = startYear + adjustedSpan - 1;
        svgTimeOverview.select(".brush").call(brush.extent(extent));
        timeOVBars.classed("selected", function(d) {
            return d.x0 >= extent[0] * width && d.x1 <= extent[1] * width ;
        });

        // Update the pointers for the map
//        d3.select("#timeMin").value(startYear);

        // Update the records for the detail view
//        recordsByTime.filter([startYear, endYear+1]);

        var binFactor = adjustedSpan / numSample; // number of years in each bin
        binnedValue = [];
        // Initialize the new binnedValue
        for (var i = 0; i < numSample; ++i) {
            binnedValue.push({key: i, value: 0});
        }

        // Rebin the years
        for (var i = 0; i < adjustedSpan; ++i) {
            var index = Math.floor(i / binFactor);
            var year = startYear + i;
            if (recordsAssociative[year] !== undefined) {
                binnedValue[index].value += recordsAssociative[year];
            }
        }

        layerData = groupsToLayers([binnedValue]);
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

        sampleLinesNewData = [];
        var delta = width / numSample + width / (2 * numSample);
        for (var i = 0; i < numSample; ++i) {
            var numLayer = layer.length;
            for (var j = 0; j < numLayer; ++j) {
                sampleLinesNewData.push({x1: i * delta, x2: i * delta, 
                    y1: y(newLayer[j][i].y), y2: dHeight, count: newLayer[j][i].y});
            }
        }

        svgTimeDetail.selectAll('line')
            .data(sampleLinesNewData)
            .transition()
            .duration(0.1)
//            .attr("x1", function(d) { return d.x1; })
//            .attr("x2", function(d) { return d.x2; })
            .attr("y1", function(d) { return d.y1; })
            .attr("y2", function(d) { return d.y2; });
//            .attr("id", function(d, i) { return "sampleLine-" + i; })
//            .attr("class", "sampleLine")
//            .on("mouseover", sampleLineMouseOver)
//            .on("mouseout", sampleLineMouseOut);
    }

    function groupsToLayers(groups) {
        var length = groups.length;
        var result = [];
        for (var i = 0; i < length; ++i) {
            var group = groups[i];
            var stackLayer = [];
            for (var j = 0; j < numSample; ++j) {
                var value = 0;
                for (var k = 0; k < group.length; ++k) {
                    var elem = group[k];
                    if (elem.key === j) {
                        value = elem.value;
                    }
                }
                stackLayer.push({x: j, y: value});
            }
            result.push(stackLayer);
        }
        return result;
    }

    function sampleLineMouseOver(d, i) {
        console.log("mouseover");
        console.log(d);
        d3.select("#sampleLine-" + i).classed("focus", true);   
    }

    function sampleLineMouseOut(d) {
        d3.select("#sampleLine-" + i).classed("focus", false);       
    }
//}


