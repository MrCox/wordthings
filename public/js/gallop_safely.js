// Map data

var nodes = JSON.parse(GTA_data.nodes),
links = JSON.parse(GTA_data.links)

var b = d3.select(window)[0][0],
  w = b.innerWidth,
  h = b.innerHeight

var messages = {
  'entry-form' : 'GTA policy dictates that name registry field be completed upon form submission.',
  'nodeOff' : 'Adding nodes disabled',
  'nodeOn' : 'Adding nodes enabled',
  'linkOff': 'Adding links disabled',
  'linkOn' : 'Adding links enabled'
}

var classes = {
  'Federation' : 'node Federation',
  'Abolis' : 'node Abolis',
  'Other' : 'node Other',
  'Red Corps' : 'node Red Corps'
}
var validFields = {'name':null, 
  'government':null, 
  'content':null, 
  'target':null, 
  'source':null, 
  'system':null, 
  'cluster':null, 
  'habitat':null
}

d3.select('#panel')
  .style('height', h + 'px')

// defining variables for selections

var panel = d3.select('#innerpanel'),
  pwidth = panel[0][0].clientWidth

var nodetoggle = d3.select('#nodetoggle')
  .property('checked', false)
  .text(messages.nodeOff)

var linktoggle = d3.select('#linktoggle')
  .property('checked', false)
  .text(messages.linkOff)

var map = d3.select('#map')
  .style('height', h + 'px')

var collection = d3.select('#collection')

var infoadd = d3.select('#infoadd')

var for_examine = d3.select('#for_examine')

// Map-rendering function

function Map() {
  console.log(nodes)
  var linknodes = collection.selectAll('.link')
    .data(links),
    mapnodes = collection.selectAll('.node')
    .data(nodes)

  linknodes.enter().insert('line', 'g')
    .attr('x1', function(d,i) {
      return d.x1
     })
    .attr('y1', function(d) {
      return d.y1
    })
    .attr('x2', function(d) {
      return d.x2
    })
    .attr('y2', function(d) {
      return d.y2
    })
    .attr('class', 'link')
    .on('click', function(d, i) {
      var s = this;
      examine(d, i, s);
    })
    .on('mouseover', function(d, i) {
      var s = this;
      examine(d, i, s);
    })
    .on('mouseout', function(d,i) {
      var s = this;
      examine(d, i, s);
    })
  
  linknodes.exit().remove();

  mapnodes.enter().append('g')
    .attr('transform', function(d, i) {
      return 'translate(' + d.ox + ',' + d.oy + ')'})
    .append('circle')
    .attr('class', function(d) {
      var p = d.government;
      return p in classes ? classes[p] : 'node default'
    })
    .attr('id', function(d) { return d.name })
    .attr('r', 10)
    .style('stroke-width', '2')
    .on('mouseover', function(d,i) { 
      var s = this;
      examine(d, i, s); 
    })
    .on('mouseout', function(d, i) {
      var s = this;
      examine(d, i, s);
    })
    .on('click', function(d, i) {
      var s = this;
      if (linktoggle.property('checked')) {add_link(d, i, s)}
      else { examine(d, i, s); }
    })

  mapnodes.exit().remove();
}

Map();

var currentScale = .6 

collection.attr('transform', 'scale(' + currentScale + ')')
d3.select('#canvas').attr('height', 2500 * currentScale).attr('width', 2500*currentScale)

function modeSwitch() {
  var button = d3.select(this),
    id = button.attr('id'),
    checked = button.property('checked'),
    boolMap = {true : false, false : true},
    bMap = {'linktoggle' : ['linkOff', 'linkOn', 'nodeOff', '#nodetoggle'], 
      'nodetoggle' : ['nodeOff', 'nodeOn', 'linkOff', '#linktoggle']
    }
  
  button.property('checked', boolMap[checked])
    .text(function() { 
      return checked ? messages[bMap[id][0]] : messages[bMap[id][1]] 
    })

  d3.select(bMap[id][3])
    .property('checked',false)
    .text(messages[bMap[id][2]])
}

// Set nodetoggle and linktoggle button events

nodetoggle.on('click', modeSwitch)

linktoggle.on('click', modeSwitch)

collection.on('click', function() {
  var checked = d3.select('#nodetoggle').property('checked'),
    e = d3.event.srcElement || d3.event.currentTarget
  
  if (checked && d3.select(e).attr('id') == 'milkyway') { add_node()}
})

function save_data() {
  var ns = JSON.stringify(nodes),
    ls = JSON.stringify(links),
    l = '/mapdata?obj[nodes]=' + ns + '&obj[links]=' + ls

  d3.json(l, function(err, json) {
    if (err) { console.log(err)}
    console.log(json)
  })
}

