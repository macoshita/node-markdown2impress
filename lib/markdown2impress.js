'use strict';

var argv = require('optimist')
  .default({
    w: 1200,
    h: 800,
    column: 5,
    o: __dirname + '/impress.js',
    templatedir: '../template'
  })
  .alias('w', 'width')
  .alias('h', 'height')
  .alias('o', 'outputdir')
  .demand(1)
  .argv;

var fs = require('fs'),
    _ = require('underscore')._,
    cheerio = require('cheerio'),
    marked = require('marked'),
    utils = require('./utils');

var md2html = (function() {
  var markdown = fs.readFileSync(argv._[0], 'utf8');
  return marked(markdown);
})();

var $ = cheerio.load(fs.readFileSync(argv.templatedir + '/index.html', 'utf8'));

$('#impress').html(md2html);

var H_TAG = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

var x = 0, y = 0, rotate = 0, maxX = 0, maxY = 0;

$('#impress').find(H_TAG.join(',')).each(function(i, elem) {
  var e = $(this),
      name,
      tmp,
      opt,
      div = e.before('<div class="step"></div>').prev(),
      hTagIndex = _.indexOf(H_TAG, e[0].name);

  opt = utils.getOptions(elem, {
    'data-x': x,
    'data-y': y,
    'data-z': - hTagIndex * 1000,
    'data-scale': 1,
    'data-rotate': rotate
  });

  rotate = opt['data-rotate'];

  div.attr(opt);

  do {
    div.append($.html(e));
    tmp = e;
    e = e.next();
    tmp.remove();
  } while (e && e.length > 0 && !/h[1-6]/i.test(e[0].name));
});

//$('#impress').append('<div id="overview" class="step"></div>').find('#overview').attr({
//  'data-x': (maxX - argv.w) / 2,
//  'data-y': (maxY - argv.h) / 2,
//  'data-scale': argv.column
//});

fs.writeFileSync(argv.o + '/index.html', $.html(), 'utf8');

console.log('ok');
