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

    Map.classes = {
      'Federation' : 'node Federation',
      'Abolis' : 'node Abolis',
      'Other' : 'node Other',
      'Red Corps' : 'node Red Corps'
    };
    Map.validFields = {
    'name':null,
      'government':null,
      'content':null,
      'target':null,
      'source':null,
      'system':null,
      'cluster':null,
      'habitat':null
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
    function renderNodes(s, array) {
      var nodes = array ? array : data.nodes(),
          x = map(get('ox'), x), y = map(get('oy'), y);

      s.sa('.nodeG').data(nodes).update('g')
        .class('nodeG').call(function(g) {

          //titles
          things.touch(g, 'text')
            .class('nodeTitle')
            .dy('.3em').text(get('name'));

          //circles
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
    function findAccessibleNodes(data) {
      if (data.length) {
        var last = data[data.length - 1],
          lastLinks = last.links,
          unique = [];

        //get data of accessible nodes
        data = collection.sa('.nodeG')
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
    return Map;
})