function newButton(container, id, title) {
  
  function button() {
    var b = container.append('div')
      .attr('class', 'row')
      .append('div')
      .attr('class', 'large-12 columns')
      .append('a')
      .attr('id', id)
      .attr('class', 'small button round expand')
      .text(title)
    
    return b
  }
  return button();
}

var coordinates = {}

function add_link(d, i, s) {
  var e = s,
    ev = d3.event

  if (! coordinates.source ) {
    coordinates['source'] = d.name
    coordinates['x1'] = d.ox
    coordinates['y1'] = d.oy

    infoadd.append('div')
      .attr('class', 'row')
      .style('border', '1px solid GhostWhite')
      .attr('id', 'current')
      .append('div')
      .attr('class', 'large-12 columns')
      .attr('id', 'current_cont')
      .append('p')
      .html(function() { 
        return "Source Node: <b>" + d.name + "</b>. Select destination node."
      })
  } else if ( coordinates.source != d.name ) { 
    coordinates['target'] = d.name
    coordinates['x2'] = d.ox
    coordinates['y2'] = d.oy

    var lc = coordinates

    d3.select('#current_cont').append('p')
      .html(function() {
        return "Destination Node: <b>" + d.name + '</b>'
      })

    var newline = collection
      .insert('line', 'g')
      .datum(lc)
      .attr('class', 'link')
      .attr('x1', function(d) {
          return d.x1
      })
      .attr('y1', function(d) {
          return d.y1
      })
      .attr('x2', function(d) {
          return d.x2
      })
      .attr('y2', function(d) {
          return d.y2
      })
      .on('click', function(d, i){
        var s = this;
        examine(d, i, s);
      })
      .on('mouseover', function(d, i) {
        var s = this;
        examine(d, i, s);
      })
      .on('mouseout', function(d, i) {
        var s = this;
        examine(d, i, s);
      })

    d3.select('#current').append('div')
      .attr('class', 'large-12 columns')
      .append('a')
      .attr('class', 'small button round expand')
      .text('Register Connection')
      .on('click', function() { 
        d3.select(this.parentElement.parentElement).remove();
        d3.select('#linktoggle').property('checked', false)
        links.push(lc)
        save_data();
        Map();
      })

    d3.select('#current')
      .append('div')
      .attr('class', 'large-12 columns')
      .append('a')
      .attr('class', 'small button round expand')
      .text('Withdraw Entry')
      .on('click', function() {
        newline.remove();
        d3.select('#current').remove();
      })

    d3.select('#linktoggle').property('checked', false)
      .text('Adding links disabled')

    coordinates = {};
  }
}

function nodeFields(container, type, method) {
  var scope_map = {'node':'cluster, system?',
    'habitat':'planet, moon, GTA station, other?',
    'satellite':'planet, moon, GTA station, other?'
    }
  
  var input = method == undefined
    ? container.append('div')
      .attr('class', 'row')
      .append('form')
      .append('fieldset')
    
    : container.insert('div', method)
        .attr('class', 'row')
        .append('form')
        .append('fieldset')

  var title = input.append('div')
    .style('text-align', 'center')
    .style('margin-bottom', '15px')
    .append('b')
    .text( type )

  var outer = input.append('input')
    .attr('type', 'text')
    .attr('placeholder', function() { return 'Enter ' + type + ' name'})
    .attr('value', '')

  var scope = type in scope_map 
     ? input.append('input')
         .attr('type', 'text')
         .attr('placeholder', function() { return 'type: ' + scope_map[type] })
         .attr('value', '')
     : null;

  var politics = input.append('input')
    .attr('type', 'text')
    .attr('placeholder', 'Federation / Abolis / Red Corps / Other?')
    .attr('value', '')

  var content = input.append('textarea')
    .attr('placeholder', 'Any other info (history, story, etc)')
    .attr('value', '')

  function e() { }
  
  e.input = function() { return input }
  e[type] = function() { return outer; }
  e.scope = function() { return scope;}
  e.politics = function() { return politics; }
  e.content = function() { return content; }
  
  return e;
}


function add_habitat(c, div, index) { 
  var form = nodeFields(div, 'habitat', 'div.row'),
    input = form.input()
  if (!c.system[index].habitat ) { c.system[index].habitat = [{}]}
  else { c.system[index].habitat.push({})}

  var coord = c.system[index].habitat[ c.system[index].habitat.length - 1]
  coord['index'] = c.system[index].habitat.length - 1;

  form.habitat().on('change', function() {
    coord['name'] = this.value;
  })
  form.politics().on('change', function() {
    coord['government'] = this.value;
  })
  form.content().on('change', function() {
    coord['content'] = this.value;
  })
  form.scope().on('change', function() {
    coord['type'] = this.value;
  })

  newButton(input, coord.index, 'Withdraw habitat')
    .on('click', function() {
      c.system[index].habitat.splice(coord.index, 1);
      c.system[index].habitat.map(function(d, i) { 
        d.index = i;
        return d
      })
      this.parentElement.parentElement.parentElement.remove();
  });
  newButton(input, null, 'Add satellite')
    .on('click', function() {add_satellite(c, input, index, coord.index) })
}

