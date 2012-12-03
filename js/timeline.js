
/**
 * Constructor for the timeline visualization object.
 * container - the object containing the visualization.
 */
function timelineViz (container) {
    var testOverview = [{"x": 0, "y": 4}, {"x": 1, "y": 8}, {"x": 2, "y": 6}, {"x": 3, "y": 5}];
    var test = [[{"x": 0, "y": 3}, {"x": 1, "y": 5}, {"x": 2, "y": 1}, {"x": 3, "y": 2}], [{"x": 0, "y": 1}, {"x": 1, "y": 3}, {"x": 2, "y": 5}, {"x": 3, "y": 3}]];
    var numTopic = 2; // number of layers
    var numSample = 4; // number of samples per layer
    var stack = d3.layout.stack().offset("zero");
    var layer = stack(test);

    var width = 960;
    var oHeight = 50;
    var dHeight = 200;

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

    var area = d3.svg.area()
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    var svgTimeOverview = d3.select(container).append("svg")
        .attr("width", width + 40 +  'px')
        .attr("height", oHeight + 'px')
        .append("g")
        .attr("width", width + 'px')
        .attr("transform", "translate (20, 0)");

    svgTimeOverview.selectAll()
        .data(testOverview)
        .enter().append("rect")
        .attr("class", "timeOVBar")
        .attr("width", width / testOverview.length)
        .attr("height", oHeight)
        .attr("x", function(d, i) {return i * width / testOverview.length});

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
        .attr("d", area)
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
        console.log("move");
    }

    function brushEnd() {
        console.log("end");
    }
}
