

var rasterize = require('../lib/rasterize')
//  , imagemap = require('../lib/imagemap')
  , ratelimit = require('../lib/ratelimit')
  , Batch = require('../lib/batch')
  , utils = require('../lib/utils')
  , path = require('path')
  , join = path.join
  , fs = require('fs');

var dir = app.set('screenshots')
  , db = app.db;

/*
 * GET home page.
 */

app.get('/', function(req, res, next){

  var from = -4
    , to = -1
    , batch = new Batch;

  db.zrange('render:ids', from, to, function(err, ids){
    if (err) return next(err);

    // fetch
    ids.forEach(function(id){
      batch.push(function(fn){
        db.hgetall('render:' + id, fn);
      });
    });

    // finished
    batch.end(function(err, objs){
      if (err) return next(err);
      res.render('index', { layout: false, screenshots: objs });
    })
  });

});



/**
 * GET serve when already rasterized.
 */
app.get('/image/:url(*)', function(req, res, next){
  var url = utils.url(req.params.url);
  db.hget('render:url:id', url, function(err, id){
    if (err) return next(err);
    if (!id) return next();
    db.hget('render:' + id, 'path', function(err, path){
      if (err) return next(err);
      console.log(path);
      console.log('screenshot - serving rasterized %s', url);
      res.sendfile(path + id + ".png");
    });
  });
});

/*
 * GET screenshot.
 */
app.get('/image/:url(*)', function(req, res, next){
	var url = utils.url(req.params.url);
	if (!url) return next();
	
	
	//var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var expression = /(https?:\/\/)?([a-z0-9\.]+)?\.[a-z]{2,4}/gi;
	var regex = new RegExp(expression);
	 
	//if we have a valid URL, then go fetch
	if (url.match(regex)) {
			console.log("fetching screenshot for " + url);
		  var id = utils.md5(url);
		
		  var options = {
			//TODO: render to .PDF instead of .PNG - then run tesseract on image
			  "path": dir
			, "id": id
			, "viewportWidth": req.query.width || app.set('default viewport width')
			, "viewportHeight": req.query.height || app.set('default viewport height')
		  };

		  rasterize(url, options, function(err){
			if (err) return next(err);
			console.log('screenshot - rasterized %s', url);
			//magic!
			app.emit('render', url, options.path, id);
			res.sendfile(options.path + id + ".png");
		  }); 
	}
	else {
		return next();
	}
});






/**
 * GET serve when already rasterized.
 */
app.get('/view/:url(*)', function(req, res, next){
  var url = utils.url(req.params.url);
  db.hget('render:url:id', url, function(err, id){
    if (err) return next(err);
    if (!id) return next();
    db.hget('render:' + id, 'path', function(err, path){
      if (err) return next(err);
      console.log('screenshot - serving rasterized %s', url);
      res.sendfile(path + id + ".html");
    });
  });
});



/*
 * GET screenshot.
 */
app.get('/view/:url(*)', function(req, res, next){
	var url = utils.url(req.params.url);
	if (!url) return next();
	
	
	//var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
	var expression = /(https?:\/\/)?([a-z0-9\.]+)?\.[a-z]{2,4}/gi;
	var regex = new RegExp(expression);
	 
	//if we have a valid URL, then go fetch
	if (url.match(regex)) {
			console.log("fetching screenshot for " + url);
		  var id = utils.md5(url);
		
		  var options = {
			//TODO: render to .PDF instead of .PNG - then run tesseract on image
			  "path": dir
			, "id": id
			, "viewportWidth": req.query.width || app.set('default viewport width')
			, "viewportHeight": req.query.height || app.set('default viewport height')
		  };

		  rasterize(url, options, function(err){
			if (err) return next(err);
			console.log('screenshot - rasterized %s', url);
			//magic!
			app.emit('render', url, options.path, id);
			res.sendfile(options.path + id + ".html");
		  }); 
	}
	else {
		return next();
	}
});
