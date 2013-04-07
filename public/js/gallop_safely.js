// Map data

var nodes = JSON.parse(GTA_data.nodes),
links = JSON.parse(GTA_data.links)

var b = d3.select(window)[0][0],
  w = b.innerWidth,
  h = b.innerHeight

var messages = {
  'entry-form' : 'GTA policy dictates that all system registry fields be completed upon form submission.',
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
  var linknodes = collection.selectAll('.link')
    .data(links)

  linknodes.enter().insert('line', 'g')
    .attr('x1', function(d,i) {
      d['index'] = i
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
    .on('click', examine)
    .on('mouseover', examine)
    .on('mouseout', examine)
  
  linknodes.exit().remove();
  
  var mapnodes = collection.selectAll('.node')
    .data(nodes)

  mapnodes.enter().append('g')
    .attr('transform', function(d, i) {
      d['index'] = i
      return 'translate(' + d.ox + ',' + d.oy + ')'})
    .append('circle')
    .attr('id', function(d) { return d.name[0]})
    .attr('class', function(d) {
      var p = d.government;
      return p in classes ? classes[p] : 'node default'
    })
    .attr('r', 10)
    .style('stroke-width', '2')
    .on('mouseover', examine)
    .on('mouseout', examine)

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

function linkcheck() {
  collection.selectAll('.node')
    .on('click', function() {
      var checked = d3.select('#linktoggle').property('checked')
      if (checked) {add_link()}
      else {examine()}
    })
}

linkcheck();

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

function add_link() {
  
  var e = d3.event.srcElement || d3.event.currentTarget,
    d = e.__data__,
    ev = d3.event

  if (coordinates.source == null) {
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
  } else if ( coordinates.source != null && coordinates.source != d.name ) { 
    coordinates['target'] = d.name
    coordinates['index'] = links.length
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
      .on('click', examine)
      .on('mouseover', examine)
      .on('mouseout', examine)

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
        linkcheck();
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

function nodeFields(container, type) {

  var input = container.append('div')
    .attr('class', 'row')
    .append('form')
    .append('fieldset')

  var outer = input.append('input')
    .attr('type', 'text')
    .attr('id', type)
    .attr('placeholder', function() { return 'Enter ' + type + ' name'})
    .attr('value', '')

  var politics = input.append('input')
    .attr('type', 'text')
    .attr('id', 'politics')
    .attr('placeholder', 'Federation / Abolis / Red Corps / Other?')
    .attr('value', '')

  var content = input.append('textarea')
    .attr('placeholder', 'Any other info (history, story, etc)')
    .attr('id', 'content')
    .attr('value', '')

  function e() { }
  
  e.input = function() { return input }
  e[type] = function() { return outer; }
  e.politics = function() { return politics; }
  e.content = function() { return content; }
 
  return e;
}

function add_node() {
  d3.select('#nodetoggle').property('checked', false).text('Adding nodes disabled')

  var text = false,
    ox = d3.event.offsetX || d3.event.layerX,
    oy = d3.event.offsetY || d3.event.layerY

  var coordinates = {'ox': ox / currentScale, 'oy': oy / currentScale}

  var fields = nodeFields(infoadd, 'system'),
    input = fields.input()

  function inputEvents(type) { 
    fields.content().on('change', function() {
      coordinates['content'] = this.value
    })

    fields[type]().on('change', function() {
      coordinates['name'] = this.value
    })

    fields.politics().on('change', function() {
      coordinates['government'] = this.value
    })
  }
  
  inputEvents('system');

  newButton(input, 'cancelbutton', 'Withdraw Entry')
    .on('click', post_data)
  newButton(input, 'submitbutton', 'Register Node')
    .on('click', post_data)

  function post_data() {
    var p = coordinates.government,
        c = coordinates.content,
        s = coordinates.name,
        e = d3.event.srcElement || d3.event.currentTarget,
        id = d3.select(e).attr('id')

    if (id == 'cancelbutton') {
      newnode.remove();
      input.remove();
    }
    else if (id == 'submitbutton') { 
      if ((!p)|| (!c) || (!s)) {
        
        if (!text ) {
          text = true
          input.append('p').text(messages['entry-form'])
        }
    
      } else {
        
        newnode.attr('class', function() { 
          return p in classes ? classes[p] : 'node default'
        })

        input.remove();
        coordinates['index'] = nodes.length
        nodes.push(coordinates); save_data();
        Map();
        linkcheck();
      }
    }
  }

  var newnode = collection.append('g')
    .datum( coordinates )
    .attr('transform', function(d) {
      return 'translate(' + d.ox + ',' + d.oy + ')'})
    .append('circle')
    .attr('class', 'node default')
    .attr('r', 10)
    .style('stroke-width', '2')
    .on('mouseover', examine)
    .on('mouseout', examine)

}

function PlanetBio(src){
  var data = d3.entries(src.__data__)

  for_examine.insert('div')
    .attr('class', 'row')
    .attr('id', 'info')
    .append('div')
    .attr('class', 'large-12 columns')
    .selectAll('.entries')
    .data(data)
    .enter().append('p')
    .style('color', 'GhostWhite')
    .html(function(d) { 
      if (d.key == 'name' || d.key == 'government' || d.key == 'content' || d.key == 'target' || d.key == 'source' ) {
        return '<div class="row" style="text-align:center;"><b>' + d.key + '</b></div>' + '<div class = "row" style="text-align:center;"><div class="large-12 columns" style = "text-align:center;"><p class="entry">' + d.value + '</p></div></div>'
      }
  })
}

function examine() {
  
  var current = d3.event.srcElement || d3.event.currentTarget,
    ds = current.__data__,
    type = d3.event.type

  if (type == 'mouseover') {
        PlanetBio(current);
        if (d3.select(current).attr('class')[0] == 'n') {
          var connections = d3.select('#info')
            .append('div')
            .attr('class', 'row')
            .style('text-align', 'center')
            .html('<b>Connections</b>')
            
          d3.selectAll('.link').each( function(d) {
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
        }
  }
  if (type == 'mouseout') {
    d3.select('#info').remove();
    if (d3.select(current).attr('class')[0] == 'n') {
      d3.selectAll('.link')
        .style('stroke', '#85ffff')
    }
  }
  if (type == 'click') {
    var r = d3.select('#info')
      .attr('id', 'placeholder')
      .style('border', '1px solid GhostWhite')
      .append('div')
      .attr('class', 'large-12 columns')

    r.append('a')
      .attr('class', 'small button round expand')
      .text('remove from panel')
      .on('click', function() { 
        d3.select(this.parentElement.parentElement).remove();
      })

    r.append('a')
      .attr('class', 'small button round expand')
      .text('remove from map')
      .on('click', function() {
        d3.select(this.parentElement.parentElement).remove();
        var name = current.__data__.name,
          index = current.__data__.index

        console.log(name, index)

        if (d3.select(current).attr('class')[0] == 'n') {

          var count = 0 
          d3.selectAll('.link').each( function(d, i) {
            if (d.source == name || d.target == name) {
              links.splice( i - count, 1);
              count += 1
            }
          })
          nodes.splice(index,1)
          
        } else if (d3.select(current).attr('class')[0] == 'l') {
            d3.select(current).remove(); 
            links.splice( index, 1 );
        }
        d3.select(current).remove();
        save_data()
        Map()
      })
  }
}
