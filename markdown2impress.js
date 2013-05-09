'use strict';

var argv = require('optimist')
      .default({
        w: 1200,
        h: 800,
        o: './output'
      })
      .alias('w', 'width')
      .alias('h', 'height')
      .alias('o', 'output')
      .demand(1)
      .argv;

var fs = require('fs'),
    YAML = require('yamljs'),
    _ = require('underscore')._,
    S = require('string'),
    cheerio = require('cheerio'),
    ghm = require('github-flavored-markdown');

var defs = {
  template: __dirname + '/impress.js/index.html'
}

var markdown = fs.readFileSync(argv._[0], 'utf8');

var md2html = ghm.parse(markdown);

var $ = cheerio.load(fs.readFileSync(defs.template, 'utf8'));

$('#impress').html(md2html);

var x = 0, y = 0, maxX = 0, maxY = 0;

function getOption(e) {
  var opt = {},
      data;

  while ((e = e.next) && e.type !== 'tag') {
    if (e.type === 'comment') {
      data = S(e.data).trim();
      opt = YAML.parse(data.s);
      break;
    }
  }

  if (_.isString(opt['data-x'])) {
    opt['data-x']
  }

  x += argv.w;
  if (x >= argv.w * 4) {
    x = 0;
    y += argv.h;
  }

  if (maxX < x) {
    maxX = x;
  }

  if (maxY < y) {
    maxY = y;
  }

  opt = _.defaults(opt, {
    'data-x': x,
    'data-y': y,
    'data-z': 1,
    'data-scale': 1,
    'data-rotate': 0
  });

  return opt;
}

//$('h1,h2').each(function(i, elem) {
//  var e = $(this),
//      name,
//      $html = cheerio.load('<div class="step"></div>'),
//      div = $html('div');
//
//  div.attr(getOption(elem));
//
//  do {
//    div.append($.html(e));
//    e = e.next();
//  } while (e && e.length > 0 && !/h[1-6]/i.test(e[0].name));
//
//  html.push($html.html());
//});

$('#impress').find('h1,h2').each(function(i, elem) {
  var e = $(this),
      name,
      tmp,
      div = e.before('<div class="step"></div>').prev();

  div.attr(getOption(elem));

  do {
    div.append($.html(e));
    tmp = e;
    e = e.next();
    tmp.remove();
  } while (e && e.length > 0 && !/h[1-6]/i.test(e[0].name));
});

$('#impress .step').last().after('<div id="overview" class="step"></div>').next().attr({
  'data-x': (maxX - argv.w) / 2,
  'data-y': (maxY - argv.h) / 2,
  'data-scale': 4
});

fs.writeFileSync(argv.o + '/index.html', $.html(), 'utf8');

console.log('ok');
