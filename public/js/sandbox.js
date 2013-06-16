var f = d3.select('#collection'), duration = 2000, start = [0,0,0];
d3.select('#container')
  .style('background-color', '#f9e4a9')

d3.select('#everything').selectAll('g').style('display', 'none')

f = f.style('display', null)
  .attr('transform', 'translate(200, 200)')

function getCoords(t, coord) {
  var start = t.search(coord);
  if (start == -1) {throw 'transform does not contain ' + coord};
  var rest = t.slice(start + coord.length + 1, t.length),
    x = '',
    y = '',
    z = '';
  j = 0;
  for (var i in rest) {
    var r = rest[i];
    if (r != ',' && r != ')') {
      if (j==0) {
        x += r;
      } else if (j==1) {
        y += r;
      } else {
        z += r;
      }
    } else if (r==',') {
      j += 1; continue;
    } else if (r==')') {
      return {'x':+x, 'y':+y, 'z':+z}
    }
  }
}

var coords = function(t) {
  var unique = {};
  unique['translate'] = function(t) {
    return getCoords(t, 'translate');
  }
  unique.skewX = function(t) {
    return getCoords(t, 'skewX');
  }
  unique.skewY = function(t) {
    return getCoords(t, 'skewY');
  }
  unique.rotate = function(t) {
    return getCoords(t, 'rotate');
  }
  unique.scale = function(t) {
    return getCoords(t, 'scale');
  }
  function all(t) {
    var r = {};
    for (var i in unique) {
      try {
        r[i] = unique[i](t);
      } catch(e) { 
        continue;
      }
    }
    return r;
  }
  return all(t)
}
d3.select('#everything')
  .attr('transform', 'translate(250, 100)')

var transform = function(oldstring, newstring) {
  var oldAttrs = coords(oldstring),
    newAttrs = coords(newstring),
    newT = '',
    attrs = ['translate', 'rotate', 'scale', 'skewX', 'skewY'];
  for (var i in attrs) {
    var i = attrs[i];
    newT += i + '(';
    var o = oldAttrs[i] ? oldAttrs[i] : {'x':0, 'y':0, 'z':0},
      n = newAttrs[i] ? newAttrs[i] : {'x':0, 'y':0, 'z':0};

    if (i == 'translate') 
      newT += (o.x + n.x) + ',' + (o.y + n.y)  + ')';
    if (i == 'scale') { 
      newT += (o.x + n.x)
      if (n.y) 
        newT += ',' + (o.y + n.y);
      newT += ')';
    }
    if (i == 'rotate') {
      newT += (o.x + n.x);
      if (n.y) 
        newT += ',' + (o.y + n.y) + ',' + (o.z + n.z)
      newT += ')';
    }
    if (i == 'skewX' || i == 'skewY') newT += (o.x + n.x) + ')';
  }
  return newT
}

var rotate = function(selection, reps) {
  var r = function(n) {
    return transform(selection.attr('transform'), 'scale(' + n + ', 1)')
  };
  var left = function(s) {
    return s.transition()
      .duration(1000)
      .attr('transform', r(-1)).call(right)
  };
  var right = function(s) {
    return s.transition()
      .duration(1000)
      .attr('transform', r(1))
  };
  var start = new Date();
  var cur = selection.call(left)
  d3.range(reps).forEach(function()  {
    while (new Date().getTime() <= start.getTime() + 2000) { continue; }
    cur = d3.select('#collection').call(left);
  })
};

rotate(d3.select('#collection'), 4)
