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
    words = d3.values(wordgen( letters ))
  console.log(words)
    var w = graph[0][0].clientWidth,
    h = d3.max( words, function(d) { 
        return d.length }) * 25 + 20,
    l = words.length,
    wl = d3.max(words, function(d) { return d[0].length}) * 9 * l + 20,
    lens = words.map( function(d) { return d[0].length }),
    dist = lens.map(function(d, i) { return wl - wl*(2*i + 1)/(2*l) }),
    Lx = d3.scale.ordinal(),
    height,
    width;

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0, 30)')
    .call(axis.scale(Lx.domain(lens).range(dist)).orient('top'))
    
    if ( h >= d3.select('html')[0][0].clientHeight ) {
      height = d3.select('html')[0][0].clientHeight
    } else { 
      height = h
    }

  graph.style('height', height)
    .style('overflow', 'auto')

  svg.attr('height', h)
    .attr('width', wl)

  var groups = svg.selectAll('.groups')
    .data( words )

  groups.exit().remove()

  groups.enter()
    .append('g')
    .attr('transform', function(d,i) { 
      return 'translate(' + Lx(d[0].length) + ',0)'
    })
    .attr('class', 'groups')
 
  var list = groups.selectAll('.words')
    .data( function(d) { return d; })
    
  list.enter()
    .append('g')
    .attr('class', 'words')
    .attr('transform', function(d, i) { return 'translate(0,' + (25*i + 60) + ')'})
    .append('text')
    .text( function(d) { return d; })

  list.exit().remove()

 })
