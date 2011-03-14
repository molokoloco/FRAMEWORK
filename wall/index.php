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
	<link rel="image_src" href="<?=$WWW;?>img/wallify-jquery-plugin.jpg"/>
	<link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="http://feeds.feedburner.com/b2bweb" />
	<!--link rel="stylesheet" href="<?=$WWW;?>css/jquery.mobile-1.0a2.min.css" />-->
	<link rel="stylesheet" href="<?=$WWW;?>css/wall.css" />
</head>
<body>

	<header>
		<form action="#" method="get" name="formFeed" id="formFeed">
			<a href="<?=$WWW;?>google2reader.php" class="button blue" title="Choisir un flux RSS"><div class="icon gear"></div>Flux<span></span></a><input type="url" name="url" id="url" value="<?=htmlentities(urldecode($feedUrl));?>" title="Fluid interface @ BornToBeWeb, give me feed, give me food !" size="10"/>&nbsp;<a href="javascript:void(0);" onClick="$('form#formFeed').trigger('submit');" class="button blue" title="Choisir un flux RSS">Wallify&nbsp;!<span></span></a>
		</form>
	</header>

	<div id="page">
		<div id="hMasonry">
			<div id="masonry">
				<!-- Here come the data from wall.js... -->
			</div>
		</div>
		<p id="infrafooter"><a href="http://www.b2bweb.fr/molokoloco/scroll-wall-jquery-mobile-masonry/" target="_blank">Source code</a> | <a href="mailto:molokoloco@gmail.com" id="a_0" title="Aka Julien Gu&eacute;zennec o_O">molokoloco</a> <img src="http://www.b2bweb.fr/images/copyleft.png" alt="Copyleft" width="12" height="12" border="0" align="baseline"/> <a href="http://www.b2bweb.fr/" title="b2bweb.fr" target="_blank">b2bweb.fr</a><br />
		Want a fast home page ? <a href="http://home.b2bweb.fr" title="Start Page" target="_blank">http://home.b2bweb.fr</a></p>
		<a href="https://github.com/molokoloco/FRAMEWORK/" title="See source code on GITHUB..." target="_blank"><img style="position:fixed;top:0;right:0;border:0;z-index:999;" src="img/github-ribbon.png" width="100" height="100" alt="Fork me on GitHub"></a>
	</div>

	<footer>
		<a href="javascript:void(0);" onClick="$('html, body').animate({scrollTop:0}, 1600);" class="button blue right" title="Remonter" id="up" style="display:none;"><div class="icon arrow"></div><span></span> Up</a> <a href="http://www.b2bweb.fr/" class="button blue right" title="http://www.b2bweb.fr"><div class="icon home"></div><span></span> Home</a>
		<span id="scrollInfos"></span>
		<a href="javascript:(function(w){w.open('<?=$WWW;?>?url='+encodeURIComponent(w.location.href));})(window);" onClick="alert('Drag me to your bookmarks to Wallify site/feed with one clic...'); return false;" title="Drag me to your bookmarks to Wallify site with one clic..." class="button gray left"><div class="icon grid"></div>Wallmarklet<span></span></a>
	</footer>
	
	<script src="<?=$WWW;?>js/jquery-1.4.4.min.js"></script>
	<script src="<?=$WWW;?>js/jquery.masonry.min.js" type="text/javascript"></script>
	<script src="<?=$WWW;?>js/jquery.xcolor.min.js" type="text/javascript"></script>
	<script src="<?=$WWW;?>js/jquery.wall.js" type="text/javascript"></script>
	<!--<script src="<?=$WWW;?>js/jquery.mobile-1.0a2.js" type="text/javascript"></script>-->
	<? if (!$local) {
		?>
		<script src="http://www.google-analytics.com/urchin.js" type="text/javascript"></script>
		<script type="text/javascript">_uacct = 'UA-1944677-3'; urchinTracker();</script>
		<?
	} ?>

</body>
</html>