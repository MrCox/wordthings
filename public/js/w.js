var input = d3.select('#solver')
  .style('border', '1px solid LightBlue')

var graph = d3.select('#graph').style('display', 'inline-block')

var width;
input.on('change', function() {
  var w = d3.entries(wordgen(this.value)),
    l = w.length;
  width = (1 / l) * 100;
  words( w );
})

function words(set) {
  var cols = graph.selectAll('.columns')
    .data(set)

  var rows = cols.enter()
    .append('div')
    .style('display', 'inline-block')
    .attr('class', 'columns')
    .style('float', 'left')
    .style('width', function(d) { console.log(width); return width + '%'})
    .selectAll('.words')
    .data(function(d) {return d.value})

  cols.exit().remove();

  var words = rows.enter().append('p')
    .text(function(d) { return d.slice(0, d.length - 5)})

  rows.exit().remove();
}
