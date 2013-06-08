var f = d3.select('#collection'),
  duration = 2000,
  start = [0,0,0];
d3.select('#container')
  .style('background-color', '#f9e4a9')

function makeArg(_){
  return _.join(',')
}

function make(a1, a2, a3){
  a1 = a1 ? a1 : [0,0];
  a2 = a2 ? a2 : [0,0,0];
  a3 = a3 ? a3 : [1,1];
  return {'translate':a1, 'rotate':a2, 'scale':a3}
}

function applyTransform(s, end) {
  var etrans = end.translate,
    erot = end.rotate,
    escal = end.scale;
  return s.transition()
    .duration(duration)
    .attr('transform', function() { 
      var x = 'translate(' + makeArg(etrans) + ')rotate(' + makeArg(erot) + ')scale(' + makeArg(escal) + ')'
      return x;
    })
}

function tweener(s) {
  d3.select('#canvas')
    .append('g')
    .attr('class', 'message')
    .attr('transform', 'translate(200, 20)')
    .append('g')
    .append('text')
    .style('opacity', 0)
    .text('This is hardly very impressive, I know... but hopefully it illustrates some potential!')
    .transition()
    .duration(1000).delay(1000)
    .style('opacity', 1)

  return s;
}
function rotation(s) {
 return s.transition()
  .duration(1000)
  .attr('transform','translate(200,200)')
  .call(tweener)
  .transition().duration(1000)
  .attr('transform', 'translate(600, 200)scale(-1, 1)')
  .transition().duration(1000)
  .attr('transform','translate(200,200)')
  .transition().duration(1000)
  .attr('transform', 'translate(400, 200)scale(-1, 1)')
  .transition().duration(1000)
  .attr('transform','translate(400,200)')
  .call(ro)
}

function rotate(s) {
 return s.transition()
   .duration(1000)
   .delay(8000)
  .attr('transform','translate(200,200)')
  .call(tweener)
  .transition().duration(1000)
  .attr('transform', 'translate(600, 200)scale(-1, 1)')
  .transition().duration(1000)
  .attr('transform','translate(200,200)')
  .transition().duration(1000)
  .attr('transform', 'translate(400, 200)scale(-1, 1)')
  .transition().duration(1000)
  .attr('transform','translate(400,200)')
}

function ro(s){
  d3.select('#surprise1')
    .attr('transform', 'translate(400, 200)')
    .transition().delay(5000)
    .style('opacity', 1)
  d3.select('#surprise2')
    .transition().delay(5000).duration(1000)
    .attr('transform', 'translate(400, 200)scale(-1, 1)skewY(130)')
    .style('opacity', 1)

  d3.select('#surprise3')
    .attr('transform', 'translate(400,200)scale(-1,1)')
    .transition().delay(5000)
    .style('opacity', 1)
  return s.transition()
    .duration(1000)
    .attr('transform', 'translate(400,200)skewY(50)')
}
function Outer() {
  d3.select('#everything')
    .transition()
    .duration(1000)
    .delay(6000)
    .attr('transform', 'translate(0, 800)scale(1, -1)')
  d3.select('#everything').selectAll('g')
    .transition()
    .duration(1000)
    .delay(7000)
    .attr('transform', 'translate(400, 800)scale(1,-1)')
}

d3.select('#canvas')
  .transition()
  .delay(9000)
  .style('opacity', 0)
d3.select('#container')
  .transition()
  .delay(9000)
  .style('background-color', 'black')

d3.select('#everything').selectAll('g')
  .transition()
  .duration(2000)
  .delay(8000)
  .attr('transform', 'scale(-1,1)')
d3.selectAll('.s').style('opacity', 0)
f.call(rotation)
Outer()
