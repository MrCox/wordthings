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

//converts to percentage
var x = function(_) {
  var w = window.innerWidth;
  return w * (_ / 100);
};
var y = function(_) {
  var h = window.innerHeight;
  return h * (_ / 100);
};

//global map object
map = {};
clickMap = {};

var b = window,
  w = b.innerWidth,
  h = b.innerHeight,
  collection = ds('#collection'),
  positionCollection = ds('#positionCollection'),
  container = ds('#container'),
  logo = ds('#logo'),
  Map = ds('#map'),
  zoom = ds('#zoom'),
  canvas = ds('#canvas').style('background-color', 'black'),
  controlPanel = ds('#controlPanel'),
  advert = ds('#advert').style('visibility', 'hidden'),
  containsControlPanel = ds('#lazyFix').transform('translate(0,' + -y(.5) + ')'),
  milkyWay = ds('#milkyWay').height(2500).width(2500),
  scaling = ds('#scaling'),
  plotRoute = ds('#plotRoute').transform('translate(0,' + y(3) + ')'),
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
    currentMode = 'examine',
    controlPanelCoords = function() {
      return 'translate(' + -x(3) + ',' + y(11) + ')';
    },
    logoCoords = function() { 
      return 'translate(' + -x(3)+ ',' + -y(2) + ')';
    };

map.zoomEvents = function(s) { 
  return s.on('mouseover', function() { 
    ds(this).style('stroke-width', '2px');
    })
    .on('mouseout', function() { 
      ds(this).style('stroke-width', null);
    })
    .on('click', function(d, i) { 
      var i = ds(this).id();
      if (i == 'less') {
        if (map.factor() > 1) {
          map.factor(map.factor() - .2);
        };
      } else if (i == 'more') {
        if (map.factor() < 2)
          map.factor(map.factor() + .2);
      };
      map.centerMap(400);
    });
};

zoom.append('path')
  .transform('translate(' + x(7) + ',' + y(5) + ')')
  .attr('d', d3.svg.symbol().type('cross').size(300))
  .class('official')
  .id('more')
  .style('fill-opacity', .5)
  .call(map.zoomEvents);

zoom.append('path')
  .transform('translate(' + x(70) + ',' + y(10) + ')scale(1, .5)')
  .attr('d', d3.svg.symbol().type('square').size(300))
  .id('less')
  .class('official')
  .style('fill-opacity', .5)
  .call(map.zoomEvents);

map.zoomButtons = function() { 
  var h = window.innerHeight, w = window.innerWidth;
  zoom.da('path')
    .transform(function(d, i) { 
      var f = i == 0 ? .05 : .1,
        s = i == 0 ? '' : 'scale(1, .5)';
      return 'translate(' + x(70) + ',' + f * h + ')' + s;
    });
};

//getter-setters
map.factor = function(_) { 
  if (!arguments.length) return factor;
  factor = _;
  return factor;
};
map.currentScale = function(_) {
  return window.innerHeight / 2500;
};
map.currentMode = function(_) {
  if (!arguments.length) return currentMode;
  currentMode = _;
  return currentMode;
};
map.rowHeight = function(h) { return y(8); };
map.buttonHeight = function(h) { return y(4);};
map.buttonWidth = function(w) { return x(7); };

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
map.accessNodes = [];

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

map.centerMap = function(dur) {
  var w = window.innerWidth, h = window.innerHeight,
  k = map.currentScale()*map.factor(),
  width = k*2500,
  height = width,
  offset = x(2.5),
  newx = w / 2 - width / 2 - offset,
  newy = h / 2 - height / 2,
  dur = dur ? dur : 0;

  collection.transition().duration(dur)
    .attr('transform', 'scale(' + k + ')');
    
  positionCollection.transition()
    .duration(dur)
    .attr('transform', 'translate(' + newx + ',' + newy + ')');
};

