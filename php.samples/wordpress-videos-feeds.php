<?php

// This file is not garanted to work as-this... but it's easy to try ;)
// Example here : http://www.b2bweb.fr/videos/
// Put this file into your Wordpress template directory and create a page in your administration
// The name "Videos" (below) must appear in template pages list... Validate and goto to yoursite.com/videos/

/*
Template Name: Videos
*/

### ini_set('error_reporting', E_ALL & ~E_NOTICE); // Wana debug ?
### ini_set('display_errors', 'on');

$ROOT = '/home/b2bweb/www/'; // Define main UNIX root-path (to the dir where your want files to be processed)
$cacheBase = $ROOT.'cache/';
### if (!is_dir($cacheBase)) mkdir($cacheBase, 0777);
$cacheContent = $cacheBase.'videos-'.date("Ymd");  // Build a  file cache per day... put "Ymdh" to build a cache per hour....
### @unlink($cacheContent); // debug...

///////////// FEEDER ///////////////////////////////////////////////////
function getVideoFromFeed($feedUrl) {
	
	ob_start();
	
	global $WWW; // http://www.b2bweb.fr/
	global $ROOT;
	global $cacheBase;
	
	//require_once($ROOT.'php/simplePie/simplepie.inc'); // Already in Wordpress
	require_once($ROOT.'php/simplePie/idn/idna_convert.class.php'); // Not sure it was necessary...
	require_once($ROOT.'php/phpthumb/ThumbLib.inc.php'); // Image resizer class // Find it here : http://phpthumb.gxdlabs.com/
	
	$feed = new SimplePie();
	//$feed->force_fsockopen(true);
	//$feed->force_feed(true);
	//$feed->enable_cache(true);
	//$feed->enable_xml_dump(isset($_GET['dump']) ? true : false);
	$feed->set_output_encoding('UTF-8'); // Maybe better to work in iso for PHP (cf. jsonClean()) ?
	//$feed->enable_order_by_date(false);
	//$feed->set_image_handler('./libs/simplePie/handler_image.php');
	//$feed->set_favicon_handler('./libs/simplePie/handler_image.php');

	$feed->set_feed_url($feedUrl);
	if (!$feed->init()) return 'Error parsing videos feed today... :-/';
	$feed->handle_content_type();
	
	$size = 600; // Thumb and movie size...
	
	foreach($feed->get_items(0, 30) as $item):
		$feed = $item->get_feed();
		?>
		<div class="post type-post">    			
			<div class="p-head">
				<h2 style="background-image:url(<?php echo $feed->get_favicon(); ?>) no-repeat;"><a href="<?php echo $item->get_permalink(); ?>" target="_blank"><?php echo html_entity_decode($item->get_title(), ENT_QUOTES, 'UTF-8'); ?></a></h2>
				<p class="p-cat">In videos likes | <?php echo $item->get_date('j M Y'); ?></p>
			</div>
			<div class="p-con">
				<?
				$content = $item->get_content();
				
				$enclosureLink = $imgs = $img = '';
				if ($enclosure = $item->get_enclosure()) { ?>
					<?php
					
					$embed = $enclosure->native_embed(array(
						'mediaplayer' => $WWW.'php/simplePie/demo/for_the_demo/mediaplayer.swf'
					));

					if ($embed && strlen($embed) > 100) { // Ok find videos embed
						?>
						<div><?php echo $embed; ?></div>
						<div class="spacy"></div>
						<?
					}
					else if ($embed && strlen($embed) < 100) { // Dailymotion give an iframe... SimplePie fail to parse.
						// my ugly hack :
						$dailyframe = str_replace('<a href="', '<iframe frameborder="0" width="'.$size.'" height="440" src="', ' '.$embed.' ');
						$dailyframe = str_replace('" class=""></a>', '?wmode=transparent"></iframe>', $dailyframe);
						echo trim($dailyframe); 
						?>
						<div class="spacy"></div>
						<?
					}
					else { // Work on given object...
					
						if ($get_link = $enclosure->get_link() && $get_type = $enclosure->get_type()) {
								if (strtolower($get_type) == 'jpg' || strtolower($get_type) == 'png' || strtolower($get_type) == 'gif')
									$enclosureLink = $get_link;
						}
						else if ($get_thumbnail = $enclosure->get_thumbnail())	
							$enclosureLink = $get_thumbnail;

						if (empty($enclosureLink) && preg_match_all('/<img[^>]+>/i', $content, $imgs)) {
							foreach((array)$imgs[0] as $imgTag) {
								if (preg_match('/width=[\'|"]1[\'|"]/i', $imgTag) || //  || !preg_match('/(jpeg|jpg|gif|png)$/i', $img[1])
									preg_match('/(button|icon|smiley|feedburner.com\/\~)/i', $imgTag)) continue; // img 1x1 is bad for design
								if (preg_match('/src=[\'|"](.+?)[\'|"]/i', $imgTag, $img)) { // I have to fix bugged empty ext in feed... :/
									$enclosureLink = $img[1]; // Find a good one ?
									break;
								}
							}
						}
						
						if ($enclosureLink) {
							$enclosureLinkName = makeNameUrl($enclosureLink, 50);
							$ext = getExt($enclosureLink); //  Have to deal with a lot of image without extension...
							if (file_exists($cacheBase.$enclosureLinkName)) 			$enclosureLink = $WWW.'cache/'.$enclosureLinkName;
							elseif (file_exists($cacheBase.$enclosureLinkName.'.jpg')) 	$enclosureLink = $WWW.'cache/'.$enclosureLinkName.'.jpg'; // Renamed with PhpThumbFactory Ext ?
							elseif (file_exists($cacheBase.$enclosureLinkName.'.png')) 	$enclosureLink = $WWW.'cache/'.$enclosureLinkName.'.png';
							elseif (file_exists($cacheBase.$enclosureLinkName.'.gif')) 	$enclosureLink = $WWW.'cache/'.$enclosureLinkName.'.gif';
							else {
								$thumb = PhpThumbFactory::create($enclosureLink);
								$format = $thumb->getFormat();
								if (!empty($format) && $format != 'STRING') { // Have to fix empty ext in feed... 
									$thumb->resize($size, $size);
									$thumb->save($cacheBase.$enclosureLinkName.(empty($ext) ? '.'.strtolower($format) : ''));
									$enclosureLink = $WWW.'cache/'.$enclosureLinkName.(empty($ext) ? '.'.strtolower($format) : '');
								}
							}
						}

						if ($enclosureLink) echo '<img src="'.$enclosureLink.'" class="alignleft" />';
						
					} ?>
					<?php 
				}
				
				echo $content;
				// echo cs($content, '250', '...');
				// cs() is one of my buggy function ^^ // See a cleaner method here... :
				// http://www.gsdesign.ro/blog/cut-html-string-without-breaking-the-tags/
				
				?>
				<div class="spacy"></div>
				<div class="read">Source&nbsp;: <a href="<?php echo $feed->get_permalink(); ?>"><?php echo $feed->get_title(); ?></a></div>
			</div>
		</div>
		<?php
	endforeach;
	
	$html = ob_get_contents();
	ob_end_clean();
	return $html;
}

// LET'S GO AND FETCH FEED ! /////////////////////////////////////////////////////////////////////////////////////////////
get_header(); // Retrieve Wordpress header...

?>
<h2 class="title">Browsing my favorites videos stream...</h2>
<br />
<?

$feedData = '';
if (!is_file($cache)) {
	@ignore_user_abort(true);
	$feedUrl = array(
		'http://www.dailymotion.com/rss/bookmark/molokoloco/1',
		'http://gdata.youtube.com/feeds/api/users/molokoloco/favorites',
		'http://vimeo.com/molokoloco/likes/rss'
	);
	$feedData = getVideoFromFeed($feedUrl);
	$cachefile = @fopen($cache, 'wb');
	@fwrite($cachefile, $feedData);
	@fclose($cachefile);
	@ignore_user_abort(false);
}
else $feedData = file_get_contents($cache);

echo $feedData;

get_footer();

?>