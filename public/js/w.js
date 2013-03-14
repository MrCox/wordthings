var content = d3.select('body')
  .append('div')
  .attr('class', 'row')

var input = content.append('div')
  .attr('class', 'large-4 columns')
  .append('input')
  .attr('type', 'text')
  .attr('placeholder', 'put letters here')

var graph = d3.select('body').append('div')
  .attr('class', 'row')
  .append('div')
  .attr('class', 'large-8 columns')
  .style('border', '1px solid #ddd')

var svg = graph.append('svg')

var axis = d3.svg.axis()

input.on('change', function() {
  svg.selectAll('.groups').remove();

  svg.selectAll('.axis').remove();

  var letters = this.value,
    words = wordgen( letters ).groups,
    w = graph[0][0].clientWidth,
    h = d3.max( words, function(d) { 
      try {
        return d.length }
      catch(e) {} }) * 25 + 20,
    l = words.length,
    lens = words.map( function(d) { return d[0].length }),
    wl = d3.max(lens) * l*10 + 20,
    dist = lens.map(function(d, i) { return wl - wl*(2*i + 1)/(2*l) }),
    Lx = d3.scale.ordinal(),
    height,
    width;

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0, 30)')
    .call(axis.scale(Lx.domain(lens).range(dist)).orient('top'))
    if ( h >= d3.select(graph)[0][0].scrollHeight ) {
      height = d3.select('html')[0][0].scrollHeight 
    } else { 
      height = h
    }

    if ( w <= wl ) {
      width = wl
    } else {
      width = w
    }
  
  graph.style('height', height + 'px')
    .style('overflow', 'auto')

  svg.attr('height', h)
    .attr('width',wl) 

  var groups = svg.selectAll('.groups')
    .data( words )

  groups.exit().remove()

  groups.enter()
    .append('g')
    .attr('transform', function(d,i) { try {
      return 'translate(' + Lx(d[0].length) + ',0)'}
      catch(e) {}
    })
    .attr('class', 'groups')
 
  var list = groups.selectAll('.words')
    .data( function(d) { try{return d;} catch(e){} })
    
  list.enter()
    .append('g')
    .attr('class', 'words')
    .attr('transform', function(d, i) { return 'translate(0,' + (25*i + 60) + ')'})
    .append('text')
    .text( function(d) { return d; })

   list.exit().remove()

 })
