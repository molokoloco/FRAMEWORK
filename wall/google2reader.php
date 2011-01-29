<?

require_once(dirname(__FILE__).'/php/functions.php');

$feedUrl = getFeed();

?><!-- Guess what ? that a Work In Progress ! Amazing W0oT ? -->
<!DOCTYPE html> 
<html> 
<head> 
	<meta charset="utf-8">
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<title>Wall [<?=(isset($feedUrl) ? htmlentities($feedUrl) : 'Work Wild Web @ b2bWeb.fr');?>]</title> 
	<meta http-equiv="WebDev" content="^Work In Progress^ By molokoloco 2010"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<!--<meta name="viewport" content="width=device-width; initial-scale=1.0;" /> // setted by jQMob -->
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black" />
	<link rel="icon" type="image/x-icon" href="<?=$WWW;?>favicon.ico" />
	<link rel="shortcut icon" type="image/x-icon" href="<?=$WWW;?>favicon.ico" />
	<link rel="apple-touch-icon" href="<?=$WWW;?>img/apple-touch-icon.png"/>
	<link rel="image_src" href="<?=$WWW;?>img/preview.jpg"/>
	<link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="http://feeds.feedburner.com/b2bweb" />
	<link rel="stylesheet" href="<?=$WWW;?>css/jquery.mobile-1.0a2.min.css" />
	<link rel="stylesheet" href="<?=$WWW;?>css/wall.css" />
</head>
<body>

	<div data-role="page" data-theme="b" data-transition="slide">
		
		<div data-role="header" data-position="fixed" data-theme="e">
			<h1>S&eacute;lection de flux...</h1>
		</div>
		
		<div id="loading" data-theme="c">
			<img src="img/loading.gif" width="31" height="31" alt="loading" /><br />
			<p class="ui-link">Parsing OPML file...</p>
			<br />
			<h4 class="ui-link">Waiting !</h4>
		</div>
		
		<div data-role="content">
			<ul id="feeds" data-role="listview" data-filter="true" data-theme="c">
				<!-- Here come the data from wall.js... -->
			</ul>	
		</div>
	
		<footer data-role="footer" data-position="fixed" data-theme="e" class="ui-bar">
			<a href="javascript:void(0);" onClick="$('html, body').animate({scrollTop:0}, 1600);return false;" data-icon="arrow-u" title="Remonter">Remonter</a>
			<a href="javascript:(function(w){w.open('<?=$WWW;?>?url='+encodeURIComponent(w.location.href));})(window);" onClick="alert('Drag me to your bookmarks to Wallify the Web...'); return false;" title="Drag me to your bookmarks to Wallify sites and feeds with one clic..." data-icon="grid">Wallmarklet</a>
		</footer>

		<script src="<?=$WWW;?>js/jquery-1.4.4.min.js"></script>
		<script src="<?=$WWW;?>js/jquery.readerFeeds.js" type="text/javascript"></script>
		<!--<script src="<?=$WWW;?>js/jquery.mobile-1.0a2.js" type="text/javascript"></script> [readerFeeds call it !] -->

	</div>

</body>
</html>