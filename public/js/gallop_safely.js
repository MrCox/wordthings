var nodes = JSON.parse(GTA_data.nodes),
links = JSON.parse(GTA_data.links)

var b = d3.select(window)[0][0],
  w = b.innerWidth,
  h = b.innerHeight

var messages = 'GTA policy dictates that all system registry fields be completed upon form submission.'

d3.select('#panel')
  .style('height', h + 'px')

var panel = d3.select('#innerpanel'),
  pwidth = panel[0][0].clientWidth

var nodetoggle = d3.select('#nodetoggle')
  .property('checked', false)
  .text('Adding nodes disabled')

var linktoggle = d3.select('#linktoggle')
  .property('checked', false)
  .text('Adding links disabled')

var map = d3.select('#map')
  .style('height', h + 'px')

var collection = d3.select('#collection')

var infoadd = d3.select('#infoadd')

var for_examine = d3.select('#for_examine')

function Map() {
//  var ev = {};
//  if (navigator.userAgent.indexOf('Firefox') != -1 && parseFloat(navigator.userAgent.substring(navigator.userAgent.indexOf('Firefox') + 8)) >= 3.6) 
//    { ev.offsetX = false } 
  
//  var linknodes = d3.select('#canvas').selectAll('.link')
//    .data(links)

//  linknodes.enter().append('line')
//    .attr('x1', function(d) {
//      if (ev.offsetX == true) {
//        return nodes[ d.source ].ox
//      } else { return nodes[ d.source ].lx }
 //   })
//    .attr('y1', function(d) {
//      if (ev.offsetX == true) {
//        return nodes[ d.source ].oy }
//      else { return nodes[d.source].ly}
//    })
//    .attr('x2', function(d) {
//      if (ev.offsetX == true) {
//        return nodes[ d.target ].ox }
//      else {return nodes[ d.target ].lx }
//    })
//    .attr('y2', function(d) {
//      if (ev.offsetX == true) {
//        return nodes[d.target].oy }
//      else { return nodes[d.target].ly}
//    })
//
//  linknodes.exit().remove();
  
  var mapnodes = collection.selectAll('.node')
    .data(nodes)

  mapnodes.enter().append('g')
    .attr('transform', function(d, i) {
      var x = d.ox || d.lx,
        y = d.oy || d.ly
        d['index'] = i
      return 'translate(' + x + ',' + y + ')'})
    .append('circle')
    .attr('class', function(d) { 
      var p = d.government
      if (!((p=='Federation')||(p=='Abolis')||(p=='Other')||(p=='Red Corps'))) {
        return 'node default'
      } 
      return 'node ' + d.government })
    .attr('r', 10)
    .on('mouseover', examine)
    .on('mouseout', examine)

  mapnodes.exit().remove();
}

Map();

nodetoggle.on('click', function() {
  var checked = d3.select(this)
    .property('checked')

  if (checked) { 
    d3.select(this)
      .property('checked', false)
      .text('Adding nodes disabled')
  } else {
    d3.select(this)
      .property('checked', true)
      .text('Adding nodes enabled')

    d3.select('#linktoggle')
      .property('checked', false)
      .text('Adding links disabled')
  }

})

linktoggle.on('click', function() {
  var checked = d3.select(this)
    .property('checked')

  if (checked) {
    d3.select(this)
      .property('checked', false)
      .text('Adding links disabled')
    
  } else {
    d3.select(this)
      .property('checked', true)
      .text('Adding links enabled')

    d3.select('#nodetoggle')
      .property('checked', false)
      .text('Adding nodes disabled')
  }
})

