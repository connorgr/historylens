

/**
  * This function draws a donut visualization on an SVG canvas
  * d3Selection - a selection made in d3 to use to render the donut in
  *
  */
function drawDonut(d3Selection) {
  var radius = 50,
      donutColorsList = ['#8DD3C7', '#FFFFB3', '#BEBADA', '#FB8072', '#80B1D3',
          '#FDB462', '#B3DE69', '#FCCDE5', '#D9D9D9', 'BC80BD'],
      donutColors = d3.scale.ordinal().range(donutColorsList),
      arc = d3.svg.arc().outerRadius(radius - 3).innerRadius(radius - radius/3),
      pie = d3.layout.pie().sort(null).value(function(d) { return d.num; });

  var loc = d3Selection.append('g');

  //loc.append('circle').attr('r', 100);
  loc.append('circle')
     .attr('r', radius)
     .attr('transform', 'translate(' + radius + ', ' + radius + ')')
     .style('fill', '#fff')
     .style('stroke', '#dedede')
     .style('stroke-width', 1);

  loc.append('circle')
     .attr('r', radius - radius/3)
     .attr('transform', 'translate(' + radius + ', ' + radius + ')')
     .style('fill', '#fff')
     .style('stroke', '#dedede')
     .style('stroke-width', 1);

    loc.append("foreignObject")
      .attr("x", radius/3)//function(d) { return d._children ? -8 : -48; }) /*the position of the text (left to right)*/
      .attr("y", 30) /*the position of the text (Up and Down)*/
      .attr("height", "70px")
      .attr("width", "70px")
      .append("xhtml:body")
      .append("p")
        .attr('class', 'donutCenterText')
        .text(function(d) { return d.placeName; })
        .style('font-size', '10px');

  var topicArray = [];
  var topicColors = {};
  var g = loc.selectAll('.arc')
      .data(function(d) {
        var i = 0;
        // TODO (connor) the topics might need to be sorted alphabetically to
        //    assure that labeling is consistent with legend
        for(var topic in d.topics) {
          topicArray.push({num: d.topics[topic], category: topic});
          topicColors[topic] = donutColorsList[i];
          i++;
        }
        console.log(topicArray.length);
        return pie(topicArray); });
      g.enter()
      .append('path')
        .attr('d', arc)
        .attr('transform', 'translate(' + radius + ', ' + radius + ')')
        .attr('class', 'arc')
        .style('fill', function(d) { return topicColors[d.data.category] })//return donutColors(d.value); })
        .style('stroke-width', '10px');
}


/**
 * Constructor for the donuts visualization object.
 * NOTE: THIS IS DEPRECATED
 * container - the object containing the visualization.
 */
function donutsViz (container) {
 var colors = { svgBg: '#FFFFFF' };
 var ids = {};
 ids.vizWrapper = container.id;
 this.container = container;
 this.height = $(container).height();
 this.id = 'donutsViz'+container.id;
 this.width = $(container).width();

 var svgId = 'svgDonutsViz' + container.id;

 this.svg = d3.select(container).append('svg')
   .attr('height', this.height)
   .attr('id', svgId)
   .attr('width', this.width)
   .style('background', colors.svgBg)
   .style('display', 'block')
   .style('height', this.height)
   .style('width', this.width);
 // Test
 this.svg.append('circle')
    .style('fill', '#cc0000')
    .attr('r', 30)
    .attr('cx', 30)
    .attr('cy', 30);

 drawTestDonutOrig(150, 50, this.svg);
 drawTestDonutOrig(400, 50, this.svg);

 ///////////////////////////////////////////////////////////////////////////////
 // FORCE-DIRECTED LAYOUT
 var testJson = {'nodes':[{ 'name': 'Italy'}, { 'name': 'UK'}],
                 'links':[{'source': 1, 'target': 0, 'value': 1}] };
 var nodes = [],
     links = [];


 var force = d3.layout.force()
         .gravity(.05)
         .distance(150)
         .charge(-100)
         .size([this.width/2, this.height/2]);

 force.nodes(testJson.nodes)
   .links(testJson.links)
   .start();

 var link = this.svg.selectAll('.link')
         .data(testJson.links)
         .enter().append('line')
           .attr('class', 'link');

 var node = this.svg.selectAll('.node')
         .data(testJson.nodes)
         .enter().append('g')
           .attr('class', 'node')
           .call(force.drag);
 node.append('text').text('Test.');
 //drawTestDonut(node, this.svg); 

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")"; });
  });
  } 