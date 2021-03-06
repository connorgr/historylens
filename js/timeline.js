
/**
 * Constructor for the timeline visualization object.
 * container - the object containing the visualization.
 */
//function timelineViz (container) {

    var numTopic = 1; // number of layers
    var numSample = 20; // number of samples per layer
    var absoluteScale = false;
    var timeFirstLoad = true;
    
    var stack = d3.layout.stack().offset("zero");
    
    var minYear = 1850,
        maxYear = 2010,
        startYear = minYear,
        endYear = maxYear,
        numYear = maxYear - minYear,
        width = 1000,
        padding = 20,
        overviewWidth = width + padding,
        ovBarWidth = (overviewWidth - padding) / numYear,
        oHeight = 50,
        dHeight = 200;
    
    var x = d3.scale.linear()
        .domain([0, numSample - 1])
        .range([0, overviewWidth - padding]);//width - 20]);
    var topicX = d3.scale.linear()
        .domain([0, numSample - 1])
        .range([0, width - 20]);
    var y;
    var topicY;

    var brushX = d3.scale.linear()
        .range([0, width - 20]);

    var colorPalette = d3.scale.category20().range();
    var brush = d3.svg.brush().x(brushX).extent([0, 1])
        .on("brushstart", brushStart)
        .on("brush", brushMove)
        .on("brushend", brushEnd);

    var svgTimeOverview;
    var vizBrush;
    var svgTimeDetail;

    var timeOVBars;
    var sampleLines;
    var recordsByTime;
    var vizDetail;
    var vizOverview;
