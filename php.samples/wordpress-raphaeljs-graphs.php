<?php

// Remixed by @molokoloco 2010 from http://raphaeljs.com
//
// This file is not garanted to work as-this... but it's easy to try ;)
// Example here : http://www.b2bweb.fr/graphs/
//
// Put this file into your Wordpress template directory 
// and create a page in your administration
// The name "Graphs" (below) must appear in template pages list... 
// Validate and goto to yoursite.com/graphs/


/*
Template Name: Graphs
*/

// In function.php //////////////////////////////////////////////////////////////////////////
/*
	function un_html_entities($string) {
		//return  html_entity_decode(aff($string),ENT_COMPAT,'ISO-8859-15');
		$trans_tbl = get_html_translation_table(HTML_ENTITIES);
		$trans_tbl = array_flip($trans_tbl);
		return strtr($string, $trans_tbl);
	}
	function stripTags($string) {
		$string = preg_replace("/<br(.*?)>/", " \n",$string); // Retour à la ligne avec espace
		$string = preg_replace("/<\/(pre|ul|li|p|table|tr)>/", "\n", $string);
		$string = preg_replace("/<(.*?)>/","",$string);
		$dastringta = preg_replace("/\n\n+/", "\n\n", $string);
		return $string;
	}
*/

get_header(); 


$cacheBase = dirname(__FILE__).'/cache/';
//if (!is_dir($cacheBase)) mkdir($cache, 0777);
$cache = $cacheBase.'canvas-'.date("Ymd").'.json';
### @unlink($cache);

if (!is_file($cache)) { // Must cache if you don't want WP to ....
	@ignore_user_abort(true);
	
	$articles = array();
	$max = 15;
	$count = 1;
	
	query_posts('cat=16,92&posts_per_page=50&orderby=rand'); // Custom Cat (for me)
	
	if (have_posts()) : 
		while (have_posts()) : the_post(); 
			$posttags = get_the_tags();
			$taggs = array();
			foreach((array)$posttags as $tag) {
				$taggs[] = addslashes($tag->name);
			}
			if (count($taggs) > 2) {
				$title = the_title('', '', false);
				if (strpos($title, '&#') === FALSE) { // for the moment, i cannot un_html_entities() that, some titles in the blog came from strange rss feed...
					$title = str_replace('’', '\'', $title);
					$title = stripTags(un_html_entities(utf8_decode($title)));
					if (strlen($title) > 40) $title = substr($title, 0, 40).' (...)';
					$articles[] = "{href:'".get_permalink()."', title:'".utf8_encode(addslashes($title))."', tags:'".implode(',', $taggs)."'}";
					
					if ($count >= $max) break;
					else $count++;
				}
			}
		endwhile;
		$articles = implode(',', $articles);
	endif;
	
	wp_reset_query();
	

	$cachefile = @fopen($cache, 'wb');
	@fwrite($cachefile, $articles);
	@fclose($cachefile);
	@ignore_user_abort(false);
}
else $articles = @file_get_contents($cache);

//db($articles);

