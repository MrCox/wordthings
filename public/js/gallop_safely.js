
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
  .append('svg')
  .attr('height', h)
  .attr('width', '130%')
  
panel.append('text')
  .attr('x', 20)
  .attr('y', 30)
  .style('fill', 'yellow')
  .text('Tomorrow, a control panel will be ')

panel.append('text')
  .attr('x', 20)
  .attr('y', 55)
  .style('fill', 'yellow')
  .text('here, with a bunch of settings.')

panel.append('text')
  .attr('x', 20)
  .attr('y', 80)
  .style('fill', 'yellow')
  .text('For now, click on the map to add a circle!')

panel.append('text')
  .attr('x', 20)
  .attr('y', 105)
  .style('fill', 'yellow')
  .text('The circles will represent galloping locations.')

panel.append('text')
  .attr('x', 20)
  .attr('y', 130) 
  .style('fill', 'yellow')
  .text('--Until tomorrow!')

var map = frame.append('div')
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

collection.on('click', function() {
  var coordinates = {'lx':d3.event.layerX, 'ly':d3.event.layerY,
    'ox':d3.event.offsetX, 'oy':d3.event.offsetY}

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
    .style('stroke', '#00ff00')
})

 
