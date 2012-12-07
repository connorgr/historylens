
/**
 * Constructor for the timeline visualization object.
 * container - the object containing the visualization.
 */
function mapViz (container) {

// Create the Google Map…
var map = new google.maps.Map(d3.select("#areaMainCanvas").node(), {
    zoom: 2,
    center: new google.maps.LatLng(0, 0),
    mapTypeId: google.maps.MapTypeId.TERRAIN
});

// Load the station data. When the data comes back, create an overlay.
data = stations;

  var overlay = new google.maps.OverlayView();

  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "markers");

    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
    overlay.draw = function() {
      var projection = this.getProjection(),
          padding = 10;

      var marker = layer.selectAll("svg")
//          .data(d3.entries(data))
          .data(continents)
          .each(transform) // update existing markers
        .enter().append("svg:svg")
          .each(transform)
          .attr("class", "markers");

      // Add a circle.
      marker.append("svg:circle")
          .attr("r", 4.5)
          .attr("cx", padding)
          .attr("cy", padding);

      // Add a label.
      marker.append("svg:text")
          .attr("x", padding + 7)
          .attr("y", padding)
          .attr("dy", ".31em")
          .text(function(d) { return d.name; });


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
   var testG = marker.append('g')
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

   var dropShadow = marker.append('svg:defs')
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

      function transform(d) {
//        d = new google.maps.LatLng(d.value[1], d.value[0]);
        d = new google.maps.LatLng(d.lat, d.lng);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      }
    };
  };

  // Bind our overlay to the map…
  overlay.setMap(map);

}


