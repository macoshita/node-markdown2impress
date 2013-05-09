'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('underscore')._,
    cheerio = require('cheerio'),
    marked = require('marked'),
    utils = require('./utils');

var argv = require('optimist')
  .demand(1)
  .options('width', {
    describe: 'width of slide',
    default: 1200
  })
  .options('height', {
    describe: 'height of slide',
    default: 800
  })
  .options('output', {
    describe: 'output filename (default: .md\'s path replaced .md to .html)',
    alias: 'o',
    string: true
  })
  .options('template', {
    describe: 'template html having "#impress" ID tag',
    default: path.resolve(__dirname, '../template/index.html')
  })
  .argv;

var input = argv._[0];

if (!argv.output) {
  argv.output = path.basename(input, path.extname(input)) + '.html';
}

var md2html = (function() {
  var markdown = fs.readFileSync(input, 'utf8');
  return marked(markdown);
})();

var $ = cheerio.load(fs.readFileSync(argv.template, 'utf8'));

$('#impress').html(md2html);

var H_TAG = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

var _opt = {
  x: 0,
  y: 0,
  rotate: 0
};

$('#impress').find(H_TAG.join(',')).each(function(i, elem) {
  var e = $(this),
      name,
      tmp,
      opt,
      div = e.before('<div></div>').prev().addClass('step'),
      hTagIndex = _.indexOf(H_TAG, e[0].name);

  opt = utils.getOptions(elem, {
    'data-x': _opt.x,
    'data-y': _opt.y,
    'data-z': 1,
    'data-scale': 1,
    'data-rotate': _opt.rotate
  });

  div.attr(_.omit(opt, 'class'));

  if (opt.class) {
    div.addClass(opt.class);
  }

  _.each(_opt, function(v, k) {
    _opt[k] = opt['data-' + k];
  });

  var theta = _opt.rotate * Math.PI / 180;
  _opt.x += Math.cos(theta) * argv.width;
  _opt.y += Math.sin(theta) * argv.width;

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

fs.writeFileSync(argv.output, $.html(), 'utf8');

console.log('ok');
