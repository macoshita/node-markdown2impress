'use strict';

var fs = require('fs'),
    cheerio = require('cheerio'),
    ghm = require('github-flavored-markdown');

var opts = {
  width: 1200,
  height: 800,
  maxColumn: 5,
  outputdir: __dirname + '/output'
}

var defs = {
  template: __dirname + '/impress.js/index.html'
}

var markdown = fs.readFileSync(process.argv[2], 'utf8');

var md2html = ghm.parse(markdown);

var $ = cheerio.load(md2html);

var html = [];

$('h1,h2').each(function(i, elem) {
  var $e = $(this),
      name = $e[0].name;

  html.push('<div class="step">');

  if (name === 'h1') {
    html.push($e.html(), '</div>');

  } else {
    do {
      html.push($e.html());
      $e = $e.next();
    } while ($e && $e.length > 0 && !/h1|2/i.test($e[0].name));

    html.push('</div>');
  }
});

$ = cheerio.load(fs.readFileSync(defs.template, 'utf8'));

$('#impress').html(html.join(''));

var x = 0, y = 0;

$('.step').each(function(i, elem) {
  var $e = $(this);

  $e.attr('data-x', x);
  $e.attr('data-y', y);

  x += opts.width;
  if (x == opts.width * 3) {
    x = 0;
    y += opts.height;
  }
});

fs.writeFileSync(opts.outputdir + '/index.html', $.html(), 'utf8');

console.log('ok');
