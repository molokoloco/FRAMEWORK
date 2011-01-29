<?php

require_once(dirname(__FILE__).'/php/functions.php');

///////////// URLificator ///////////////////////////////////////////////////

function getFinalUrl($url, $timeout=5) { // Get Real URL (Keep out FeedBurner redirecting...) // Inspired from comment here : http://php.net/manual/fr/ref.curl.php

	if (!function_exists('curl_init') || empty($url)) return $url;

	$url = str_replace('&amp;', '&', clean(urldecode($url)) );

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3) Gecko/20041001 Firefox/0.10.1');
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_COOKIEJAR, tempnam('/tmp', 'CURLCOOKIE'));
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // ini_set('safe_mode', 0) or comment with a @
	curl_setopt($ch, CURLOPT_MAXREDIRS, 6);
	curl_setopt($ch, CURLOPT_ENCODING, '');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_AUTOREFERER, true);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false ); // required for https urls
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
	//curl_setopt($ch, CURLOPT_HEADER, true);

	$content = curl_exec($ch);
	$response = curl_getinfo($ch);
	curl_close($ch);

    if (($response) && ($response['http_code'] == 301 || $response['http_code'] == 302)) {
		@ini_set('user_agent', 'Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3) Gecko/20041001 Firefox/0.10.1');
		if ($headers = get_headers($response['url'])) {
			foreach((array)$headers as $value) {
				if (substr(strtolower($value), 0, 9) == 'location:')
					return getFinalUrl(trim(substr($value, 9, strlen($value))));
			}
		}
    }
	// It's seem that feedburner redirect feed with inside body javascript... so must get full content :/
	// Extract script to find redirect...
	if ($response['http_code'] == 200 && preg_match_all('/<script[^<](.+?)<\/script>/si', $content, $value)) {
		foreach((array)$value[1] as $scriptFragment) {
			if (preg_match("/window\.location ?= ?['|\"](.+?)['|\"]/si", $scriptFragment, $value1) || preg_match("/window\.location\.replace\(['|\"](.+?)[^'|\"]\)/si", $scriptFragment, $value1)) {
				return getFinalUrl($value1[1]);
			}
		}
	}
	if ($response['http_code'] == 200 && $response['url']) return $response['url'];
	return $url;
}

///////////// FEEDER ///////////////////////////////////////////////////