?>
<style type="text/css">
#holder {
	width: 600px;
	height: 800px;
}
div.post { height: 920px; }
p.legende {
	text-align: center;
	margin:10px 0;
}
</style>
<script src="http://www.b2bweb.fr/js/jquery.min.js" type="text/javascript" charset="utf-8"></script>
<script src="http://www.b2bweb.fr/js/raphael-min.js" type="text/javascript" charset="utf-8"></script>
<script type="text/javascript" charset="utf-8">
	/*
	Demo of Raphaël (http://raphaeljs.com) — JavaScript Vector Library
	Remixed by molokoloco 07/2010 - http://b2bweb.fr
	*/
	
	var db = function(x) { if (('console' in window) && ('firebug' in console)) console.log(x); }
	
	var articles = [<?=$articles;?>]; // From Php
	
	Raphael.fn.connection = function (obj1, obj2, line, bg, tag) {
		if (obj1.line && obj1.from && obj1.to) {
			line = obj1;
			obj1 = line.from;
			obj2 = line.to;
		}
		var bb1 = obj1.getBBox(),
			bb2 = obj2.getBBox(),
			p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
			{x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
			{x: bb1.x - 1, y: bb1.y + bb1.height / 2},
			{x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
			{x: bb2.x + bb2.width / 2, y: bb2.y - 1},
			{x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
			{x: bb2.x - 1, y: bb2.y + bb2.height / 2},
			{x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
			d = {}, dis = [];
		for (var i = 0; i < 4; i++) {
			for (var j = 4; j < 8; j++) {
				var dx = Math.abs(p[i].x - p[j].x),
					dy = Math.abs(p[i].y - p[j].y);
				if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
					dis.push(dx + dy);
					d[dis[dis.length - 1]] = [i, j];
				}
			}
		}
		if (dis.length == 0) var res = [0, 4];
		else res = d[Math.min.apply(Math, dis)];
		var x1 = p[res[0]].x,
			y1 = p[res[0]].y,
			x4 = p[res[1]].x,
			y4 = p[res[1]].y;
		dx = Math.max(Math.abs(x1 - x4) / 2, 10);
		dy = Math.max(Math.abs(y1 - y4) / 2, 10);
		var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
			y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
			x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
			y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
		var path = ['M', x1.toFixed(3), y1.toFixed(3), 'C', x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(',');
		if (line && line.line) {
			line.bg && line.bg.attr({path: path});
			line.line.attr({path: path});
			line.tag.attr({x:parseInt(x1 + line.randX), y:parseInt(y1 + line.randY)});
		}
		else {
			var color = typeof line == 'string' ? line : '#000';
			var randX = parseInt(Math.random() * 60);
			var randY = parseInt(Math.random() * 40) + 15;
			return {
				bg: bg && bg.split && this.path(path).attr({stroke: bg.split('|')[0], fill: 'none', 'stroke-width': bg.split('|')[1] || 1}),
				line: this.path(path).attr({stroke: color, fill: 'none', 'stroke-dasharray': '- '}),
				tag: this.text(parseInt(x1 + randX), parseInt(y1 + randY), tag).attr({font:'11px Helvetica, Verdana', fill:'#666666'}), // , 'fill-opacity': .6
				randX: randX,
				randY: randY,
				from: obj1,
				to: obj2
			};
		}
	};

	$(window).load(function () { // Let's Boom :)
	
		var shapes = [], connections = [];
		var W = 600, H = 800;
		
		var r = Raphael('holder', W, H);
		
		var dragger = function () {
			this.ox = this.attr('x');
			this.oy = this.attr('y');
			//this.animate({fill:'#666'}, 500);
			this.attr({fill:'#666'});
		};
		
		var move = function (dx, dy) {
			var att = {x: this.ox + dx, y: this.oy + dy};
			this.attr(att);
			$(this).data(att);
			for (var i = 0, ii = connections.length; i < ii; i++) {
				r.connection(connections[i]);
			}
			r.safari();
		};
		
		var up = function () {
			//this.animate({fill:'#BBB'}, 1000);
			this.attr({fill:'#1E91D4'});
		};
		
		var titlesY = [];
		for (var i = 0, ii = articles.length; i < ii; i++) {
			var tags = articles[i]['tags'].split(',');
			
			// Built title
			shapes[i] = r.text(0, 0, articles[i]['title']).attr({font:(Math.floor(tags.length*2.5) + 10)+'px Helvetica, Verdana', fill:'#1E91D4', cursor:'move'});
			
			// Adjust with text width
			var b = shapes[i].getBBox();
			var bx = 30 + Math.floor(Math.random() * (W- 60 - (b.width / 2)));
			var by = 0;
			while(true) { // Check if not so close from an other title
				by = 30 + Math.floor(Math.random() * (H - 60 - (b.height / 2)));
				for (var y = 0, yy = titlesY.length; y < yy; y++) {
					if (Math.abs(by - titlesY[y]) < (b.height + 20)) continue;
				};
				break; 
			}
			titlesY[i] = by;
			shapes[i].attr({x:bx, y:by});
			
			// Raphael drag & drop
			shapes[i].drag(move, dragger, up);
			
			// Article link...
			$(shapes[i]).data({'href':articles[i]['href'], x:bx, y:by}); // jQuery to stock original position before motor() start
			shapes[i].dblclick(function() { window.open($(this).data('href'), '_win'+i); });
		}
	
		// On recommence maintenant que l'on a toutes les shapes.. let's build connections..
		var connected = []; // To build only one connection between 2 articles with same tag
		for (var i = 0, ii = articles.length; i < ii; i++) {
			var tags = articles[i]['tags'].split(',');
			for (var j = 0, jj = tags.length; j < jj; j++) { // Pour chaque tag de l'article
				for (var k = 0, kk = articles.length; k < kk; k++) { // On regarde tous les autres articles
					if (k == i) continue; // not himself
					if (articles[k]['tags'].indexOf(tags[j]) >= 0) {
						var exist = false;
						for (var c = 0, cc = connected.length; c < cc; c++) {
							if (!connected[c]) continue;
							for (var d = 0, dd = connected[c].length; d < dd; d++) {
								if ((c == i && d == k) || (c == k && d == i)) {
									exist = true;
									c = cc; d = dd; // break;
								}
							}
						}
						if (!exist) {
							connections.push(r.connection(shapes[i], shapes[k], '#CACED1', '', tags[j]));
							if (!connected[i]) connected[i] = [];
							connected[i].push(k); // Stock connection that exist
							break;
						}
					}
				} 	 
			}
		}
		
		// Animate
		var frameRate = 1000 / 25; // 25f/s
		var motor = setInterval(function(coef, inc, connections_, r_) {
			for (var i = 0, ii = shapes.length; i < ii; i++) { // 
				if (!inc[i]) inc[i] = (Math.random() / 10);
				if (!coef[i] && coef[i] !== 0) coef[i] = Math.floor(Math.random() * 10);
				else coef[i] += inc[i];
				shapes[i].attr({
					x: Math.floor($(shapes[i]).data('x') + (Math.sin(coef[i]) * 15)),
					y: Math.floor($(shapes[i]).data('y') + (Math.cos(coef[i]) * 15))//,
					//'fill-opacity': 0.5 + ((shapes[i].attr('y') - $(shapes[i]).data('y')) / 100)
				});
			}
			for (var j = 0, jj = connections_.length; j < jj; j++) r_.connection(connections_[j]);
			
		}, frameRate, [], [], connections, r);
		
		r.safari();
	});
	
	</script>
	<div class="post">
		<div class="p-head"><h1>Tags connexions between random articles</h1></div>
		<div class="p-con justify">
			<div id="holder"></div>
			<p class="legende">Clic Titles to drag, double clic to open<!--. <a href="http://www.b2bweb.fr/graphs/">Refresh view</a>--> - <a href="http://www.b2bweb.fr/molokoloco/canvas-wordpress-experiment-with-raphael-js/" target="_blank">Read more</a> / <a href="http://www.b2bweb.fr/wp-content/uploads/graphs.php_.txt" target="_blank">Download</a><br />
			Canvas Test by molokoloco 2010 with <a href="http://raphaeljs.com/" target="_blank">http://raphaeljs.com</a></p>
		</div>
	</div>
<?php 
get_footer(); ?>