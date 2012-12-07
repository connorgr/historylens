
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

    var overlay = new google.maps.OverlayView();

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayLayer).append("div")
            .attr("class", "markers");

        // Draw each marker as a separate SVG element.
        // We could use a single SVG, but what size would it have?
        overlay.draw = function() {
            var projection = this.getProjection(),
                padding = 50;

            var marker = layer.selectAll("svg")
                .data(continents)
                .each(transform) // update existing markers
                .enter().append("svg:svg")
                .each(transform)
                .attr("class", "markers");

            drawTestDonut(marker, layer);
     
            function transform(d) {
                d = new google.maps.LatLng(d.lat, d.lng);
                d = projection.fromLatLngToDivPixel(d);
                return d3.select(this)
                    .style("left", (d.x - padding) + "px")
                    .style("top", (d.y - padding) + "px");
            }

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
                    .attr('transform', 'translate(' + radius + ', ' + radius + ')')
                    .style('fill', function(d) { return color(d.value); });
                g.append('text')
                    .attr('transform', function(d) { return 'translate('+arc.centroid(d)+')'})
                   .attr('transform', 'translate(' + radius + ', ' + radius + ')')
                   .attr('text-anchor', 'middle')
                   .attr('dy', '.35em')
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
                   .attr('transform', 'translate(' + radius + ', ' + radius + ')')
                   .style('fill', '#fff')
                   .style('opacity', .8)
                   .style('stroke', '#ccc')
                   .style('stroke-width', 3);
                   
               // NOTE: an optimization would use an svg filter to prevent having to
               //  render twice
               node.append('circle')
                   .attr('r', radius - radius/3)
                   .attr('transform', 'translate(' + radius + ', ' + radius + ')')
                   .style('fill', '#fff')
                   .style('stroke', '#dedede')
                   .style('stroke-width', 1);

               node.append('text')
                   .text(function(d) { return d.name; })
                   .attr('class', 'donutCenterText')
                   .attr('text-anchor', 'middle')
                   .attr('transform', 'translate(' + radius + ', ' + radius + ')');
            }

      
    };
  };

  // Bind our overlay to the map…
  overlay.setMap(map);

}


