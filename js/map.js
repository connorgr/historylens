
/**
 * Constructor for the timeline visualization object.
 * container - the object containing the visualization.
 */
//function mapViz (container) {

    var map;
    
    // Create the Google Map…
    function initMap() {
        map = new google.maps.Map(d3.select("#areaMainCanvas").node(), {
            zoom: 2,
            center: new google.maps.LatLng(0, 0),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        });

        google.maps.event.addListener(map, 'zoom_changed', mapOnZoom); 
        getSummaryDataByLoc(-90, 90, -180, 180, 1, 1810, 2010);    
    }

    function mapOnZoom() {
                // Need further improvement so that we can determine 
            // the set of countries / places to show
            var bounds = map.getBounds();
            var ne = bounds.getNorthEast();
            var sw = bounds.getSouthWest();
            var minLat = sw.lat();
            var maxLat = ne.lat();
            var minLng = sw.lng();
            var maxLng = ne.lng();
            if (this.zoom <= 6) {
                getSummaryDataByTime(minLat, maxLat, minLng, maxLng, 1, 1810, 2010);
//                activeLocations = countries;
            }
            else if (this.zoom > 6) {
                getSummaryDataByTime(minLat, maxLat, minLng, maxLng, 3, 1810, 2010);
//                activeLocations = cities;
//                getSummaryDataByLoc();
            }
    }

  /**
    * This is a hack for getting the D3 map markers to the front of the DOM to
    *   support mouse interaction
    **/
  d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
      this.parentNode.appendChild(this);
    });
  }

  function updateMapView(summary) {
    var overlay = new google.maps.OverlayView();

    var activeLocations = summary;

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
      var mouseLayer = d3.select(this.getPanes().overlayMouseTarget)
          .append('div')
          .attr('class', 'mouseLayer');

      var layer = d3.select(this.getPanes().overlayLayer).append("div")
          .attr("class", "markers");

      // Draw each marker as a separate SVG element.
      // We could use a single SVG, but what size would it have?
      overlay.draw = function() {
        var projection = this.getProjection(),
            padding = 50;

        mouseLayer.selectAll('svg')
          .data(activeLocations, function(d) { return d.key; })
          .each(transform)
          .enter().append('svg:g')
          .each(transform)
            .append('svg:circle')
            .attr('r', 10)
            .on('mouseDown', console.log('mouseLayer activated'));

        layer.selectAll("svg")
            .data(activeLocations, function(d) { return d.key; })
            .exit().remove();

        var marker = layer.selectAll("svg")
            .data(activeLocations, function(d) { return d.key; })                
            .each(transform) // update existing markers
            .enter().append("svg:svg")
            .each(transform)
            .attr("class", "markers");

        marker.append("svg:circle")
            .attr("r", 4.5)
            .attr("cx", padding)
            .attr("cy", padding);

        d3.select('.markers').selectAll('svg:circle')
            .on('mouseup', console.log(this))
            .moveToFront();

        var jsonData = null;
//      drawDonut(marker, layer, jsonData);
     
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
  } 
//}


