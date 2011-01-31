<?

require('./wp-blog-header.php');

require_once(dirname(__FILE__).'/wall/php/phpthumb/ThumbLib.inc.php');

function getWorpressPost() {

	global $WWW;

	$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
	$posts = array();
	$size = 340;
	$cacheBase = dirname(__FILE__).'/wall/cache/';

	query_posts('posts_per_page=15&paged='.$paged); // cat=16,92&
	
	if (have_posts()) {
		while (have_posts()) {
		
			the_post(); 

			$title = the_title('', '', false);
			//if (strpos($title, '&#') !== FALSE) continue; // for the moment, i cannot un_html_entities() that, some titles in the blog came from strange rss feed...
			
			$content = get_the_content();
			$enclosureLink = $imgs = $img = '';
			
			if (preg_match_all('/<img[^>]+>/i', $content, $imgs)) {
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
			
			$posts[] = '{"permalink":"'.get_permalink().'", "title":"'.cs(jsonClean($title), '150', '...').'", "enclosure":"'.$enclosureLink.'", "introduction":"'.cs(jsonClean($content), '250', '...').'"}';
			//}

		}
		
	}
	
	wp_reset_query();
	
	
	if ($paged > 0 && count($posts) < 2) return utf8_encode('[{"message":"no more"}]');
	elseif (count($posts) < 2) return utf8_encode('[{"message":"We found no item in this feed... "}]');
	else return utf8_encode('[{"link":"http://www.b2bweb.fr", "title":"Work Wild Web @ b2bWeb.fr", "description":"Watching the Web... Coding, Politics and Geekness pleasure..."},'.implode(',', $posts).']');

}

header('Content-Type: text/html; charset=utf-8');
//header('Content-Type: application/json; charset=utf-8');
echo getWorpressPost(1);

?>