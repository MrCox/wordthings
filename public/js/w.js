var input = d3.select('#solver')
  .style('border', '1px solid LightBlue')

var graph = d3.select('#graph').style('text-align', 'center')

var width,
  sum = 0;
input.on('change', function() {
  var v = '/words?rack=' + this.value
  d3.json(v, function(e, j) {
    if (e) console.log(e);
    var w = d3.entries(j)
    width = w.map(function(d) { 
        var m = d3.max(d.value, function(d) { return d.length; })
        sum += m;
        return m;
      }) 
    words(w)
  })
})

function words(set) {
  graph.selectAll('.cols').remove();

  var cols = graph.selectAll('.cols')
    .data(set)

  cols.enter()
    .append('div')
    .attr('class', 'cols')
    .style('float', 'left')
    .style('margin-left', function(d) { return d.key * 1.8 + 'px'})
    .style('margin-right', function(d) { return d.key * 1.8 + 'px'})
    //.style('width', function(d, i) { return width[i] * 100 / sum + '%'; })
    .append('div').attr('style', 'margin-bottom: 10px; text-align: center;')
    .append('p').text(function(d) { return Number(d.key) - 3})
    
  var rows = cols.selectAll('.words')
    .data(function(d) {return d.value})
  
  var words = rows.enter().append('p')
    .text(function(d) { return d.slice(0, d.length - 5)})
  
  sum = 0;
}