function add_satellite(c, div, sindex, hindex) { 
  var form = nodeFields(div, 'satellite', 'div.row'),
    input = form.input()

  if (!c.system[sindex].habitat[hindex].satellite) { 
    c.system[sindex].habitat[hindex].satellite = [{}]
  } else {
    c.system[sindex].habitat[hindex].satellite.push({})
  }

  var coord = c.system[sindex].habitat[hindex].satellite[ c.system[sindex].habitat[hindex].satellite.length - 1];
  coord.index = c.system[sindex].habitat[hindex].satellite.length - 1;

  form.satellite().on('change', function() {
    coord.name = this.value;
  })
  form.politics().on('change', function() {
    coord.government = this.value;
  })
  form.content().on('change', function() {
    coord.content = this.value;
  })
  form.scope().on('change', function() {
    coord.type = this.value;
  })

  newButton(input, coord.index, 'Withdraw satellite')
    .on('click', function() {
      c.system[sindex].habitat[hindex].satellite.splice(coord.index, 1);
      c.system[sindex].habitat[hindex].satellite.map(function(d, i) { 
        d.index = i;
        return d;
      })
      this.parentElement.parentElement.parentElement.remove();
  });
}

function add_system(c, div) {
  var form = nodeFields(div, 'system', 'div.row'),
    input = form.input()

  if (!c.system) { c.system = [{}] }
  else {c.system.push({})}
 
  var coord = c.system[ c.system.length - 1 ]
  coord.index = c.system.length - 1;

  form.system().on('change', function() { 
    coord.name = this.value;
  })
  form.politics().on('change', function() {
    coord.government = this.value;
  })
  form.content().on('change', function() {
    coord.content = this.value;
  })

  newButton(input, null, 'Withdraw system')
    .on('click', function() {
      c.system.splice(coord.index, 1);
      c.system.map(function(d, i) {
        d.index = i;
    })
    this.parentElement.parentElement.parentElement.remove();
  })
  newButton(input, null, 'Add habitat')
    .on('click', function() {
      add_habitat(c, input, coord.index)
  })
}

function post_data(input, c, newnode) {
  var s = c.name,
      p = c.government,
      e = d3.event.srcElement || d3.event.currentTarget,
      id = d3.select(e).attr('id')

  if (id == 'cancelbutton') {
    newnode.remove();
    input.remove();
  }

  else if (id == 'newstructure') {
    if (!c['type']) { input.insert('p', 'div.row')
      .text('This structure requires the "type" field');
      return;
    } else if (!(c.type == 'cluster' || c.type == 'system')) { input.insert('p', 'div.row')
      .text('Valid type specifications are: "cluster" and "system"');
      return;
    }

    if (c.type == 'cluster') { add_system(c, input)}
    else if (c.type == 'system') { add_habitat(c, input, 0)}
  }

  else if (id == 'submitbutton') { 
    // Presently, the node only needs to be named to be added.
    if (!s) {
        
      if (!text ) {
        text = true
        input.append('p').text(messages['entry-form'])
      }
    }
    else {
      newnode.attr('class', function() { 
        return p in classes ? classes[p] : 'node default'
      })
      input.remove();
      nodes.push(c); 
      save_data();
      Map();
    }
  }
}

function base_node(div, coordinates) {
  var fields = nodeFields(div, 'node'),
    input = fields.input() 

  fields.content().on('change', function() {
    coordinates['content'] = this.value
  })

  fields.node().on('change', function() {
    coordinates['name'] = this.value
  })

  fields.politics().on('change', function() {
    coordinates['government'] = this.value
  })

  fields.scope().on('change', function() {
    coordinates.type = this.value;
    if (coordinates.type == 'system') {
      coordinates.system = [{}]
      coordinates.system.content = coordinates.content
      coordinates.system.name = coordinates.name
      coordinates.system.government = coordinates.government
    }
  })

  return input;
}

