
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

    google.maps.event.addListener(map, 'zoom_changed', setActiveLocations);

    var overlay = new google.maps.OverlayView();

    var activeLocations = continents;

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayLayer).append("div")
            .attr("class", "markers");

        // Draw each marker as a separate SVG element.
        // We could use a single SVG, but what size would it have?
        overlay.draw = function() {
            var projection = this.getProjection(),
                padding = 50;

            layer.selectAll("svg")
                .data(activeLocations, function(d) { console.log(d.name); return d.name; })
                .exit().remove();

            var marker = layer.selectAll("svg")
                .data(activeLocations, function(d) { console.log(d.name); return d.name; })                
                .each(transform) // update existing markers
                .enter().append("svg:svg")
                .each(transform)
                .attr("class", "markers");

            var jsonData = null;
            drawDonut(marker, layer, jsonData);
     
            function transform(d) {
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

    function setActiveLocations() {
                // Need further improvement so that we can determine 
            // the set of countries / places to show
            if (this.zoom <= 4) {
                activeLocations = continents;
            }
            else if (this.zoom > 4 && this.zoom <= 6) {
                activeLocations = countries;
            }
            else if (this.zoom > 6) {
                activeLocations = cities;
            }
    }
}


