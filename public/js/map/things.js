define([], function() {
    var things = {};

    //getter-setters
    things.functor = function(obj) {
      obj.vars = {};
      return function(name, value) {
        obj.vars[name] = value;
        obj[name] = function(_) {
          if (!arguments.length) return obj.vars[name];
          obj.vars[name] = _;
          return obj;
        };
      };
    };

    //returns accessors
    things.get = function() {
      if (!arguments.length) return function(d) { return d; };
      var args = arguments;
      return function(d) {
        var r = d;
        for (var i = 0; i < args.length; i++) {
          r = r && r[args[i]];
        };
      };
    };

    //applies list of functions
    things.map = function() {
      var args = arguments;
      return function(d) {
        var r = d;
        for (var i = 0; i < args.length; i++) {
          r = r && args[i](r);
        };
      };
    };

    //appends or selects
    things.touch = function(s, tag) {
      if (s.s(tag).empty())
        return s.append(tag.split('.')[0].split('#')[0]);
      return s.s(tag);
    };

    //returns transform accessor
    things.transform = function(fnx, fny) {
      return function(d) {
        return 'translate(' + fnx(d) + ',' + fny(d) + ')';
      };
    };

    //center nodes based on index
    things.scooch = function(ArrayLength,graphCenter,nodeWidth,translate,scale) {
      var al = ArrayLength,
        ind = (al - 1) / 2,
        c = graphCenter,
        w = nodeWidth,
        d = ind - i,
        t = translate ? translate : 0,
        z = t ? 0 : nodeWidth / 2,
        s = scale ? scale : 1.5;
      return function(i) {
        return (al % 2 == 0 && i != ind) ? c + s * (z - w * (.5 - d)) + t / 2
          : i != ind ? c - w * d * s - t
          : c - t;
      };
    };
    return things;
});
