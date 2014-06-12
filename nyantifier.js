var FeedParser = require('feedparser')
  , request = require('request');

var req = request('http://www.nyaa.se/?page=rss')
  , feedparser = new FeedParser();

req.on('error', function (error) {
  // handle any request errors
});
req.on('response', function (res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  stream.pipe(feedparser);
});


feedparser.on('error', function(error) {
  // always handle errors
});

feedparser.on('meta', function (meta) {
    console.log('===== %s =====', meta.title);
});

feedparser.on('readable', function() {
    var stream = this, item;
    while (item = stream.read()) {
      console.log('Got article: %s', item.title);
    }
  });