collection.on('click', function() {
  var checked = d3.select('#nodetoggle').property('checked')
  if (checked) { add_node()}
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

var coordinates = {}

function add_link() {
  //d3.select('#linktoggle').property('checked', false).text('Adding links disabled')
    var e = d3.event.srcElement || d3.event.currentTarget,
    d = e.__data__,
    ev = d3.event

  if (!(coordinates.source)) {
    coordinates['source'] = d.index
    
    infoadd.append('div')
      .attr('class', 'row')
      .attr('id', 'current')
      .append('div')
      .attr('class', 'large-12 columns')
      .attr('id', 'current_cont')
      .append('p')
      .html(function() { 
        return "Source Node: <b>" + d.name + "</b>. Select destination node."
      })
  } else {
    coordinates['target'] = d.index

    var c = coordinates

    d3.select('#current_cont').append('p')
      .html(function() {
        return "Destination Node: <b>" + d.name + '</b>'
      })

    var newline = d3.select('#canvas').append('line')
      .datum(coordinates)
      .attr('class', 'link')
      .attr('x1', function(d) {
        if (ev.offsetX) {
          return nodes[ d.source ].ox
        } else { return nodes[ d.source ].lx }
      })
      .attr('y1', function(d) {
        if (ev.offsetX) {
          return nodes[ d.source ].oy }
        else { return nodes[d.source].ly}
      })
      .attr('x2', function(d) {
        if (ev.offsetX) {
          return nodes[ d.target ].ox }
        else {return nodes[ d.target ].lx }
      })
      .attr('y2', function(d) {
        if (ev.offsetX) {
          return nodes[d.target].oy }
        else { return nodes[d.target].ly}
      })

    d3.select('#current').append('div')
      .attr('class', 'large-12 columns')
      .append('a')
      .attr('class', 'small button round expand')
      .text('Register Connection')
      .on('click', function() { 
        links.push(coordinates)
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
  }
}

function add_node() {
  d3.select('#nodetoggle').property('checked', false).text('Adding nodes disabled')

  var text = false

  var coordinates = {'lx':d3.event.layerX, 'ly':d3.event.layerY,
    'ox':d3.event.offsetX, 'oy':d3.event.offsetY}

  var input = infoadd
    .append('div')
    .attr('class', 'row')
    .append('form')
    .append('fieldset')

  var system = input.append('input')
    .attr('type', 'text')
    .attr('id', 'system')
    .attr('placeholder', 'Enter system / planet name')
    .attr('value','') 
    
  var politics = input.append('input')
    .attr('type', 'text')
    .attr('id', 'politics')
    .attr('placeholder', 'Federation / Abolis / Red Corps / Other?')
    .attr('value', '')
    
  var content = input.append('textarea')
    .attr('placeholder', 'Any other info ( history, story etc )')
    .attr('id', 'content')
    .attr('value', '')
    
  content.on('change', function() {
      coordinates['content'] = this.value
    })

  system.on('change', function() { 
      coordinates['name'] = this.value
    })

  politics.on('change', function() {
      coordinates['government'] = this.value
    })

  input.append('div')
    .attr('class', 'row')
    .append('div')
    .attr('class', '1arge-12 columns')
    .append('a')
    .attr('id', 'cancelbutton')
    .attr('class', 'small button round expand')
    .text('Withdraw Entry')
    .on('click', post_data)

  input.append('div')
    .attr('class', 'row')
    .append('div')
    .attr('class', 'large-12 columns')
    .append('a')
    .attr('id', 'submitbutton')
    .attr('class', 'small button round expand')
    .text('Register Node')
    .on('click', post_data)
    
  var newnode = collection.append('g')
    .datum( coordinates )
    .attr('transform', function() {
      var x = coordinates.ox || coordinates.lx,
          y = coordinates.oy || coordinates.ly
      return 'translate(' + x + ',' + y + ')'})
    .append('circle')
    .attr('class', 'node default')
    .attr('r', 10)
    .on('mouseover', examine)
    .on('mouseout', examine)

  function post_data() {
    var p = coordinates.government,
        c = coordinates.content,
        s = coordinates.name,
        e = d3.event.srcElement || d3.event.currentTarget,
        id = d3.select(e)[0][0].id

    if (id == 'cancelbutton') {
      newnode.remove();
      input.remove();
    }
    else if (id == 'submitbutton') { 
      if ((!p)|| (!c) || (!s)) {
        
        if ( text == false ) {
          text = true
          input.append('p').text(messages)
        }
      
      } else {
        
        newnode.attr('class', function() { 
          if (p=='Federation' || p == 'Abolis' || p == 'Red Corps' || p=='Other') {
            return 'node ' + p
          } else { return 'node default'}
        })

        input.remove();
        coordinates['index'] = nodes.length
        nodes.push(coordinates);
        save_data();
        Map();
        linkcheck();
      }
    }
  }
}

function examine() {

  var current = d3.event.srcElement || d3.event.currentTarget,
    data = d3.entries(current.__data__)

  if (d3.event.type == 'mouseover') {
    for_examine.insert('div')
      .attr('class', 'row')
      .attr('id', 'info')
      .append('div')
      .attr('class', 'large-12 columns')
      .selectAll('.entries')
      .data(data)
      .enter().append('p')
      .style('color', 'GhostWhite')
      .text(function(d) { 
        if (d.key != 'ly' && d.key != 'lx' && d.key != 'oy' && d.key != 'ox' && d.key != 'index') {
          return d.key + ": " + d.value 
        }
      })
  }
  if (d3.event.type == 'mouseout') {
    d3.select('#info').remove();
  }
  if (d3.event.type == 'click') {
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
        d3.select(current).remove();
        d3.select(this.parentElement.parentElement).remove();
        var index = current.__data__.index
        nodes.splice( index, 1)
        save_data();
      })
  }
}

