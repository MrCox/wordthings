define(['things', 'data'], function(things, data) {
    var control = {},
      funct = things.functor(control),
      get = things.get,
      map = things.map;

    funct('buttonHeight');
    funct('buttonWidth');
    funct('buttonData');
    funct('width');
    funct('height');
    funct('rowHeight');

    function renderControlPanel(s) {
      var dats = data.buttonData, rows = [dats, []];
      s.sa('.row').data(rows)
        .update('g').class('row').each(button);
    };

    function button(d, i) {
      var w = control.width(),
        h = control.height(),
        id = get(),
        height = control.buttonHeight(),
        width = control.buttonWidth(),
        rheight = control.rowHeight() / 2,
        scooch = things.scooch(d.length, w / 2, width);

      d3(this).sa('.button').data(id).call(function(buttons) {
        //entering
        buttons.enter().append('g')
          .class('button').id(get('id')).mode(0)
          .style('opacity', 0)
          .transform(things.transform(id(center), id(rheight)));
        //exiting
        buttons.exit().remove();
        //updating
        buttons.transition().duration(Map.duration())
          .style('opacity', 1)
          .transform(function(d, j) {
            return 'translate(' + scooch(j) + ',' + rheight * i + ')';
          }).on('click', function(d, i) {
            clickMap[d3(this).id()].apply(this, arguments);
          });
        }).call(function(buttons) {
          things.touch(buttons, 'rect').width(width).height(height);
          things.touch(buttons, 'text').textLength(width * .8)
            .class('buttonText').dy('.3em')
            .transform('translate(' + width / 2 + ',' + height / 2 + ')')
            .text(get('text'));
        });
    };
    function highlightAccessibleNodes(data) {
      Map.accessNodes = data.map(get('name'));

      collection.sa('.honing').data(data).call(function(circles) {
        //current
        circles.transition()
          .transform(things.transform(map(get('ox'), x), map(get('oy'), y)));
        circles.s('circle').transition().r(500)
          .transition().delay(250).r(50);

        //entering
        circles.enter().insert('g', '.nodeG')
          .class('honing').transform(function(d) {
            return 'translate(' + d.ox + ',' + d.oy + ')'
          }).call(function(newCircles) {
            newCircles.append('circle').r(500).transition().r(50);
          });

        //exiting
        circles.exit().call(function(gone) {
          gone.transition().style('opacity', 0).remove();
          gone.ds('circle').transition().r(500).remove();
        });
      });
    };
    function planTrip(d, i) {
      var textMap = {
          'Plot Route' : 'Remove Route',
          'Remove Route': 'Plot Route'
        },
        text = ds(this).ds('text').text();

      d3(this).sa('text').text(textMap[text]);

      if (Map.currentMode() == 'planTrip') {
        Map.vertices = [];
        Map.currentMode('examine');

        plot.each(function() {
          plotRoute.apply(this, arguments);
        });

        plot.sa('rect').transition()
          .style('fill-opacity', 0)
          .remove();
        plot.sa('.instructions').transition()
          .style('fill-opacity', 0)
          .remove();
        return;
      };

      Map.currentMode('planTrip');

      if (plot.s('.background').empty()) {
        plot.append('rect')
          .class('background')
          .width(x(100)).height(0)
          .transition().attr('height', y(8));
      };

      plot.each(function(d, i) {
        plotRoute.apply(this, arguments);
      });
    };
    function plotRoute() {
      var w = window.innerWidth,
        h = window.innerHeight,
        data = Map.vertices,
        rheight = y(2.5),
        critInd = (data.length - 1) / 2,
        width = x(5),
        center = (w - width) / 2,
        scooch = Map.scooch(data.length, Map.width() / 2, 10);

      findAccessibleNodes(data);

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
          return 'translate(' + scooch(i) + ',' + rheight + ')';
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

    return control;
});
