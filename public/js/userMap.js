//modifying selection prototype
var ds = d3.select,
  da = d3.selectAll,
  attrs = ['x', 'fill', 'y', 'transform', 'cx', 'r', 'cy', 'class', 'id', 'height', 'width']

d3.selection.prototype.ds = function(_){return this.select(_)};
d3.selection.prototype.da = function(_){return this.selectAll(_)};
attrs.forEach(function(a) { 
  d3.selection.prototype[a] = function(_) { 
    if (!arguments.length) 
      return this.attr(a);
    return this.attr(a, _);
  };
});

//global map object
map = {};
clickMap = {};

var b = window,
  w = b.innerWidth,
  h = b.innerHeight,
  collection = ds('#collection'),
  container = ds('#container'),
  logo = ds('#logo'),
  canvas = ds('#canvas').style('background-color', 'black'),
  controlPanel = ds('#controlPanel'),
  Map = ds('#map').style('width', '100%'),
  advert = ds('#advert').style('visibility', 'hidden'),
  milkyWay = ds('#milkyWay').height(2500).width(2500),
  plotRoute = ds('#plotRoute').transform('translate(0,' + .05 * h + ')'),
  title = ds('#title')
      .on('mouseover', function() { 
          ds(this).da('.official')
            .style('stroke-width', '2px');
          advert.style('visibility', null);
       }).on('mouseout', function() { 
          ds(this).da('.official')
            .style('stroke-width', '1px');
          advert.style('visibility', 'hidden');
       }),
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
    percent = function(d) { return +d.slice(0, d.length - 2) / 100 },
    centered,
    factor = 1,
    currentScale = h / 2500,
    currentMode = 'examine';

//getter-setters
map.factor = function(_) { 
  if (!arguments.length) return factor;
  factor = _;
  return factor;
};
map.currentScale = function(_) {
  if (!arguments.length) return currentScale;
  currentScale = _;
  return currentScale;
};
map.currentMode = function(_) {
  if (!arguments.length) return currentMode;
  currentMode = _;
  return currentMode;
};
map.rowHeight = function(h) { return h * .08; };
map.buttonHeight = function(h) { return h * .03;};
map.buttonWidth = function(w) { return w * .06; };

//data
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

map.vertices = [];

map.buttonData = [ 
  {'id' : 'showLinks', 'text': 'Toggle Links'},
  {'id' : 'planTrip', 'text': 'Plan Trip'}
];

//utilities
map.applyScale = function() { 
  w = window.innerWidth;
  h = window.innerHeight;

  var scale = map.currentScale((h / 2500) * map.factor()),
    center = 2500 / scale;

  container.transform(
      'translate(' + -w * .03 + ',' + h * .11 + ')'
    );

  logo.transform(
      'translate(' + -w * .03 + ',' + -h * .02 + ')'
    );

  canvas.attr('height', h * map.factor())
    .attr('width', w * map.factor());

  collection.transform(
    'scale(' + map.currentScale() + ')' + 
    'translate(' + (center - 2500)/4 + ',0)'
  );
};

map.scooch = function(critInd, center, width, margin) {
  return function(i) {
    return i < critInd ? center - (critInd - i) * width - margin
      : i == critInd ? center
      : center + (i - critInd) * width + margin
  };
};

map.zoom = function(d) {
  var x, y, k = map.currentScale();
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
    k = map.currentScale();
    center = 2500 / k;
    centered = null;
    collection.transition()
      .duration(1000)
      .attr('transform',
        'scale(' + k + ')' + 
        'translate(' + (center - 2500) / 4 + ',0)'
      );
  }
};

map.buttonEvents = function(s) { 
  return s.on('click', function(d, i) { 
      clickMap[ds(this).id()].apply(this, arguments);
    })
    .on('mouseover', function() { 
      ds(this).style('fill', 'GhostWhite')
        .style('stroke-width', '3px')
    })
    .on('mouseout', function() {
      ds(this).style('fill', '#85ffff')
        .style('stroke-width', '2px')
    });
};

map.Path = function() {
  var w = window.innerWidth,
    h = window.innerHeight,
    data = map.vertices,
    rheight = map.rowHeight(h) / 2,
    critInd = (data.length - 1) / 2,
    width = 20, 
    margin = data.length % 2 == 0 ? width / 4 : width / 2,
    center = (w - width) / 2,
    scooch = map.scooch(critInd, center, width, margin);

  //updateData
  var vertex = ds(this)
    .da('.vertex')
    .data(data);

  //current selection
  vertex.transition()
    .attr(function(d, i) { 
      'translate(' + scooch(i) + ',' + rheight + ')' 
    });

  vertex.class(function(d) {
    var p = d.government;
    return p in classes ? classes[p] : 'node default';
  });

  //entering selection
  var newVertices = vertex.enter()
    .append('g').transform(function(d, i) {
      return 'translate(' + scooch(i) + ',' + rheight + ')';
    }).class('vertex')
    
  newVertices.append('circle')
    .class('node')
    .attr('class', function(d) {
      var p = d.government;
      return p in classes ? classes[p] : 'node default'})
    .attr('r', 10)
    .style('stroke-width', '4');

  newVertices.append('text')
    .transform('translate(0,20)')
    .style('text-anchor', 'middle')
    .text(function(d) {return d.name});

  //exiting selection
  vertex.exit()
    .transition()
    .attr('transform', 'scale(0)')
    .style('opacity', 0);
};