function add_node() {
  d3.select('#nodetoggle').property('checked', false).text('Adding nodes disabled')

  var text = false,
    ox = d3.event.offsetX || d3.event.layerX,
    oy = d3.event.offsetY || d3.event.layerY,
    coordinates = {'ox': ox / currentScale, 'oy': oy / currentScale},
    input = base_node(infoadd, coordinates);
  
  newButton(input, 'newstructure', 'Add Substructure')
    .on('click', function() { post_data(input, coordinates, newnode)})
  newButton(input, 'cancelbutton', 'Withdraw Entry')
    .on('click', function() { post_data(input, coordinates, newnode)})
  newButton(input, 'submitbutton', 'Register Node')
    .on('click', function() {post_data(input, coordinates, newnode)})
    
  var newnode = collection.append('g')
    .datum( coordinates )
    .attr('transform', function(d) {
      return 'translate(' + d.ox + ',' + d.oy + ')'})
    .append('circle')
    .attr('class', 'node default')
    .attr('r', 10)
    .style('stroke-width', '2')
    .on('mouseover', function(d, i) {
      var s = this;
      examine(d, i, s);
    })
    .on('mouseout', function(d, i) {
      var s = this;
      examine(d, i, s);
    })
    .on('click', function(d) {
      var s = this,
      i = d3.selectAll('.node')[0].indexOf(s)
      examine(d, i, s);
    })
}

function PlanetBio(src){

  function bio() {
    var info = for_examine.append('div')
      .attr('class', 'row')
      .attr('id', 'info')

    info.append('div')
      .attr('class', 'large-12 columns')
      .selectAll('.entries')
      .data(d3.entries(src))
      .enter().append('p')
      .style('color', 'GhostWhite')
      .html(function(d) { 
        if (d.key in validFields) {
          return '<div class="row" style="text-align:center;"><b>' + d.key + '</b></div>' + '<div class = "row" style="text-align:center;"><div class="large-12 columns" style = "text-align:center;"><p class="entry">' + d.value + '</p></div></div>'
        }
      })
    return info;
  }
  return bio();
}

function Update(d, i, s, div) {
  var coord = {},
    input = base_node(div.append('div'), coord)
  
  newButton(input, 'newstructure', 'Add Substructure')
    .on('click', function() { post_data(input, coord, null)})

  newButton(input, 'cancelbutton', 'Withdraw Entry')
    .on('click', function() { input.remove();})

  newButton(input, 'submitbutton', 'Confirm Update')
    .on('click', function() { 
      for (index in coord) { 
        d[index] = coord[index];
      }
      div.remove();
      save_data();
      Map();
  })
}

function examine(d, i, s) {
  var current = d3.select(s),
    ds = d,
    type = d3.event.type

  function remove(d, i, s) {
    d3.select('#placeholder').remove();
    var name = d.name

    if (s.attr('class')[0] == 'n') {
      var count = 0
      d3.selectAll('.link').each( function(d, i) {
        if (d.source == name || d.target == name) {
          links.splice( i - count, 1 );
          count += 1
        }
      })
      nodes.splice(i, 1)
    }
    else if (s.attr('class')[0] == 'l') {
      s.remove();
      links.splice(i, 1);
    }
    s.remove();
    save_data();
    Map();
  }

  if (type == 'mouseover') {
        var bio = PlanetBio(ds);
        if (current.attr('class')[0] == 'n') {
          var connections = bio.append('div')
            .attr('class', 'row')
            .style('text-align', 'center')
            .html('<b>Connections</b>')
            
          d3.selectAll('.link').each( function(d,i) {
            if (d.source == ds.name || d.target == ds.name) {
              d3.select(this).style('stroke', '#e60000')
              if (d.source == ds.name) {
                d3.selectAll('.node')
                  .each(function(da) {
                   if (da.name == d.target) {
                     connections.append('div')
                       .attr('class', 'row')
                       .style('text-align', 'center')
                       .html('<p class = "entry">' + da.name + '</p>')
                   }
                  })
              }
              else if (d.target == ds.name) {
                d3.selectAll('.node')
                  .each(function(da) {
                    if (da.name == d.source) {
                      connections.append('div')
                        .attr('class', 'row')
                        .style('text-align', 'center')
                        .html('<p class = "entry">' + da.name + '</p>')
                    }
                  })
                }
              }
          })
          if (!connections.select('p')[0][0]) { connections.remove(); }
        }
  }
  if (type == 'mouseout') {
    d3.select('#info').remove();
    if (current.attr('class')[0] == 'n') {
      d3.selectAll('.link')
        .style('stroke', '#85ffff')
    }
  }
  if (type == 'click') {
    var r = d3.select('#info')
      .attr('id', 'placeholder')
      .style('border', '1px solid GhostWhite')
   
    newButton(r, null, 'remove from panel').on('click', function() { 
        d3.select('#placeholder').remove();
      })

    newButton(r, null, 'remove from map')
      .on('click', function() { 
        remove(ds, i, current);
      })
    if (current.attr('class')[0] == 'n') {
      newButton(r, null, 'Update node').on('click', function() {
        Update(ds, i, current, r );
        d3.select(this).remove();
      })
    }
  }
}
