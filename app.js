var express = require('express'),
  app = express(),
  http = require('http')

app.configure( function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views','./views');
  app.set('views','./views');
  app.set('view engine', 'jade');
  app.use(app.router);
  app.use('/public', express.static(__dirname+'/public'));
})

//app.get('/gallop_safely', function(req, res) {
//  res.render('layout.jade', {PageTitle: 'Gallop Safely!' })
//})

app.get('/', function(req, res) {
    res.render('layout.jade', {pageTitle: 'fuck' })
})
http.createServer(app).listen(app.get('port'), function() {
  console.log('listening on port ' + app.get('port'));
})
