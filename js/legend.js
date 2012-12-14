function initLegend() {
  console.log('Inside the making of legends.');
  console.log($('#areaLegend'));

  var legendTopics = [];
  for(topic in options) {
    legendTopics[topic] = { name: options[topic], color: globalColorList[topic]};
  }
  legendTopics.sort();
  for(topic in legendTopics) {
    $('#areaLegend').append('<div class="legendItem"><p>' + legendTopics[topic].color + '||' + '</p></div>');
  }

  d3.select('#areaLegend')
    .append('svg')
      .attr('width', '1000px')
      .attr('height', '100px')
      .style('background-color', '#ff0000')
          .append('rect');
}