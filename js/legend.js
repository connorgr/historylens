function initLegend() {
  console.log('Inside the making of legends.');
  console.log($('#areaLegend'));

  var topicKeys = options,
      legendTopics = [];
  for(topic in options) {
    var name = options[topic];
    var color = globalColorList[topic];
    legendTopics[topicKeys[topic]] = legendTopics.length;
  }
  console.log('LEGEND TOPICS:');
  console.log(legendTopics);
  topicKeys.sort();
  for(topic in topicKeys) {
    // There's a smarter way to do this.
    $('#areaLegend').append('<div class="legendItem"><p>' + '||' + topicKeys[topic] + '</p></div>');
  }

  d3.select('#areaLegend')
    .append('svg')
      .attr('width', '1000px')
      .attr('height', '100px')
      .style('background-color', '#ff0000')
          .append('rect');
}