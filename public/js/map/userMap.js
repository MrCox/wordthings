define(['map/map'], function(map) {
  //converts to percentage
  var x = function(_) {
    var w = window.innerWidth;
    return w * (_ / 100);
  };
  var y = function(_) {
    var h = window.innerHeight;
    return h * (_ / 100);
  };

  var ds = d3.select, da = d3.selectAll;

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

  zoom.transform('translate(' + x(3) + ',0)')

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
    //ds(titles[1]).x(x(35 / 2)).y(y(8 / 1.5))
    //  .transform('scale(2, 1.5)')
    var out = ds(titles[1]).x(x(25)).y(y(8))
      .transform('scale(2,1)');
    out.da('tspan').style('font-size', '130%')
    //ds(titles[3]).x(x(65 / 2)).y(y(8 / 1.5))
    //  .transform('scale(2, 1.5)');
    title.ds('rect').x(x(34.5)).y(y(8.5))
      .width(x(31)).height(y(.25));

    advert.x(x(50)).y(y(11));
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
});
