var express = require('express'),
  app = express(),
  http = require('http'),
  fs = require('fs');

app.configure( function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views','./views');
  app.set('views','./views');
  app.set('view engine', 'jade');
  app.use(app.router);
  app.use('/public', express.static(__dirname+'/public'));
})
var j = 0;
app.get('/gallop_safely', function(req, res) {
  res.render('mapauth.jade', {PageTitle: 'WHO IS YOUR FATHER?'})
  j += 1
  fs.appendFile('./count.js', ', ' + j, function(err) {
    if (err) throw err
  })
})
app.get('/', function(req, res) {
  res.redirect('/gallop_safely');
})

app.get('/mapauth', function(req, res) {
  var pass = req.query.password;
  if (pass == "The eyes are on the roofs and in the alleys.")
    res.render('userMap.jade');
  else res.render('mapauth.jade');
});
http.createServer(app).listen(app.get('port'), function() {
  console.log('listening on port ' + app.get('port'));
});
