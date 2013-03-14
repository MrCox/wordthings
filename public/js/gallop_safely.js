
var b = d3.select(window)[0][0],
  w = b.innerWidth,
  h = b.innerHeight

console.log(w)
console.log(h)

var frame = d3.select('body')
  .append('div')
  .attr('class', 'large-12 columns')
  .attr('width', w)
  .attr('height', h)
  .attr('overflow', 'auto')
  .append('svg')

var collection = frame.append('g')

collection.append('image')
  .attr('xlink:href', '/public/css/map.png')
  .attr('viewBox', '0 0 2500 2500')
  .attr('preserveAspectRatio', 'none')
  .attr('width', w)
  .attr('height', h)

collection.selectAll('.node')
  .data(GTA_data)
  .enter()
  .append('svg:circle')
  .attr('cx', function(d) { return d.location[0]})
  .attr('cy', function(d) { return d.location[1]})
  .attr('r', 10)
  .attr('class', 'node')
  .style('fill', 'red')