map.applyScale = function() { 
  var scale = map.currentScale() * map.factor(),
    w = window.innerWidth, h = window.innerHeight,
    width = map.currentScale() * 2500,
    offset = x(2.5),
    center = w / 2 - width / 2 - offset;

  map.zoomButtons();

  map.scaleLogo();

  container.transform(controlPanelCoords());

  logo.transform(logoCoords());

  canvas.attr('height', h * map.factor())
    .attr('width', w * map.factor());

  map.centerMap();
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
  var nx, ny, k = map.currentScale();
  var w = window.innerWidth, h = window.innerHeight;
  if (d.name != centered) {
    k = 1.8 * k;
    nx = d.ox * k;
    ny = d.oy * k;
    centered = d.name;
    collection.transition()
      .duration(1000)
      .attr('transform','scale(' + k + ')');
    positionCollection.transition()
      .duration(1000)
      .attr('transform', 'translate(' + (w / 2 - nx) + ',' + (h / 2 - ny) + ')');
  } else {
    centered = null;
    map.centerMap(1000);
  };
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
map.scaleLogo = function() {
  var titles = title.da('text')[0];
  ds(titles[0]).x(x(50)).y(y(5));
  ds(titles[1]).x(x(35 / 2)).y(y(8 / 1.5))
    .transform('scale(2, 1.5)')
  ds(titles[2]).x(x(25)).y(y(8))
    .transform('scale(2,1)');
  ds(titles[3]).x(x(65 / 2)).y(y(8 / 1.5))
    .transform('scale(2, 1.5)');
  title.ds('rect').x(x(34.5)).y(y(8.5))
    .width(x(31)).height(y(.25));
};
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
    },
    gEvents = function(s) { 
      return s.transform(function(d, i) { 
        return 'translate(' + d.ox + ',' + d.oy + ')' + 
          'scale(' + map.factor() + ')';
        }).on('mouseover', function(d, i) { 
          ds(this).transform(function(d, i) {
            return 'translate(' + d.ox + ',' + d.oy + ')' + 
            'scale(' + 2 / map.factor() + ')';
          });
        }).on('mouseout', function(d, i) { 
          ds(this).transform(function(d, i) { 
            return 'translate(' + d.ox + ',' + d.oy + ')' + 
            'scale(' + map.factor() + ')';
          });
        });
    };
          
  //update data
  var mapnodes = collection.selectAll('.nodeG')
    .data(nodes);

  //current selection
  mapnodes
    .call(gEvents)
    .each(function(d) { 
      ds(this).ds('text').text(d.name);
      ds(this).ds('.node').call(coords);
    });

  //entering selection
  var nodeG = mapnodes.enter().append('g')
    .class('nodeG')
    .call(gEvents);

  nodeG.append('text')
    .class('nodeTitle')
    .transform('translate(' + 40/map.factor() + ',0)scale(' + 2/map.factor() + ')')
    .attr('dy', '.3em')
    .text(function(d) { return d.name})

  nodeG.append('circle')
    .call(coords);

  //exiting selection
  mapnodes.exit().remove();
};

map.button = function(d, i) { 
  var w = window.innerWidth,
    h = window.innerHeight,
    height = map.buttonHeight(),
    width = map.buttonWidth(),
    rheight = map.rowHeight() / 2,
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
 
  var o = newButtons.append('text')
    .attr('textLength', (width * .8))
    .class('buttonText')
    .attr('dy', '.3em')
    .transform('translate(' + width / 2 + ',' + height / 2 + ')')
    .text(function(d) {return d.text})

  //exiting buttons
  buttons.exit().remove();
};

map.plotRoute = function() {
  var w = window.innerWidth,
    h = window.innerHeight,
    data = map.vertices,
    rheight = y(2.5),
    critInd = (data.length - 1) / 2,
    width = x(5),
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
  map.accessNodes = data.map(function(d) { return d.name});
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
    plotRoute.da('.instructions').transition()
      .style('fill-opacity', 0)
      .remove();
    return;
  };

  map.currentMode('planTrip');

  if (plotRoute.ds('.background').empty()) {
    plotRoute.append('rect')
      .class('background')
      .width(x(100)).height(0)
      .transition().attr('height', y(8));
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
      if (map.accessNodes.indexOf(d.name) != -1 || (!map.accessNodes.length)) {
        map.vertices.push(d);
        plotRoute.each(function(d, i) {
          map.plotRoute.apply(this, arguments);
        });
        if (!ds('.instructions').empty()) {
          plotRoute.ds('.instructions')
            .transition()
            .style('opacity', 0)
            .remove();
        };
      } else {
        var h = window.innerHeight,
          w = window.innerWidth,
          rheight = y(7);
        var instruct = plotRoute.append('text')
          .transform('translate(' + x(50) + ',' + rheight + ')')
          .class('instructions')
          .style('opacity', 0);
        instruct.transition()
          .style('opacity', 1);
        instruct.text(
         'Valid destinations are highlighted on the map.')
      };
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