//    var recordsAssociative;
//    var records;
    var summaryRecords;
    var topicRecords;
    var svgYearLine;
    var yearStamps;
    var sampleLineData;

    // Create the data for overview bars which contain all the years between 
    // the minYear and the maxYear
    var allTime = [];
    for (var i = minYear; i < maxYear; ++i) {
        allTime.push({year: i});
    }
    console.log(allTime.length);
    console.log(numYear);
            

    function initTimeline() {
        svgTimeOverview = d3.select('#areaTime').append("svg")
                .attr("width", overviewWidth +  'px')
                .attr("height", oHeight + 'px')
                .style('margin-left', '-10px')
                .append("g")
                .attr("width", overviewWidth - padding  + 'px')
                .attr("transform", "translate (10, 0)");
                
        svgTimeDetail = d3.select('#areaTime').append("svg")
                .attr("width", width + 'px')
                .attr("height", dHeight + 40 + 'px')
                .append("g")
                .attr("width", width - padding + 'px')
                .attr("transform", "translate (10, 0)");

        svgYearLine = d3.select('#areaTime').append('svg')
                .attr("width", width +  'px')
                .attr('height', '50px')
                .style('margin-top', '-60px')
                .append('g')
                .attr("width", width - padding + 'px')
                .attr("transform", "translate (10, 0)");

        svgYearLine.append('line')
                .attr("x1", 0)
                .attr("x2", width - padding)
                .attr('y1', 0)
                .attr('y2', 0)
                .attr('class', 'yearLine');

        // Setup the overview        
         timeOVBars = svgTimeOverview.selectAll('rect')
        .data(allTime)
        .enter().append("rect")
        .attr("class", "timeOVBar selected")
        .attr("width", ovBarWidth)
        .attr("height", oHeight)
        .attr("x", function(d, i) {
            d.x0 = i * ovBarWidth;
            d.x1 = d.x0 + ovBarWidth;
            return d.x0;
         });

        getSummaryDataByTime(-90, 90, -180, 180, 1, 1810, 2010);
    }

    function timeReduce(input) {
        var binnedValues = [];
        var numArrays = input.length;
        for (var i = 0; i < numArrays; ++i) {
            var records = input[i];
            /* Create filters */
            var filteredRecords = crossfilter(records);
            recordsByTime = filteredRecords.dimension(function(d) { return d.year; });

            /* Populate the array for detail view */
            var binnedValue = recordsByTime
                .group(function(d) { return Math.floor((d - minYear) / Math.ceil(numYear / numSample)); })
                .reduceSum(function(d) { return d.count; })
                .order(function(d) { return d.key; })
                .all();
            binnedValues.push(binnedValue);
        }

        return binnedValues;
    }

    function initTimeView(summary, topics) {

        console.log(summary);
        console.log(topics);

        summaryRecords = summary;
        topicRecords = topics;
        
/*        records = [];
        recordsAssociative = {};
        for (var key in summary) {
            var numKey = parseInt(key);
            records.push({year: numKey, count: parseInt(summary[key])});
            recordsAssociative[numKey] = parseInt(summary[key]);
        } */

        var binnedSummary = timeReduce([summaryRecords]);
        var layerData = groupsToLayers(binnedSummary);
//        var layerData = groupsToLayers([binnedValue]);
        var layer = stack(layerData);
        var binnedTopics = timeReduce(topicRecords);
        var topicLayerData = groupsToLayers(binnedTopics);
        var topicLayer = stack(topicLayerData);

        var yearLineData = [];
        var deltaY = numYear / numSample;
        for (var i = 0; i < numSample; ++i) {
            yearLineData.push({year: Math.round(minYear + deltaY * i), x: i});
        }

        // Add year labels
        svgYearLine.selectAll('text')
            .data(yearLineData)
            .enter().append('text')
            .attr('transform', function(d) { return 'translate(' + topicX(d.x) + ', 35)'; })
            .text(function(d) { return d.year; })
            .attr('dx', '-13px')
            .attr('class', 'labels');
            
        console.log("layer");
        console.log(topicLayer);

        y = d3.scale.linear()
        .domain([0, d3.max(layer, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([oHeight, 0]);
        
        topicY = d3.scale.linear()
        .domain([0, d3.max(topicLayer, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([dHeight, 0]);

        vizOverview = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

        vizDetail = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) { return topicX(d.x); })
            .y0(function(d) { return topicY(d.y0); })
            .y1(function(d) { return topicY(d.y0 + d.y); });

        // Render the overview
        timeOverview = svgTimeOverview.selectAll('path')
            .data(layer)
            .enter().append('path')
            .attr('d', vizOverview)
            .style("fill", function(d, i) { return colorPalette[10]; });            

        // Render the brush
        vizBrush = svgTimeOverview.append("g")
                .attr("class", "brush")
                .call(brush);        
        vizBrush.selectAll("rect").attr("height", oHeight);
        vizBrush.selectAll(".resize").append("path").attr("d", resizePath);
            
        // Render the detail view
        svgTimeDetail.selectAll("path")
            .data(topicLayer)
            .enter().append("path")
            .attr("d", vizDetail)
            .style("fill", function(d, i) { return globalColorList[i]; });

        // Construct the data for the sample lines;
        sampleLineData = [];
        for (var i = 0; i < topicLayer.length; ++i) {
            var topic = topicLayer[i];
            for (var j = 0; j < topic.length; ++j) {
                var datum = topic[j];
                sampleLineData.push({x: datum.x, y0: datum.y0, y: datum.y, group: i});
            }
        }

        // Render the sample lines
        sampleLines = svgTimeDetail.selectAll("line")
            .data(sampleLineData)
            .enter().append("line")
            .attr("x1", function(d) { return topicX(d.x); })
            .attr("x2", function(d) { return topicX(d.x); })
            .attr("y1", function(d) { return topicY(d.y0 + d.y); })
            .attr("y2", function(d) { return topicY(d.y0); })
            .attr("id", function(d, i) { return "sampleLine-" + i; })
            .style('stroke', function(d) { return d3.rgb(colorPalette[d.group]).darker(); });
//            .attr("class", "sampleLine focus");

        // Render the counts labels
        svgTimeDetail.selectAll('text')
            .data(sampleLineData)
            .enter().append('text')
            .text(function(d) { return d.y; })
            .attr('transform', function(d) { return 'translate(' + topicX(d.x) + ', ' + topicY(d.y0 + d.y) + ')'; })
            .attr('dx', '-10px')
            .attr('class', 'labels');


        svgYearLine.selectAll('.vertLine')
            .data(layer[0])
            .enter().append('line')
            .attr("x1", function(d) { return topicX(d.x); })
            .attr("x2", function(d) { return topicX(d.x); })
            .attr("y1", 0)
            .attr("y2", 5)
            .attr('class', 'vertLine');

        updateDetailView();
        updateOverview(layer);
    }

    function updateTimeView(summary, topics) {

        summaryRecords = summary;
        topicRecords = topics;

        var binnedSummary = timeReduce([summaryRecords]);
        var layerData = groupsToLayers(binnedSummary);
        var layer = stack(layerData);
        var binnedTopics = timeReduce(topicRecords);
        var topicLayerData = groupsToLayers(binnedTopics);
        var topicLayer = stack(topicLayerData);

        y = d3.scale.linear()
        .domain([0, d3.max(layer, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([oHeight, 0]);
        
/*        topicY = d3.scale.linear()
        .domain([0, d3.max(topicLayer, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([dHeight, 0]); */

        vizOverview = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

/*        vizDetail = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) { return topicX(d.x); })
            .y0(function(d) { return topicY(d.y0); })
            .y1(function(d) { return topicY(d.y0 + d.y); }); */

        updateDetailView();
        updateOverview(layer);
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
        console.log("getting new data");
        getSummaryDataByLoc(minLat, maxLat, minLng, maxLng, regionLevel, startYear, endYear, true);
//        getSummaryDataByLoc(minLat, maxLat, minLng, maxLng, 2, startYear, endYear, true);
//        getSummaryDataByLoc(minLat, maxLat, minLng, maxLng, 3, startYear, endYear, true);
    }

    function updateOverview(newLayer) {
        svgTimeOverview.selectAll('path')
            .data(newLayer)
            .transition()
            .duration(1)
            .attr("d", vizOverview);         
    }

    function updateDetailView() {
        var extent = brush.extent();
        var oWidth = width - padding;
        // Adjust the extent so that it always covers numSample * x year;
        startYear = Math.ceil(extent[0] * oWidth / ovBarWidth) + minYear;
        endYear = Math.floor(extent[1] * oWidth / ovBarWidth) - 1 + minYear;
        var adjustedSpan = Math.round((endYear - startYear + 1) / numSample) * numSample;
        extent[0] = Math.ceil(extent[0] * oWidth / ovBarWidth) * ovBarWidth / oWidth;
        extent[1] = (extent[0] * oWidth + adjustedSpan * ovBarWidth) / oWidth;
        endYear = startYear + adjustedSpan - 1;
        svgTimeOverview.select(".brush").call(brush.extent(extent));
        timeOVBars.classed("selected", function(d) {
            return d.x0 >= extent[0] * oWidth && d.x1 <= extent[1] * oWidth ;
        });

        var binFactor = adjustedSpan / numSample; // number of years in each bin
        binnedValue = [];
        binnedTopicValues = [];
        for (var i = 0; i < 10; ++i) {
            binnedTopicValues[i] = [];
        }
        
        // Initialize the new binnedValue
        for (var i = 0; i < numSample; ++i) {
            binnedValue.push({key: i, value: 0});
            for (var j = 0; j < 10; ++j) {
                binnedTopicValues[j].push({key: i, value: 0});
            }
        }

        // Rebin the years
        for (var i = 0; i < adjustedSpan; ++i) {
            var index = Math.floor(i / binFactor);
            var year = startYear + i;
            /*
            if (recordsAssociative[year] !== undefined) {
                binnedValue[index].value += recordsAssociative[year];
            }
            */
            binnedValue[index].value += summaryRecords[year - minYear].count;
//            console.log(topicRecords);
            for (var j = 0; j < 10; ++j) {
                // TODO: this is a hack...needs fix using associative array
                var currRec = topicRecords[j][year - minYear];
                if (currRec !== undefined) {
                    binnedTopicValues[j][index].value += currRec.count;
                }
            }
        }

        layerData = groupsToLayers([binnedValue]);
        topicLayerData = groupsToLayers(binnedTopicValues);
        layer = stack(layerData);
        topicLayer = stack(topicLayerData);
        if (!absoluteScale) {
/*             y = d3.scale.linear()
                .domain([0, d3.max(layer, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
                .range([oHeight, 0]); */
             topicY = d3.scale.linear()
                .domain([0, d3.max(topicLayer, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
                .range([dHeight, 0]);
                
/*            vizOverview = d3.svg.area()
                .interpolate("cardinal")
                .x(function(d) { return x(d.x); })
                .y0(function(d) { return y(d.y0); })
                .y1(function(d) { return y(d.y0 + d.y); }); */
                
            vizDetail = d3.svg.area()
                .interpolate("cardinal")
                .x(function(d) { return topicX(d.x); })
                .y0(function(d) { return topicY(d.y0); })
                .y1(function(d) { return topicY(d.y0 + d.y); });
        }

        var yearLineData = [];
        var deltaY = (endYear - startYear) / numSample;
        for (var i = 0; i < numSample; ++i) {
            yearLineData.push({year: Math.round(startYear + deltaY * i), x: i});
        }        

        // Construct the data for the sample lines;
        sampleLineData = [];
        for (var i = 0; i < topicLayer.length; ++i) {
            var topic = topicLayer[i];
            for (var j = 0; j < topic.length; ++j) {
                var datum = topic[j];
                sampleLineData.push({x: datum.x, y0: datum.y0, y: datum.y, group: i});
            }
        }
        
        layerTransition(layer, topicLayer, yearLineData, sampleLineData);    
    }

    function layerTransition(newLayer, newTopicLayer, newYears, sampleLineData) {
                
        svgTimeDetail.selectAll("path")
            .data(newTopicLayer)
            .transition()
            .duration(1)
            .attr("d", vizDetail);

        svgTimeDetail.selectAll('line')
            .data(sampleLineData)
            .transition()
            .duration(0.1)
            .attr("y1", function(d) { return topicY(d.y0 + d.y); })
            .attr("y2", function(d) { return topicY(0); });

        svgTimeDetail.selectAll('text')
            .data(sampleLineData)
            .transition()
            .duration(0.1)
            .text(function(d) { return d.y; })
            .attr('transform', function(d) { return 'translate(' + topicX(d.x) + ', ' + topicY(d.y0 + d.y) + ')'; });            

        svgYearLine.selectAll('text')
            .data(newYears)
            .transition()
            .duration(0.1)
            .text(function(d) { return d.year; });
            
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

/*    function sampleLineMouseOver(d, i) {
        console.log("mouseover");
        console.log(d);
        d3.select("#sampleLine-" + i).classed("focus", true);   
    }

    function sampleLineMouseOut(d) {
        d3.select("#sampleLine-" + i).classed("focus", false);       
    } */
//}


