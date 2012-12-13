
/**
  * This function draws a donut visualization on an SVG canvas
  * locGroup {svg:g} - a location group to draw the donut in
  * data {json} - the data that the donut will use
  *
  */
function drawDonut(d3Selection, data) {
  // if (typeof data === 'undefined') {
  //   throw { 
  //     name:        "JSON undefined", 
  //     message:     "Undefined JSON Error. Undefined json passed to drawDonut."
  //   } 
  // } else if (data === null) {
  //   data = { num: 1};
  // }
  data = [{ num:'50' }, { num:'6' }, { num:'6' }, { num:'6' }, { num:'6' }, {num:'3'}, {num:'1'}, { num:'6' }, {num:'10'} ];

  var radius = 50,
      donutColorsList = ['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56',
          '#d0743c', '#ff8c00'],
      donutColors = d3.scale.ordinal().range(donutColorsList),
      arc = d3.svg.arc().outerRadius(radius).innerRadius(radius - radius/3),
      pie = d3.layout.pie().sort(null).value(function(d) { return d.num; });

  var loc = d3Selection.append('g');

  //loc.append('circle').attr('r', 100);
  loc.append('circle')
     .attr('r', radius - radius/3)
     .attr('transform', 'translate(' + radius + ', ' + radius + ')')
     .style('fill', '#fff')
     .style('stroke', '#dedede')
     .style('stroke-width', 1);

    loc.append("foreignObject")
      .attr('class', 'donutCenterText')
      .attr("height", "100px")
      .attr("width", "100px")
      .attr("x", 0)//function(d) { return d._children ? -8 : -48; }) /*the position of the text (left to right)*/
      .attr("y", 0) /*the position of the text (Up and Down)*/
      .append("xhtml:body")
      .append("p")
      .text(function(d) { return d.placeName; });

   // loc.append('text')
   //     .text(function(d) { return (d.placeName).replace(/\s/g, "\n"); })//'Hi, Hua!')
   //     .attr('class', 'donutCenterText')
   //     .attr('text-anchor', 'middle')
   //     .attr('transform', 'translate(' + radius + ', ' + radius + ')');

  var g = loc.selectAll('.arc')
      .data(pie(data))
      .enter()
        .append('g')
        .attr('class', 'arc');
  g.append('path').attr('d', arc)
    .attr('transform', 'translate(' + radius + ', ' + radius + ')')
    .style('fill', function(d) { return donutColors(d.value); });
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
 drawTestDonut(node, this.svg); 

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")"; });
  }); 

 ///////////////////////////////////////////////////////////////////////////////
 // TEST FUNCTIONS
 function drawTestDonut(node, svg) {
  var data = [{ num:'50' }, { num:'6' }, { num:'6' }, { num:'6' }, { num:'6' }, {num:'3'}, {num:'1'}, { num:'6' }, {num:'10'} ];
   var radius = 50;
   var color = d3.scale.ordinal().range(['#98abc5', '#8a89a6', '#7b6888',
       '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
   var arc = d3.svg.arc().outerRadius(radius).innerRadius(radius - radius/3);
   var pie = d3.layout.pie()
               .sort(null)
               .value(function(d) {
                 return d.num;
               });

   var g = node.selectAll('.arc').data(pie(data)).enter().append('g')
              .attr('class', 'arc');
   g.append('path').attr('d', arc)
     .style('fill', function(d) { return color(d.value); });
   g.append('text')
     .attr('transform', function(d) { return 'translate('+arc.centroid(d)+')'})
     .attr('dy', '.35em')
     .attr('text-anchor', 'middle')
     .text(function(d) { return d.num });

   var dropShadow = svg.append('svg:defs')
     .append('svg:filter')
     .attr('id', 'dropShadow')
       .append('svg:feGaussianBlur').attr('stdDeviation', 2.5)
       .append('svg:feOffset').attr('result', 'offOut').attr('in','SourceAlpha')
           .attr('dx', 20).attr('dy', 20)
       .append('svg:feBlend').attr('in', 'SourceGraphic').attr('in2', 'blurOut')
           .attr('mode', 'normal');

   node.append('circle')
     .attr('filter', 'url(#dropShadow)')
     .attr('r', radius - radius/3)
     .style('fill', '#fff')
     .style('opacity', .8)
     .style('stroke', '#ccc')
     .style('stroke-width', 3);
// NOTE: an optimization would use an svg filter to prevent having to
//  render twice
   node.append('circle')
     .attr('r', radius - radius/3)
     .style('fill', '#fff')
     .style('stroke', '#dedede')
     .style('stroke-width', 1);

   node.append('text')
     .text('Test Title')
     .attr('class', 'donutCenterText')
     .attr('text-anchor', 'middle');
 }

 
 function drawTestDonutOrig (x, y, svg) {
   var data = [{ num:'50' }, { num:'6' }, { num:'6' }, { num:'6' }, { num:'6' }, {num:'3'}, {num:'1'}, { num:'6' }, {num:'10'} ];
   var radius = 50;
   var color = d3.scale.ordinal().range(['#98abc5', '#8a89a6', '#7b6888',
       '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);
   var arc = d3.svg.arc().outerRadius(radius).innerRadius(radius - radius/3);
   var pie = d3.layout.pie()
               .sort(null)
               .value(function(d) {
                 return d.num;
               });
   var testG = svg.append('g')
                  .attr('transform','translate(' + x + ',' + y + ')');
//                  .attr('transform','translate(' + radius*3 + ',' + radius+')');
   var g = testG.selectAll('.arc').data(pie(data)).enter().append('g')
              .attr('class', 'arc');
   g.append('path').attr('d', arc)
     .style('fill', function(d) { return color(d.value); });
   g.append('text')
     .attr('transform', function(d) { return 'translate('+arc.centroid(d)+')'})
     .attr('dy', '.35em')
     .attr('text-anchor', 'middle')
     .text(function(d) { return d.num });

   var dropShadow = svg.append('svg:defs')
     .append('svg:filter')
     .attr('id', 'dropShadow')
       .append('svg:feGaussianBlur').attr('stdDeviation', 2.5)
       .append('svg:feOffset').attr('result', 'offOut').attr('in','SourceAlpha')
           .attr('dx', 20).attr('dy', 20)
       .append('svg:feBlend').attr('in', 'SourceGraphic').attr('in2', 'blurOut')
           .attr('mode', 'normal');

   testG.append('circle')
     .attr('filter', 'url(#dropShadow)')
     .attr('r', radius - radius/3)
     .style('fill', '#fff')
     .style('opacity', .8)
     .style('stroke', '#ccc')
     .style('stroke-width', 3);
// NOTE: an optimization would use an svg filter to prevent having to
//  render twice
   testG.append('circle')
     .attr('r', radius - radius/3)
     .style('fill', '#fff')
     .style('stroke', '#dedede')
     .style('stroke-width', 1);

   testG.append('text')
     .text('Test Title')
     .attr('class', 'donutCenterText')
     .attr('text-anchor', 'middle');
   return testG;
 }
}
