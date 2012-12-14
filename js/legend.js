function initLegend() {
  console.log('Inside the making of legends.');
  console.log($('#areaLegend'));

  var topicKeys = options,
      legendTopics = [];
  for(topic in options) {
    var name = options[topic];
    var color = globalColorList[topic];
    legendTopics[topic] = {};
    legendTopics[topic][name] = color;// = { name: color };
  }
  topicKeys.sort();
  for(topic in topicKeys) {
    $('#areaLegend').append('<div class="legendItem"><p>' + legendTopics[topic].color + '||' + topicKeys[topic] + '</p></div>');
  }

  d3.select('#areaLegend')
    .append('svg')
      .attr('width', '1000px')
      .attr('height', '100px')
      .style('background-color', '#ff0000')
          .append('rect');
}