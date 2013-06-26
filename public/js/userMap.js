 //Map data
d3.select('#map').style('width', '100%')
var ds = d3.select,
  da = d3.selectAll,
  attrs = ['x', 'y', 'transform', 'cx', 'r', 'cy', 'class', 'id', 'height', 'width']

d3.selection.prototype.ds = function(_){return this.select(_)};
d3.selection.prototype.da = function(_){return this.selectAll(_)};
attrs.forEach(function(a) { 
  d3.selection.prototype[a] = function(_) { 
    if (!arguments.length) 
      return this.attr(a);
    return this.attr(a, _);
  };
});

var map = {},
  clickMap = {};

// Click handlers

clickMap.showLinks = function(d, i) { 
    var modeMap = {'1':'0', '0':'1'},
      mode = ds(this).attr('mode'),
      text = ds(this).select('.buttonText'),
      textMap = {'0' : 'Untoggle Links', '1': 'Toggle Links'};
   
    ds(this).attr('mode', modeMap[mode])
    text.text(textMap[mode])
    if (mode == '0')
      map.renderLinks();
    if (mode == '1') 
      map.renderLinks([]);
};

map.currentScale = .6;

var b = ds(window)[0][0],
  w = b.innerWidth,
  h = b.innerHeight,
  collection = ds('#collection')
    .attr('transform', 'scale(' + map.currentScale + ')'),
  canvas = ds('#canvas')
    .attr('height', 2500 * map.currentScale)
    .attr('width', 2500*map.currentScale),
  controlPanel = ds('#controlPanel'),
  Map = ds('#map')
    .style('height', h + 'px'),
  classes = {
      'Federation' : 'node Federation',
      'Abolis' : 'node Abolis',
      'Other' : 'node Other',
      'Red Corps' : 'node Red Corps'
    },
  validFields = {
      'name':null, 
      'government':null, 
      'content':null, 
      'target':null, 
      'source':null, 
      'system':null, 
      'cluster':null, 
      'habitat':null
    },
    centered;

map.links = JSON.parse(GTA_data.links);

map.nodes = JSON.parse(GTA_data.nodes).map(function(d) { 
  var name = d.name, links = map.links;
  d.links = []; 
  for (var i in links) {
    var source = links[i].source,
      target = links[i].target;
    if (source == name || target == name)
      d.links.push(links[i]);
  };
  return d;
});

var percent = function(d) {
  return +d.slice(0, d.length - 2) / 100
};
map.rowHeight = map.currentScale * 90;
map.button = function(d, i, D) {
  var button = ds(this).append('g'),
    w = 2500 * map.currentScale,
    height = .06 * h,
    width = .08 * w,
    rheight = map.rowHeight / 2,
    critInd = (D.length - 1) / 2,
    margin = D.length % 2 == 0 ? width / 4 : width / 2,
    center = (w - width) / 2,
    scooch = function(i) {
      return i < critInd ? center - (critInd - i) * width - margin
        : i == critInd ? center
        : center + (i - critInd) * width + margin
    };

  button.transform(function() {
      return 'translate(' + center + ',' + rheight + ')'
    });

  button.transition().duration(900)
    .attr('transform', function(d) {
      return 'translate(' + scooch(i) + ',' + rheight + ')'
    });

  button.append('rect')
    .attr('class','button')
    .attr('mode', '0')
    .attr('height', height)
    .attr('width', width)
    .attr('id', function(d) { return d.id})
    .on('click', function(d, i) { 
      clickMap[ds(this).id()].apply(this, arguments);
    })
    .on('mouseover', function() { 
      ds(this).style('fill', 'GhostWhite')
    })
    .on('mouseout', function() {
      ds(this).style('fill', '#85ffff')
    });
 
  button.append('text')
    .class('buttonText')
    .transform('translate(' + width / 2 + ',' + height / 2 + ')')
    .text(function(d) {return d.text});

    return button;
};

map.graphControlPanel = function() {
  var button = map.button,
   dats = [ 
     {'id' : 'showLinks', 'text': 'Toggle Links'},
    ],
    rows = [dats, []];

  var rows = controlPanel.da('.row')
    .data(rows)
    .enter().append('g')
    .class('row');

  var cg = rows.selectAll('.button')
    .data(dats)
    .enter()
    .append('g')
    .each(function(d, i) { 
      button.call(this, d, i, dats);
    })
};

map.zoom = function(d) {
  var x, y, k = map.currentScale;
  if (d.name != centered) {
    k = 1.8 * k;
    x = d.ox * k;
    y = d.oy * k;
    centered = d.name;
    collection.transition()
      .duration(1000)
      .attr('transform','scale(' + k + ')' 
        + 'translate(' + (w / 2 - x) + ',' + (h / 2 - y) + ')');
  } else {
    k = map.currentScale;
    centered = null;
    collection.transition()
      .duration(1750)
      .attr('transform', 'scale(' + k + ')');
  }
};

//soon to be event router
map.examine = function(d, i, s) {
  var thisThing = ds(s)
  if (d3.event.type == 'click')
    map.zoom(d);
};

// Map-rendering function
map.renderLinks = function(array) {
  var data = map.links;
  if (array) data = array;
  var linknodes = collection
    .selectAll('.link')
    .data(data);

  var coords = function(s) {
    return s.attr('x1', function(d) { 
        return +d.x1
      })
      .attr('x2', function(d) {
        return +d.x2
      })
      .attr('y1', function(d) { 
        return +d.y1 
      })
      .attr('y2', function(d) {
        return +d.y2 
      })
  }

  linknodes
    .call(coords);

  linknodes.enter().insert('line', 'g')
    .call(coords)
    .attr('class', 'link');
  linknodes.exit().remove();
}

map.renderNodes = function() {
  var nodes = map.nodes;
  var mapnodes = collection.selectAll('.node')
    .data(nodes)

  var nodeG = mapnodes.enter().append('g')
    .attr('transform', function(d, i) {
      return 'translate(' + d.ox + ',' + d.oy + ')'})

  nodeG.append('text')
    .attr('class', 'nodeTitle')
    .attr('transform', 'translate(20, 0)')
    .text(function(d) { return d.name})

  nodeG.append('circle')
    .attr('class', function(d) {
      var p = d.government;
      return p in classes ? classes[p] : 'node default'
    })
    .attr('id', function(d) { return d.name })
    .attr('r', 10)
    .style('stroke-width', '4')
    .on('mouseover', function(d,i) { 
      var s = this;
      map.examine(d, i, s); 
      map.renderLinks(d.links);
    })
    .on('mouseout', function(d, i) {
      var s = this;
      map.examine(d, i, s);
      var mode = ds('#showLinks').attr('mode')
      if (mode == '0') { 
        map.renderLinks([]);
      } else if (mode == '1') {
        map.renderLinks();
      }
    })
    .on('click', function(d, i) {
      var s = this;
      map.examine(d, i, s);
    })
  mapnodes.exit().remove();
};

map.renderNodes();
map.graphControlPanel();
