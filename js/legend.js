function initLegend() {
  console.log('Inside the making of legends.');
  console.log($('#areaLegend'));
  $('#areaLegend').append('<p>Test</p>');

  d3.select('#areaLegend')
    .selectAll('svg')
    .append('svg')
      .attr('width', '1000px')
      .attr('height', '100px')
      .style('background-color', '#ff0000')
          .append('rect');
});