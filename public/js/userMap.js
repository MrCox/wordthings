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
  zoom = ds('#zoom'),
  canvas = ds('#canvas').style('background-color', 'black'),
  controlPanel = ds('#controlPanel'),
  Map = ds('#map').style('width', '100%'),
  advert = ds('#advert').style('visibility', 'hidden'),
  milkyWay = ds('#milkyWay').height(2500).width(2500),
  plotRoute = ds('#plotRoute').transform('translate(0,' + .05 * h + ')'),
  hide = ds('#hide').on('click', function() { 
    clickMap[ds(this).id()].apply(this, arguments)}),
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
    centered,
    factor = 1,
    currentScale = h / 2500,
    currentMode = 'examine',
    controlPanelCoords = function(w, h) {
      return 'translate(' + -w * .03 + ',' + h * .11 + ')';
    },
    logoCoords = function(w, h) { 
      return 'translate(' + -w * .03 + ',' + -h * .02 + ')';
    };

map.zoomEvents = function(s) { 
  /*return s.on('mouseover', function() { 
    ds(this).style('stroke-width', '2px');
    })
    .on('mouseout', function() { 
      ds(this).style('stroke-width', null);
    })
    .on('click', function(d, i) { 
      var i = ds(this).id();
      if (i == 'less') {
        if (map.factor() > .4) {
          map.factor(map.factor() - .2);
        };
      } else if (i == 'more') {
        if (map.factor() < 2)
          map.factor(map.factor() + .2);
      };
      var x = map.factor() * w - w;
        y = map.factor() * h - h;
      ds('#scaling').attr('transform', 'scale(' + map.factor() + ')'
        + 'translate(' + (-x/4) + ',' + (y/4) + ')');
    }); */
};

zoom.append('path')
  .transform('translate(' + .7*w + ',' + .05 * h + ')')
  .attr('d', d3.svg.symbol().type('cross').size(300))
  .class('official')
  .id('more')
  .style('fill-opacity', .5)
  .call(map.zoomEvents);

zoom.append('path')
  .transform('translate(' + .7*w + ',' + .1 * h + ')scale(1, .5)')
  .attr('d', d3.svg.symbol().type('square').size(300))
  .id('less')
  .class('official')
  .style('fill-opacity', .5)
  .call(map.zoomEvents);

map.zoomButtons = function(w, h) { 
  zoom.da('path')
    .transform(function(d, i) { 
      var f = i == 0 ? .05 : .1,
        s = i == 0 ? '' : 'scale(1, .5)';
      return 'translate(' + .7*w + ',' + f * h + ')' + s;
    });
};

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
  {'id' : 'planTrip', 'text': 'Plot Route'}
];

//utilities
map.findAccessibleNodes = function(data) {
  if (data.length) {
    var last = data[data.length - 1],
      lastLinks = last.links,
      unique = [];

    //get data of accessible nodes
    data = collection.da('.nodeG')
      .filter(function(d) {
        for (var i in lastLinks) { 
          if (lastLinks[i].source == d.name || lastLinks[i].target == d.name) {
            if (d.name != last.name)
              return true;
          };
        };
      }).data();
  };
  map.highlightAccessibleNodes(data);
};

map.updateCollectionScale = function() { 
};

map.applyScale = function() { 
  w = window.innerWidth;
  h = window.innerHeight;

  var scale = map.currentScale((h / 2500) * map.factor()),
    center = 2500 / scale;

  map.zoomButtons(w, h);

  container.transform(controlPanelCoords(w, h));

  logo.transform(logoCoords(w, h));

  canvas.attr('height', h)
    .attr('width', w)

  collection
    .attr('transform', 'scale(' + scale + ')' + 
    'translate(' + (center - 2500)/4 + ',0)');
};

map.scooch = function(critInd, center, width, margin) {
  return function(i) {
    var distance = critInd - i,
      margin = width / 2;
   return (i < critInd && distance > 1) ? center - (distance * width + 2 * margin)
      : (i < critInd && critInd - i <= 1) ? center - (distance * width + margin)
      : i == critInd ? center
      : (i > critInd && -distance > 1) ? center + (-distance) * width + 2 * margin
      : (i > critInd && -distance <= 1) ? center + (-distance) * width + margin
      : center;
  };
};

map.zoom = function(d) {
  var x, y, k = map.currentScale() * map.factor();
  var w = window.innerWidth, h = window.innerHeight;
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
      ds(this).style('stroke-width', '2.5px')
    })
    .on('mouseout', function() {
      ds(this).style('stroke-width', '2px')
    });
};

// rendering functions
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
    .class('nodeG')
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

