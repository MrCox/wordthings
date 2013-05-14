// Map data

var nodes = JSON.parse(GTA_data.nodes),
links = JSON.parse(GTA_data.links)

var b = d3.select(window)[0][0],
  w = b.innerWidth,
  h = b.innerHeight

var messages = {
  'entry-form' : 'GTA policy dictates that name registry field be completed upon form submission.',
  'nodeOff' : 'Adding nodes disabled',
  'nodeOn' : 'Adding nodes enabled',
  'linkOff': 'Adding links disabled',
  'linkOn' : 'Adding links enabled'
}

var classes = {
  'Federation' : 'node Federation',
  'Abolis' : 'node Abolis',
  'Other' : 'node Other',
  'Red Corps' : 'node Red Corps'
}
var validFields = {'name':null, 
  'government':null, 
  'content':null, 
  'target':null, 
  'source':null, 
  'system':null, 
  'cluster':null, 
  'habitat':null
}

d3.select('#panel')
  .style('height', h + 'px')

// defining variables for selections

var panel = d3.select('#innerpanel')
  .style('box-shadow', '1px -1px 3px Ghostwhite'),
  pwidth = panel[0][0].clientWidth

var map = d3.select('#map')
  .style('height', h + 'px')

var collection = d3.select('#collection')

var for_examine = d3.select('#for_examine')

// Map-rendering function

function Map() {
  var linknodes = collection.selectAll('.link')
    .data(links),
    mapnodes = collection.selectAll('.node')
    .data(nodes)

  linknodes.enter().insert('line', 'g')
    .attr('x1', function(d,i) {
      return d.x1
     })
    .attr('y1', function(d) {
      return d.y1
    })
    .attr('x2', function(d) {
      return d.x2
    })
    .attr('y2', function(d) {
      return d.y2
    })
    .attr('class', 'link')
    .on('click', function(d, i) {
      var s = this;
      examine(d, i, s);
    })
    .on('mouseover', function(d, i) {
      var s = this;
      examine(d, i, s);
    })
    .on('mouseout', function(d,i) {
      var s = this;
      examine(d, i, s);
    })
  
  linknodes.exit().remove();

  mapnodes.enter().append('g')
    .attr('transform', function(d, i) {
      return 'translate(' + d.ox + ',' + d.oy + ')'})
    .append('circle')
    .attr('class', function(d) {
      var p = d.government;
      return p in classes ? classes[p] : 'node default'
    })
    .attr('id', function(d) { return d.name })
    .attr('r', 10)
    .style('stroke-width', '2')
    .on('mouseover', function(d,i) { 
      var s = this;
      examine(d, i, s); 
    })
    .on('mouseout', function(d, i) {
      var s = this;
      examine(d, i, s);
    })
    .on('click', function(d, i) {
      var s = this;
      examine(d, i, s);
    })

  mapnodes.exit().remove();
}

Map();

var currentScale = .6 

collection.attr('transform', 'scale(' + currentScale + ')')
d3.select('#canvas').attr('height', 2500 * currentScale).attr('width', 2500*currentScale)

function PlanetBio(src, l){
  if (l) {
    var info = for_examine.append('div')
      .attr('class', 'large-12 columns')
      .attr('id', 'info')
    
    return info;
  }

  var validFields = { 'name':null, 'government':null, 'content':null}
  
  function fields(div) {
    var info = div.style('text-align', 'center')
      .style('border', '1px solid Ghostwhite')
      .style('box-shadow', '1px -1px 3px Ghostwhite')
      .style('margin-top', '10px')
      .style('margin-bottom', '10px')
       
    var type = div.datum().type ? info.append('div')
      .append('h5')
      .style('color', 'Gray')
      .text(function(d) { 
        return '____' + d.type + '____';
      })
      : null;
  
    info.selectAll('.entries')
      .data(function(d) { return d3.entries(d)})
      .enter()
      .append('p')
      .html(function(d) { 
        if (d.key in validFields) {
          return '<div style="text-align:center;"><b>' + d.key + '</b></div><div style = "text-align:center;"><p class="entry">' + d.value + '</p></div>'
        }
      })
    return info;
  }
  var info = for_examine.append('div')
    .attr('class', 'large-12 columns')
    .attr('id', 'info')
    .datum(src)
    .call(fields)

  var f1 = info.datum().system[0].name 
         ? info.selectAll('.sub')
             .data(function(d) { return d.system })
             .enter().append('div')
             .attr('class','large-12 columns')
             .style('box-shadow', '1px -1px 3px Ghostwhite')
             .call(fields)
         : info.datum(function(d){return d.system[0]})

  var f2 = f1.datum().habitat 
         ? f1.selectAll('.subsub')
             .data(function(d) { return d.habitat})
             .enter().append('div')
             .attr('class', 'large-12 columns')
             .style('box-shadow', '1px -1px 3px Ghostwhite')
           .call(fields)
         : new function() {this.datum = function() {return {'satellite':null}}};
    
  if ( f2.datum().satellite ) { 
    f2.selectAll('.subsubsub')
      .data(function(d) { return d.satellite })
      .enter().append('div')
      .attr('class','large-12 columns')
      .style('box-shadow', '1px -1px 3px Ghostwhite')
      .call(fields)
  } 
  return info;
}

function newButton(container, id, title) {
  
  function button() {
    var b = container.append('div')
      .attr('class', 'row')
      .append('div')
      .attr('class', 'large-12 columns')
      .append('a')
      .attr('id', id)
      .attr('class', 'small button round expand')
      .style('box-shadow', '1px -1px 3px Ghostwhite')
      .text(title)
    
    return b
  }
  return button();
}

function examine(d, i, s) {
  var current = d3.select(s),
    ds = d,
    type = d3.event.type

  if (type == 'mouseover') {
    if (current.attr('class')[0] == 'n') {
      var bio = PlanetBio(ds),
        connections = bio.append('div')
          .attr('class', 'large-12 columns')
          .attr('style', 'text-align: center; margin-top: 15px;')
          .html('<b>___Connections___</b>')
            
      d3.selectAll('.link').each( function(d,i) {
        var v;
        if (d.source == ds.name || d.target == ds.name) {
          d3.select(this).style('stroke', '#e60000')
          if (d.source == ds.name) { v = d.target;}
          else if (d.target == ds.name) { v = d.source; }
          d3.selectAll('.node').each(function(da) {
             if (da.name == v) {
               connections.append('div')
                 .style('margin-top', '10px')
                 .style('margin-bottom', '10px')
                 .style('text-align', 'center')
                 .html('<p class = "entry">' + da.name + '</p>')
             };
          });
        };
      });
      if (connections.select('p').empty()) { connections.remove(); }
    }
    else if (current.attr('class')[0] == 'l') {
      PlanetBio(ds, 'link');
    }
  }
  if (type == 'mouseout') {
    d3.select('#info').remove();
    if (current.attr('class')[0] == 'n') {
      d3.selectAll('.link')
        .style('stroke', '#85ffff')
    }
  }
  if (type == 'click') {
    var r = d3.select('#info')
      .attr('id', 'placeholder')

    if (current.attr('class')[0] == 'n') {
      newButton(r, null, 'remove from panel').on('click', function() { 
        d3.select('#placeholder').remove();
      })
    }
  }
}
