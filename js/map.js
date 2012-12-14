
/**
 * Constructor for the timeline visualization object.
 * container - the object containing the visualization.
 */
//function mapViz (container) {

    var map;
    var minLat = -90;
    var maxLat = 90;
    var minLng = -180;
    var maxLng = 180;
    var regionLevel = 1;
    var overlay;
    var marker;
    var activeLocations;
    var firstLoad = true;
        
    // Create the Google Map…
    function initMap() {
        map = new google.maps.Map(d3.select("#areaMap").node(), {
            zoom: 2,
            center: new google.maps.LatLng(0, 0),
            mapTypeId: google.maps.MapTypeId.TERRAIN
        });

        google.maps.event.addListener(map, 'zoom_changed', mapOnZoom); 
        overlay = new google.maps.OverlayView();
        getSummaryDataByLoc(-90, 90, -180, 180, 1, 1850, 2010);
    }

    function mapOnZoom() {
          // Need further improvement so that we can determine 
      // the set of countries / places to show
      var bounds = map.getBounds();
      var ne = bounds.getNorthEast();
      var sw = bounds.getSouthWest();
      minLat = sw.lat();
      maxLat = ne.lat();
      minLng = sw.lng();
      maxLng = ne.lng();
      /*
      if (this.zoom <= 4) {
        regionLevel = 1;
        getSummaryDataByBoth(minLat, maxLat, minLng, maxLng, 1, 1850, 2010);
      }
      else if (this.zoom == 5) {
        regionLevel = 2;
        getSummaryDataByBoth(minLat, maxLat, minLng, maxLng, 2, 1850, 2010);      
      }
      else if (this.zoom > 6) {
        regionLevel = 3;
        getSummaryDataByBoth(minLat, maxLat, minLng, maxLng, 3, 1850, 2010);
//                getSummaryDataByLoc();
      } */
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

  function updateLocData(data) {
    activeLocations = data;
  }


  function updateMapView() {
    console.log(map.getZoom());
    console.log("map update");

    // Add the container when the overlay is added to the map.
    overlay.onAdd = function() {
        var layer = d3.select(this.getPanes().overlayLayer).append("div")
          .attr("class", "markers");
        
      // Draw each marker as a separate SVG element.
      // We could use a single SVG, but what size would it have?
      overlay.draw = function() {

        var projection = this.getProjection(),
            padding = 50;
        
/*        layer.selectAll("svg")
            .data(activeLocations, function(d) { return d.lat + '-' + d.lng; })
            .exit().remove(); */

        marker = layer.selectAll("svg")
//            .data(activeLocations, function(d) { return d.lat + '-' + d.lng; })
            .data(activeLocations)
            .each(transform) // update existing markers
            .enter().append("svg:svg")
            .each(transform)
            .attr("class", "markers");

        drawDonut(marker);

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
//    console.log(overlay);
//    overlay.draw();
  } 
//}


