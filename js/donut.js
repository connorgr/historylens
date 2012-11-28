
/**
 * Constructor for the donuts visualization object.
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

 var svg = d3.select(container).append('svg')
   .attr('height', this.height)
   .attr('id', svgId)
   .attr('width', this.width)
   .style('background', colors.svgBg)
   .style('display', 'block')
   .style('height', this.height)
   .style('width', this.width);
 // Test
 svg.append('circle')
    .style('fill', '#cc0000')
    .attr('r', 30)
    .attr('cx', 30)
    .attr('cy', 30);

 function drawTestDonut () {
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
                  .attr('transform','translate(' + radius*3 + ',' + radius+')');
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
 }
 drawTestDonut();
}
