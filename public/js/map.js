define(['things', 'data'], function(things, data) {
    var Map = {},
      funct = things.functor(Map),
      get = things.get,
      map = things.map;

    funct('height');
    funct('width');
    funct('x');
    funct('y');
    funct('root');
    funct('buttonHeight');
    funct('buttonWidth');

    function renderControlPanel(s) {
      var dats = data.buttonData, rows = [dats, []];
      s.sa('.row').data(rows)
        .update('g').class('row').each(button);
    };
    function renderLinks(s, array) {
      var data = array ? array : data.links(),
          x = Map.x(), y = Map.y();
      s.sa('.link').data(data).call(function(links) {
        //entering
        links.enter().insert('line', 'g').class('link');
        //exiting
        links.exit().remove();
        //updating
        links.x1(map(get('x1'), x))
          .x2(map(get('x2'), x))
          .y1(map(get('y1'), y))
          .y2(map(get('y2'), y));
      });
    };
    function renderNodes = function(s, array) {
      var nodes = array ? array : data.nodes(),
          x = map(get('ox'), x), y = map(get('oy'), y);

      s.sa('.nodeG').data(nodes).update('g')
        .class('nodeG').call(function(g) {

          things.touch(g, 'text')
            .class('nodeTitle')
            .dy('.3em').text(get('name'));

          things.touch(s, 'circle').class(function(d) {
              var p = d.government;
              return p in classes ? classes[p] : 'node default';
            }).id(get('name')).r(10)
            .cx(x).cy(y)
            .on('mouseover', examine)
            .on('mouseout', examine)
            .on('click', examine);

        }).transition().duration(map.duration())
        .transform(things.transform(x, y));

      function examine() {
        Map.examine().apply(this, arguments);
      };
    };

    function button(d, i) {
      var w = Map.width(),
        h = Map.height(),
        id = get(),
        height = Map.buttonHeight(),
        width = Map.buttonWidth(),
        rheight = Map.rowHeight() / 2,
        critInd = (d.length - 1) / 2,
        center = (w - width) / 2,
        scooch = Map.scooch(critInd, center, width);

      d3(this).sa('.button').data(id).call(function(buttons) {
          //entering
          buttons.enter().append('g')
            .class('button').id(get('id')).mode(0)
            .call(buttonEvents).style('opacity', 0)
            .transform(things.transform(id(center), id(rheight)));
          //exiting
          buttons.exit().remove();
          //updating
          buttons.transition().duration(Map.duration())
            .style('opacity', 1)
            .transform(function(d, j) {
              return 'translate(' + scooch(j) + ',' + rheight * i + ')';
            });
        }).call(function(buttons) {
          things.touch(buttons, 'rect').width(width).height(height);
          things.touch(buttons, 'text').textLength(width * .8)
            .class('buttonText').dy('.3em')
            .transform('translate(' + width / 2 + ',' + height / 2 + ')')
            .text(get('text'));
        });
    };
    Map.plotRoute = function() {
      var w = window.innerWidth,
        h = window.innerHeight,
        data = Map.vertices,
        rheight = y(2.5),
        critInd = (data.length - 1) / 2,
        width = x(5),
        center = (w - width) / 2,
        scooch = Map.scooch(critInd, center, width);

      Map.findAccessibleNodes(data);

      if (!(data.length || Map.currentMode() == 'examine')) { 
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
          Map.vertices.forEach(function(v, i) { 
            if (v.name == d.name) { 
              Map.vertices.splice(i, 1);
            };
          });
          plotRoute.each(function() { Map.plotRoute.apply(this, arguments);});
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

    Map.highlightAccessibleNodes = function(data) { 
      Map.accessNodes = data.Map(function(d) { return d.name});
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

    Map.renderMap = function() { 
      Map.applyScale();
      Map.renderNodes();
      Map.renderControlPanel();
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
        Map.renderLinks();
      if (mode == '1') 
        Map.renderLinks([]);
    };

    clickMap.planTrip = function(d, i) {
      var textMap = {'Plot Route' : 'Remove Route', 
        'Remove Route': 'Plot Route'},
        text = ds(this).ds('text').text();

      ds(this).ds('text').text(textMap[text]);

      if (Map.currentMode() == 'planTrip') {
        Map.vertices = [];
        Map.currentMode('examine');

        plotRoute.each(function() {
          Map.plotRoute.apply(this, arguments);
        });

        plotRoute.da('rect').transition()
          .style('fill-opacity', 0)
          .remove();
        plotRoute.da('.instructions').transition()
          .style('fill-opacity', 0)
          .remove();
        return;
      };

      Map.currentMode('planTrip');

      if (plotRoute.ds('.background').empty()) {
        plotRoute.append('rect')
          .class('background')
          .width(x(100)).height(0)
          .transition().attr('height', y(8));
      };

      plotRoute.each(function(d, i) {
          Map.plotRoute.apply(this, arguments);
        });
    };
    return Map;
})
