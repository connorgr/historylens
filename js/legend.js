function initLegend() {
  console.log('Inside the making of legends.');
  console.log($('#areaLegend'));

  var topicKeys = options;
  var legendTopics = [];
  for(topic in options) {
    legendTopics[topic] = { options[topic]: globalColorList[topic]};
  }
  topicKeys.sort();
  for(topic in topicKeys) {
    $('#areaLegend').append('<div class="legendItem"><p>' + legendTopics[topic].color + '||' + legendTopics[topic].name + '</p></div>');
  }

  d3.select('#areaLegend')
    .append('svg')
      .attr('width', '1000px')
      .attr('height', '100px')
      .style('background-color', '#ff0000')
          .append('rect');
}