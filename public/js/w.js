var content = d3.select('body')
  .append('div')
  .attr('class', 'row')

var input = content.append('div')
  .attr('class', 'large-4 columns')
  .append('input')
  .attr('type', 'text')
  .attr('placeholder', 'put letters here')

var graph = content.append('div')
  .attr('class', 'row')
  .append('div')
  .attr('class', 'large-12 columns')
  .style('border', '1px solid #ddd')

var width = content[0][0].clientWidth,
  height = content[0][0].clientHeight

var xScale = d3.scale.linear().domain([2, 28]).range([0, width]) 

input.on('change', function() {
  console.log('shit')
  var letters = this.value
  var words = wordgen( letters )

  graph.selectAll('.words')
    .data( words )
    .enter()
    .append('p')
    .text( function(d) {return d})
    .style('fill', 'DarkSlateGray')
 })
