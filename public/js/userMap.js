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

var b = window,
  w = b.innerWidth,
  h = b.innerHeight;

map = {};
clickMap = {};

var collection = ds('#collection'),
  canvas = ds('#canvas'),
  controlPanel = ds('#controlPanel'),
  Map = ds('#map'),
  milkyWay = ds('#milkyWay').height(2500).width(2500),
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

map.preRender = function() {
  map.currentScale = h / 2500;
  var center = 2500 / (map.currentScale);

  canvas = ds('#canvas')
    .style('background-color', 'black')
    .height(h)
    .width(w);

  collection.transform(
    'scale(' + map.currentScale + ')' + 
    'translate(' + (center - 2500) / 4 + ',0)'
  );
};

window.onresize = function(event) {
  w = window.innerWidth;
  h = window.innerHeight;
  map.currentScale = h / 2500;
  var center = 2500 / (map.currentScale);

  canvas = ds('#canvas')
    .height(h)
    .width(w)

  collection.transform(
    'scale(' + map.currentScale + ')' + 
    'translate(' + (center - 2500)/4 + ',0)'
  );
};

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

map.buttonData = [ 
 {'id' : 'showLinks', 'text': 'Toggle Links'},
 {'id' : 'planTrip', 'text': 'Plan Trip'}
],

map.graphControlPanel = function() {
  var dats = map.buttonData,
    rows = [dats, []];

  //update row data
  var rows = controlPanel.da('.row')
    .data(rows)
  
  //entering rows
  var rowEnter = rows.enter()
    .append('g')
    .class('row')
    .each(function(d, i) { 
      map.button.apply(this, arguments);
    });

  //exiting rows
  rows.exit().remove();
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

map.rowHeight = h * .08;
map.buttonHeight = h * .04;
map.buttonWidth = w * .08;

map.button = function(d, i) { 
  var height = map.buttonHeight,
    width = map.buttonWidth,
    rheight = map.rowHeight / 2,
    critInd = (d.length - 1) / 2,
    margin = d.length % 2 == 0 ? width / 4 : width / 2,
    center = (w - width) / 2,
    scooch = function(i) {
      return i < critInd ? center - (critInd - i) * width - margin
        : i == critInd ? center
        : center + (i - critInd) * width + margin
    };

  //update data
  var buttons = ds(this).da('.button')
    .data(function() { return d});

  //entering buttons
  var newButtons = buttons.enter().append('g')
    .class('button')
    .transform(function() {
      return 'translate(' + center + ',' + rheight * i + ')'
    });

  newButtons.transition().duration(900)
    .attr('transform', function(d, j) {
      return 'translate(' + scooch(j) + ',' + rheight * i + ')'
    });

  newButtons.append('rect')
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
 
  newButtons.append('text')
    .class('buttonText')
    .transform('translate(' + width / 2 + ',' + height / 2 + ')')
    .text(function(d) {return d.text});

  //exiting buttons
  buttons.exit().remove();
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

map.preRender();
map.renderNodes();
map.graphControlPanel();
