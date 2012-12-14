function initLegend() {
  console.log('Inside the making of legends.');
  console.log($('#areaLegend'));

  var topicKeys = options,
      legendTopics = [];
  var i = 0;
  for(topic in topicKeys) {
    legendTopics[topicKeys[topic]] = i++;
  }
  console.log('LEGEND TOPICS:');
  console.log(legendTopics);
  topicKeys.sort();
  for(topic in topicKeys) {
    // There's a smarter way to do this.
    var curTopic = topicKeys[topic];
    var curColor = globalColorList[legendTopics[curTopic]];
    $('#areaLegend').append('<div class="legendItem"><svg width="15px" height="15px"><rect width="15px" height="15px" style="fill:' + curColor + ';"></rect></svg><p>' + curTopic + '</p></div>');
  }
}