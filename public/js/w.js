var content = d3.select('body')
  .append('div')
  .attr('class', 'row')

var input = content.append('div')
  .attr('class', 'large-4 columns')
  .append('input')
  .attr('type', 'text')
  .attr('placeholder', 'put letters here')

var graph = content.append('div')
  .attr('class', 'large-8 columns')
  .style('border', '1px solid #ddd')

var svg = graph.append('svg')

var axis = d3.svg.axis()

input.on('change', function() {
  svg.selectAll('.groups').remove();
  
  var letters = this.value,
    words = wordgen( letters ).groups,
    w = graph[0][0].clientWidth,
    h = d3.max( words, function(d) { return d.length }) * 25,
    l = words.length,
    lens = words.map( function(d) { return d[0].length }),
    dist = lens.map(function(d, i) { return w - w*(2*i + 1)/(2*l) }),
    Lx = d3.scale.ordinal().domain(lens).range(dist),
    height,
    width;
  
  svg.append('g')
    .attr('transform', 'translate(0, 30)')
    .call(axis.scale(Lx).orient('top'))
    .attr('class', 'axis')

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
  
  graph.style('height', height + 'px')
    .style('width', w)
    .style('overflow', 'auto')

  svg.attr('height', h)
    .attr('width', w)

  var groups = svg.selectAll('.groups')
    .data( words )
    .enter()
    .append('g')
    .attr('transform', function(d,i) { return 'translate(' + Lx(d[0].length) + ',0)'})
    .attr('class', 'groups')
 
  var list = groups.selectAll('.words')
    .data( function(d) { return d; })
    .enter()
    .append('g')
    .attr('class', 'words')
    .attr('transform', function(d, i) { return 'translate(0,' + (25*i + 60) + ')'})
    .append('text')
    .text( function(d) { return d; })

 })
