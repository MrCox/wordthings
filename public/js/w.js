var content = d3.select('body')
  .append('div')
  .attr('class', 'row')

var input = content.append('div')
  .attr('class', 'large-4 columns')
  .append('input')
  .attr('type', 'text')
  .attr('placeholder', 'put letters here')


var graph = content.append('div')
  .attr('class', 'large-12 columns')
  .style('border', '1px solid #ddd')


function Lx( l , w) { 
  return d3.scale.ordinal().domain(l).rangePoints([0, w], 1 )
}

var svg = graph.append('svg')

input.on('change', function() {
  var letters = this.value,
    words = wordgen( letters ).groups,
    w = d3.select('body')[0][0].scrollWidth,
    h = d3.max( words, function(d) { return d.length }),
    height,
    width;

    console.log( w )
    if ( h >= d3.select('body')[0][0].scrollHeight ) {
      height = d3.select('body')[0][0].scrollHeight 
    } else { 
      height = h
    }

    if ( w <= 28 * words.length ) {
      width = 28 * words.length 
    } else {
      width = w
    }
  
  var cols = Lx( words, w )

  graph.style('height', height )
    .style('width', w)
    .style('overflow', 'auto')

  var groups = svg.selectAll('.groups')
    .data( words )
    .enter()
    .append('g')
    .attr('transform', function(d) { return 'translate(' + cols( d ) + ',0)'})
    .attr('class', 'groups')

  var w = groups
    .selectAll('.words')
    .data( function(d) { return d; })
    .enter()
    .append('g')
    .attr('class', 'words')
    .attr('transform', function(d, i) { return 'translate(0,' + (i+1) * 25 + ')'})
    .append('text')
    .text( function(d) { return d; })
 })