map.button = function(d, i) { 
  var w = window.innerWidth,
    h = window.innerHeight,
    height = map.buttonHeight(h),
    width = map.buttonWidth(w),
    rheight = map.rowHeight(h) / 2,
    critInd = (d.length - 1) / 2,
    center = (w - width) / 2,
    scooch = map.scooch(critInd, center, width);

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

map.plotRoute = function() {
  var w = window.innerWidth,
    h = window.innerHeight,
    data = map.vertices,
    rheight = .05 * h / 2,
    critInd = (data.length - 1) / 2,
    width = .05 * w,
    center = (w - width) / 2,
    scooch = map.scooch(critInd, center, width);

  map.findAccessibleNodes(data);

  if (!(data.length || map.currentMode() == 'examine')) { 
      var instruct = ds(this).append('text')
        .transform('translate(' + w / 2 + ',' + rheight + ')')
        .class('instructions')
        .style('opacity', 0)
      instruct.transition()
        .style('opacity', 1);
      instruct.text(
       'Click on a node to plot it; click on a plotted node to remove it.')
  } else { 
    ds(this).ds('.instructions').transition()
      .style('opacity', 0)
      .remove();
  };

  //updateData
  var vertex = ds(this)
    .da('.vertex')
    .data(data);

  //current selection
  vertex.transition()
    .attr('transform', function(d, i) { 
      return 'translate(' + scooch(i) + ',' + rheight + ')' 
    });

  vertex.ds('.node')
    .class(function(d) {
      var p = d.government;
      return p in classes ? classes[p] : 'node default';
    });

  vertex.ds('text')
    .text(function(d) { return d.name});

  //entering selection
  var newVertices = vertex.enter()
    .append('g')
    .class('vertex')
    .on('click', function(d) { 
      map.vertices.forEach(function(v, i) { 
        if (v.name == d.name) { 
          map.vertices.splice(i, 1);
        };
      });
      plotRoute.each(function() { map.plotRoute.apply(this, arguments);});
    });

  newVertices.transition()
    .attr('transform', function(d, i) {
      return 'translate(' + scooch(i) + ',' + rheight + ')';
    });
    
  newVertices.append('circle')
    .transform('scale(.5)')
    .class(function(d) {
      var p = d.government;
      return p in classes ? classes[p] : 'node default'})
    .r(10).style('stroke-width', '4');

  newVertices.append('text')
    .transform(function(d, i) { 
      return 'translate(0,20)scale(.5)'
    })
    .style('text-anchor', 'middle')
    .class('vertexTitle')
    .text(function(d) {return d.name});

  //exiting selection
  vertex.exit()
    .transition()
    .attr('transform', 'scale(0)')
    .style('opacity', 0)
    .remove();
};

map.highlightAccessibleNodes = function(data) { 
  //update data
  var circles = collection.da('.honing')
    .data(data);

  //current selection;
  circles.transition()
    .attr('transform', function(d) { 
      return 'translate(' + d.ox + ',' + d.oy + ')';
    });

  circles.ds('circle')
    .transition()
    .attr('r', 500);

  circles.ds('circle')
    .transition()
    .delay(250)
    .attr('r', 50);

  //entering selection
  var newCircles = circles.enter()
    .insert('g', '.nodeG')
    .class('honing')
    .transform(function(d) {
      return 'translate(' + d.ox + ',' + d.oy + ')'
    });

  newCircles.append('circle')
    .r(500)
    .transition()
    .attr('r', 50);

  //exiting selection
  var gone = circles.exit();

  gone.transition()
    .style('opacity', 0)
    .remove();

  gone.ds('circle')
    .transition()
    .attr('r', 500)
    .remove();
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
  var textMap = {'Plot Route' : 'Remove Route', 
    'Remove Route': 'Plot Route'},
    text = ds(this).ds('text').text();

  ds(this).ds('text').text(textMap[text]);

  if (map.currentMode() == 'planTrip') {
    map.vertices = [];
    map.currentMode('examine');

    plotRoute.each(function() {
      map.plotRoute.apply(this, arguments);
    });

    plotRoute.da('rect').transition()
      .style('fill-opacity', 0)
      .remove();
    return;
  };

  map.currentMode('planTrip');

  if (plotRoute.ds('.background').empty()) {
    plotRoute.append('rect')
      .class('background')
      .width('100%').height(0)
      .transition().attr('height', '5%');
  };

  plotRoute.each(function(d, i) {
      map.plotRoute.apply(this, arguments);
    });
};

//events on nodes
map.examine = function(d, i) {
  map.nodeEvents[d3.event.type].apply(this, arguments);
};
map.nodeEvents = {};
map.nodeEvents.click = function(d, i) { 
  var modeMap = {};

  //for zooming in
  modeMap.examine = map.zoom;

  //for graphing routes
  modeMap.planTrip = function(d, i) { 
    var last = map.vertices[map.vertices.length - 1];
    if (!last || last.name != d.name) {
      map.vertices.push(d);
      plotRoute.each(function(d, i) {
        map.plotRoute.apply(this, arguments);
      });
    };
  };
  modeMap[map.currentMode()].apply(this, arguments);
};
map.nodeEvents.mouseout = function() { 
  var mode = ds('#showLinks').attr('mode');
  if (mode == '0') { 
    map.renderLinks([]);
  } else { 
    map.renderLinks();
  };
};
map.nodeEvents.mouseover = function(d, i) { 
  map.renderLinks(d.links);
};

window.onresize = function(event) {
  map.renderControlPanel();
  map.applyScale();
};

map.renderMap();
