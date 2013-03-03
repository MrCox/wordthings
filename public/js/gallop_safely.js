var fill = d3.scale.category20(),
  currentpos = [50, 50],
  currentsize = [1500, 1500],
  nodes = []

var pic = d3.select('body')
  .style('background-color', 'black')
  .append('div')
  .style('background-image', 'url("/public/css/map.png")')
  .style('background-repeat', 'no-repeat')
  .style('background-position', '50% 50%')
  .style('background-size', '1500px 1500px')

var vis = d3.select('div')
  .append('svg:svg')
  .attr('pointer-events', 'all')

//vis.call(d3.behavior.zoom().scaleExtent([.75, 1.5]).on('zoom', zoom))
vis.call(d3.behavior.drag().on('drag', drag))
vis.on('mousedown', function() {  console.log(d3.event) })

var nodes = vis.selectAll('node')
   .data(GTA_data)
   .enter()
   .append('circle')
   .attr('class', 'node')
   .attr('cx', function(d, i) { nodes[i] = [d.location[0]]; return nodes[i][0] + '%'; })
   .attr('cy', function(d, i) { nodes[i].push(d.location[1]); return nodes[i][1] + '%'; })
   .attr('r', 10)
   .attr('fill-opacity', 1)
   .style('fill', 'yellow')
 
function drag() {
    var np1 = currentpos[0] - d3.event.dx * 100 / 1500
    var np2 = currentpos[1] - d3.event.dy * 100 / 1500
    
    if (np1 > 100) { currentpos[0] = 100 } 
    else if (np1 < 0) { currentpos[0] = 0 }
    else { currentpos[0] = np1 };

    if (np2 > 100) { currentpos[1] = 100 }
    else if (np2 < 0) { currentpos[1] = 0}
    else { currentpos[1] = np2 };

    pic.style('background-position', currentpos[0] + '% ' + currentpos[1] + '%')
    
    nodes.transition().duration(0)
        .attr('cx', function(d, i) {
           var n = nodes[i][0] - d3.event.dx * 100 / 1500

           if ( n > 100 ) { nodes[i][0] = 100}
           else if ( n < 0 ) { nodes[i][0] = 0 }
           else { nodes[i][0] = n } 
           console.log( nodes[i][0] )

           return nodes[i][0] + '%'
        })
        .attr('cy', function(d, i) {
           var n = nodes[i][1] - d3.event.dy * 100/1500
           
           if ( n>100 ) { nodes[i][1] = 100 }
           else if ( n < 0 ) { nodes[i][1] = 0 }
           else { nodes[i][1] = n }
           console.log( nodes[i][1] )

           return nodes[i][1] + '%'
        })
}

//function zoom() {
 //   var ns1 = currentsize[0] * d3.event.scale
  //  var ns2 = currentsize[1] * d3.event.scale
//
 //   if ( ns1 > 5000 ) { currentsize[0] = 5000 }
  //  else if ( ns1 < 1300 ) { currentsize[0] = 1300 }
   // else { currentsize[0] = ns1 }

//    if ( ns2 > 5000 ) { currentsize[1] = 5000 }
 //   else if ( ns2 < 1300 ) { currentsize[1] = 1300 }
  //  else { currentsize[1] = ns2 }

   // var Ns1 = node_size * d3.event.scale

    //if (Ns1 > 1.6665) { node_size = 1.6665 }
    //else if ( Ns1 < 4.3333 ) { node_size = 4.3333 }
    //else {node_size = node_size * d3.event.scale} 

    //pic.style('background-size', currentsize[0] + 'px ' + currentsize[1] + 'px' )
    //nodes.attr('r', function() { return node_size })
//}
