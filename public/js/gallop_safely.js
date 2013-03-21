
var b = d3.select(window)[0][0],
  w = b.innerWidth,
  h = b.innerHeight

var frame = d3.select('body').append('div')
  .style('white-space', 'nowrap')
  .style('overflow', 'hidden')

var panel = frame.append('div')
  .style('width', '20%')
  .style('height', h + 'px')
  .style('border', 'solid 1px #00ff00')
  .style('display', 'inline-block')
  .style('background', '#00001e')
  .style('overflow', 'auto')

var map = frame.append('div')
  .attr('class', 'large-8 columns')
  .style('width', '80%')
  .style('height', h + 'px')
  .style('display', 'inline-block')
  .style('overflow', 'auto')
  .append('svg')
  .attr('width', 2500)
  .attr('height', 2500)

var collection = map.append('g')

collection.append('image')
  .attr('xlink:href', '/public/css/map.png')
  .attr('width', 2500)
  .attr('height', 2500)

collection.selectAll('.node')
  .data(GTA_data)
  .enter()
  .append('g')
  .attr('transform', function(d) { return 'translate(' + d.location[0] + ',' + d.location[1] + ')'})
  .append('svg:circle')
  .attr('r', 10)
  .attr('class', 'node')
  .style('fill', 'red')

collection.on('click', function() {
  console.log(d3.event)
  var coordinates = {'lx':d3.event.layerX, 'ly':d3.event.layerY,
    'ox':d3.event.offsetX, 'oy':d3.event.offsetY}

  console.log(coordinates)

  collection.append('g')
    .datum( coordinates )
    .attr('transform', function() {
      var x = coordinates.ox || coordinates.lx,
        y = coordinates.oy || coordinates.ly
      return 'translate(' + x + ',' + y + ')'})
    .append('circle')
    .attr('class', 'node')
    .attr('r', 10)
    .style('fill', 'blue')
})

 