function getJsonFromFeed($feedUrl, $start=0, $offset=15, $size=800) {
	
	global $WWW;
	
	require_once(dirname(__FILE__).'/php/simplePie/simplepie.inc');
	require_once(dirname(__FILE__).'/php/simplePie/idn/idna_convert.class.php');
	require_once(dirname(__FILE__).'/php/phpthumb/ThumbLib.inc.php');
	
	$feedUrl = str_replace('&amp;', '&', clean(urldecode($feedUrl)) );
	$cacheBase = dirname(__FILE__).'/cache/';
	//if (!is_dir($cacheBase)) mkdir($cache, 0777);
	
	$feed = new SimplePie();
	//$feed->force_fsockopen(true);
	//$feed->force_feed(true);
	$feed->enable_cache(true);
	//$feed->enable_xml_dump(isset($_GET['dump']) ? true : false);
	$feed->set_output_encoding('UTF-8'); // Maybe better to work in iso for PHP (cf. jsonClean()) ?
	$feed->enable_order_by_date(true);
	//$feed->set_image_handler('./libs/simplePie/handler_image.php');
	//$feed->set_favicon_handler('./libs/simplePie/handler_image.php');

	$feed->set_feed_url($feedUrl);
	if (!$feed->init()) return '[{"message":"'.jsonClean(urldecode($feed->error)).'"}]';
	$feed->handle_content_type();
	
	$link = $feed->get_link();
	if (empty($link)) $link = $feedUrl;
	$title = $feed->get_title();
	if (empty($title)) $title = $feedUrl;
	$description = $feed->get_description();
	
	$items = array();
	$items[] = '{"link":"'.$link.'", "title":"'.jsonClean($title).'", "description":"'.jsonClean($description).'"}';	
	foreach($feed->get_items($start, $offset) as $item) {
		
		$permalink = $item->get_permalink(); 
		$cacheUrl = $cacheBase.'url-'.cleanName($permalink);
		if (is_file($cacheUrl)) $permalink = file_get_contents($cacheUrl);
		else {
			$permalink = getFinalUrl($permalink); // ### Time consuming ! (But keep out FeedBurner redirecting...)
			list($permalink) = explode('?utm_source=', $permalink);
			list($permalink) = explode('#xtor=', $permalink);
			
			$cachefile = fopen($cacheUrl, 'wb');
			fwrite($cachefile, $permalink);
			fclose($cachefile);
		}

		$title = $item->get_title(); 
		//$date = $item->get_date('d/m/Y');
		//$autor = $item->get_author()->name;
		$content = $item->get_content(); // get_description() ?

		/*$source = explode('/', $permalink); // $item->get_feedsource();
		$site = 'http://'.$source[2];
		$domaine = str_replace('www.', '', $source[2]);
		$favicon = $feed->get_favicon();
		if (!$favicon) $favicon = 'http://www.google.com/s2/favicons?domain='.$domaine;*/
		
		$enclosureLink = $imgs = $img = '';
 
		if ($enclosure = $item->get_enclosure()) {
			if ($get_link = $enclosure->get_link() && $get_type = $enclosure->get_type()) {
					if (strtolower($get_type) == 'jpg' || strtolower($get_type) == 'png' || strtolower($get_type) == 'gif')
						$enclosureLink = $get_link;
			}
			else if ($get_thumbnail = $enclosure->get_thumbnail())	
				$enclosureLink = $get_thumbnail;	
		}
		
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
			$enclosureLinkName = makeName($enclosureLink, 50);
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
		// $items[] = '{"favicon":"'.$favicon.'", "permalink":"'.$permalink.'", "title":"'.jsonClean($title).'", "date":"'.$date.'", "autor":"'.$autor.'", "enclosure":"'.$enclosureLink.'"}';
		$items[] = '{"permalink":"'.$permalink.'", "title":"'.jsonClean($title).'", "enclosure":"'.$enclosureLink.'", "introduction":"'.cs(jsonClean($content), '250', '...').'"}';
	}
	
	if ($start > 0 && count($items) < 2) return '[{"message":"no more"}]';
	elseif (count($items) < 2) return '[{"message":"We found no item in this feed... '+$feedUrl+'"}]';
	else return '['.implode(',', $items).']';
}


function getJsonFromWordpress($page) {
	return utf8_decode(file_get_contents('http://www.b2bweb.fr/wordpress2json/page/'.$page.'/'));
}

// LET'S GO AND FETCH FEED ! /////////////////////////////////////////////////////////////////////////////////////////////

header('Content-Type: text/html; charset=utf-8');
//header('Content-Type: application/json; charset=utf-8');

$feedUrl = getFeed();
$page = (isset($_GET['page']) && intval($_GET['page']) > 1 ? $_GET['page'] : 1);
$size = (isset($_GET['size']) && intval($_GET['size']) > 1 ? $_GET['size'] : 340);
$pageOffset = 15;
$currentItem = ($page - 1) * $pageOffset;

$cacheBase = dirname(__FILE__).'/cache/';
$cache = $cacheBase.'json-'.$page.'-'.cleanName($feedUrl);
// if (!is_dir($cacheBase)) mkdir($cache, 0777);
### @unlink($cache);

$feedData = '';
if (!is_file($cache) || filemtime($cache) < (time() - (3600*12))) { // Re-cache every 12 hours
	@ignore_user_abort(true);
	if ($feedUrl == $FEED) $feedData = getJsonFromWordpress($page);
	else $feedData = getJsonFromFeed($feedUrl, $currentItem, $pageOffset, $size);
	$cachefile = @fopen($cache, 'wb');
	@fwrite($cachefile, $feedData);
	@fclose($cachefile);
	@ignore_user_abort(false);
}
else $feedData = @file_get_contents($cache);

echo utf8_encode($feedData);

?>