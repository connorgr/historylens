function initLegend() {
  console.log('Inside the making of legends.');
  console.log($('#areaLegend'));

  $('#areaLegend').append('<p>Test</p>');

  for(topic in options) {
    $('#areaLegend').append('<p>' + topic + '</p>');
  }

  d3.select('#areaLegend')
    .append('svg')
      .attr('width', '1000px')
      .attr('height', '100px')
      .style('background-color', '#ff0000')
          .append('rect');
}