map.button = function(d, i) { 
  var w = window.innerWidth,
    h = window.innerHeight,
    height = map.buttonHeight(h),
    width = map.buttonWidth(w),
    rheight = map.rowHeight(h) / 2,
    critInd = (d.length - 1) / 2,
    margin = d.length % 2 == 0 ? width / 4 : width / 2,
    center = (w - width) / 2,
    scooch = map.scooch(critInd, center, width, margin);

  //update data
  var buttons = ds(this).da('.button')
    .data(function() { return d});

  //current buttons
  buttons.call(map.buttonEvents);

  //entering buttons
  var newButtons = buttons.enter().append('g')
    .class('button')
    .attr('id', function(d) { return d.id})
    .attr('mode', '0')
    .call(map.buttonEvents)
    .style('opacity', 0)
    .transform(function() {
      return 'translate(' + center + ',' + rheight * i + ')'
    })

  newButtons.transition().duration(1000)
    .style('opacity', 1)
    .attr('transform', function(d, j) {
      return 'translate(' + scooch(j) + ',' + rheight * i + ')'
    });

  newButtons.append('rect')
    .attr('height', height)
    .attr('width', width)
 
  newButtons.append('text')
    .class('buttonText')
    .attr('dy', '.3em')
    .transform('translate(' + width / 2 + ',' + height / 2 + ')')
    .text(function(d) {return d.text});

  //exiting buttons
  buttons.exit().remove();
};

// Map-rendering functions
map.renderControlPanel = function() {
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

map.renderLinks = function(array) {
  var data = array ? array : map.links,
    linknodes = collection
      .selectAll('.link')
      .data(data),
    coords = function(s) {
      return s.attr('x1', function(d) { return +d.x1 })
        .attr('x2', function(d) { return +d.x2 })
        .attr('y1', function(d) { return +d.y1 })
        .attr('y2', function(d) { return +d.y2 })
    };

  linknodes
    .call(coords);

  linknodes.enter().insert('line', 'g')
    .call(coords)
    .attr('class', 'link');

  linknodes.exit().remove();
};

map.renderNodes = function(array) {
  var nodes = array ? array : map.nodes,
    coords = function(s) {
      return s.attr('id', function(d) { return d.name })
              .attr('class', function(d) {
                var p = d.government;
                return p in classes ? classes[p] : 'node default'})
              .attr('r', 10)
              .style('stroke-width', '4')
              .on('mouseover', function(d,i) { 
                map.examine.apply(this, arguments);
              }).on('mouseout', function(d, i) {
                map.examine.apply(this, arguments);
              }).on('click', function(d, i) {
                map.examine.apply(this, arguments);
              });
    };

  //update data
  var mapnodes = collection.selectAll('.nodeG')
    .data(nodes);

  //current selection
  mapnodes
    .transform(function(d, i) { return 'translate(' + d.ox + ',' + d.oy + ')'}) 
    .each(function(d) { 
      ds(this).ds('text').text(d.name);
      ds(this).ds('.node').call(coords);
    });

  //entering selection
  var nodeG = mapnodes.enter().append('g')
    .transform(function(d, i) { return 'translate(' + d.ox + ',' + d.oy + ')'});

  nodeG.append('text')
    .class('nodeTitle')
    .transform(function(d) { return 'translate(20,0)'})
    .text(function(d) { return d.name})

  nodeG.append('circle')
    .call(coords);

  //exiting selection
  mapnodes.exit().remove();
};

map.renderMap = function() { 
  map.applyScale();
  map.renderNodes();
  map.renderControlPanel();
};

// Click handlers
clickMap.showLinks = function(d, i) { 
  var modeMap = {'1':'0', '0':'1'},
    mode = ds(this).attr('mode'),
    text = ds(this).select('.buttonText'),
    textMap = {'0' : 'Untoggle Links', '1': 'Toggle Links'};
   
  ds(this).attr('mode', modeMap[mode]);
  text.text(textMap[mode])
  if (mode == '0')
    map.renderLinks();
  if (mode == '1') 
    map.renderLinks([]);
};

clickMap.planTrip = function(d, i) {
  if (plotRoute.ds('.background').empty()) {
    plotRoute.append('rect')
      .class('background')
      .width('100%')
      .height('5%')
      .fill('#85ffff')
      .style('fill-opacity', '.5')
      .each(function(d, i) {
        map.Path.apply(this, arguments);
      });
  } else {
    plotRoute.ds('.background')
      .each(function(d, i) {
        map.Path.apply(this, arguments);
      });
  };
};

map.examine = function(d, i) {
  var m = {};
  m.click = map.zoom;
  m.mouseover = function(d, i) { 
    map.renderLinks(d.links);
  };
  m.mouseout = function() { 
    var mode = showLinks.attr('mode');
    if (mode == '0') { 
      map.renderLinks([]);
    } else { 
      map.renderLinks();
    };
  };
  m[d3.event.type].apply(this, arguments);
};

window.onresize = function(event) {
  map.renderControlPanel();
  map.applyScale();
};

map.renderMap();
