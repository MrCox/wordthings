define([], function() {
    var things = {};

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

    things.map = function() {
      var args = arguments;
      return function(d) {
        var r = d;
        for (var i = 0; i < args.length; i++) {
          r = r && args[i](r);
        };
      };
    };

    things.touch = function(s, tag) {
      if (s.s(tag).empty())
        return s.append(tag.split('.')[0].split('#')[0]);
      return s.s(tag);
    };

    things.transform = function(fnx, fny) {
      return function(d) {
        return 'translate(' + fnx(d) + ',' + fny(d) + ')';
      };
    };

    return things;
});
