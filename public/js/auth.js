var main = d3.select('body')
  .style('background-color', 'black')

var auth = main.append('div')
  .attr('class', 'row')
  .append('form')
  .attr('action', '/mapauth')

auth.append('div')
  .attr('class', 'row')
  .append('label')
  .text('Oh, you think you know Bandaygo? What\'s the password, then, eh?')
  .style('color', 'GhostWhite')

auth.append('div')
  .attr('class', 'row')
  .append('input')
  .attr('type', 'text')
  .attr('name', 'password')
  .attr('placeholder', 'I\'m waitin\'....')

