<?
$local = (strpos($_SERVER['SERVER_ADDR'], '127.0.0.1') !== FALSE ? TRUE : FALSE);

$WWW = ( $local ? 'http://localhost/www.b2bweb.fr/b2bweb/wall/' : 'http://www.b2bweb.fr/wall/' );
$FEED = 'http://feeds.feedburner.com/b2bweb'; // http://www.google.com/reader/public/atom/user%2F11601043898330304613%2Fstate%2Fcom.google%2Fbroadcast

function getFeed() {
	global $FEED;
	$feedUrl = '';
	//if (!empty($_GET['feed'])) $feedUrl = urldecode($_GET['feed']); // From form input index.php, HTML Form encoding
	if (!empty($_GET['url'])) $feedUrl = /*rawurldecode(*/$_GET['url']/*)*/; // From Bookmarklet, JS encodeURIComponent()
	if (empty($feedUrl) || !preg_match('/^https?:\/\/[A-Za-z0-9\-_%&\?\/.=:+ ]{5,}$/i', $feedUrl)) $feedUrl = $FEED;
	else {
		if (substr($feedUrl, -1, 1) == '#') $feedUrl = substr($feedUrl, 0, -1); // JQM
		$feedUrl = clean($feedUrl);
	}
	return $feedUrl;
}


// customPhpLibs... ---------------------------------------------

function clean($string) {
	$bad = array('|</?\s*SCRIPT.*?>|si', '|</?\s*OBJECT.*?>|si', '|</?\s*META.*?>|si', '|</?\s*APPLET.*?>|si', '|</?\s*LINK.*?>|si', '|</?\s*FRAME.*?>|si', '|</?\s*IFRAME.*?>|si', '|</?\s*JAVASCRIPT.*?>|si', '|JAVASCRIPT:|si', '|</?\s*FORM.*?>|si', '|</?\s*INPUT.*?>|si', '|CHAR\(|si', '|INTO OUTFILE|si', '|LOAD DATA|si', '|EVAL\(|si', '|CONCAT\(|si');
	$string = preg_replace($bad, array(''), ' '.$string.' ');
	//$string  = mysql_real_escape_string($string);
	$string = addslashes($string);
	$string = str_replace('\\n','\n',$string);
	$string = str_replace('\\r','\r',$string);
	return trim($string);
}

function cleanName($string) {
	if (empty($string)) return $string;
	elseif (is_numeric($string)) return $string;
	$string = strtolower(' '.clean($string).' ');
	$special = array('&', 'O', 'Z', '-', 'o', 'z', 'Y', 'À', 'Á', 'Â', 'Ã', 'Ä', 'Å', 'Æ', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ð', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ù', 'Ú', 'Û', 'Ü', 'Ý', 'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ð', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', 'ù', 'ú', 'û', 'ü', 'ý', 'ÿ', '.', ' ', '+', '\'', '/');
$normal = array('et', 'o', 'z', '-', 'o', 'z', 'y', 'a', 'a', 'a', 'a', 'a', 'a', 'ae', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'd', 'n', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'y', 'a', 'a', 'a', 'a', 'a', 'a', 'ae', 'c', 'e', 'e', 'e', 'e', 'i', 'i', 'i', 'i', 'o', 'n', 'o', 'o', 'o', 'o', 'o', 'u', 'u', 'u', 'u', 'y', 'y', '-', '-', '-', '-', '-');
	$string = str_replace($special, $normal, $string);
	$string = preg_replace('/[^a-z0-9_\-]/', '', $string);
	$string = preg_replace('/[\-]{2,}/', '-', $string);
	$string = preg_replace('/[\_]{2,}/', '_', $string);
	$string = substr($string, 1, -1);
	return $string;
}

function getExt($string) {
	$string = basename($string);
	if (strrpos($string,'.') === false) return '';
	$ext = strtolower(strrchr($string, '.'));
	$ext = substr($ext, 1);
	if ($ext == 'jpeg') $ext = 'jpg';
	if ($ext == 'mpeg') $ext = 'mpg';
	return $ext;
}

function makeName($path, $nb='60', $noExt=false) { // 070220155402_las-vegas-blvd.jpg
	list($filename) = explode('?', basename($path)); // some url param ?
	$ext = getExt($filename);
	$filename = substr(cleanName(preg_replace('|.'.$ext.'|si', '', $filename)), 0, $nb);
	return date(ymdHis).'_'.$filename.($noExt || empty($ext) ? '' : '.'.$ext);
}
function unHtmlEntities($string) {
	//return  html_entity_decode(aff($string),ENT_COMPAT,'ISO-8859-15');
	$trans_tbl = get_html_translation_table(HTML_ENTITIES);
	$trans_tbl = array_flip($trans_tbl);
	return strtr($string, $trans_tbl);
}

function make_iso($str) {
	if (!$str) return;
	if (!function_exists('mb_detect_encoding')) return $str;
	$cod = mb_detect_encoding($str, 'UTF-8, ISO-8859-1');
	if ($cod == 'UTF-8') return utf8_decode($str);
	else return $str;
}

function make_utf($str) {
	if (!$str) return;
	if (!function_exists('mb_detect_encoding')) return $str;
	$cod = mb_detect_encoding($str, 'UTF-8, ISO-8859-1');
	if ($cod != 'UTF-8') return utf8_encode($str);
	else return $str;
}

function stripTags($string) {
	$string = preg_replace('/<br(.*?)>/i', ' ', ' '.$string.' '); // Retour a la ligne avec espace
	$string = str_replace('\\n', ' ', $string);
	$string = preg_replace('/<\/(pre|ul|li|p|table|tr)>/i', ' ', $string);
	$string = strip_tags($string);
	//$string = preg_replace('/([<br \/>]{2,})/', '<br />', $string);
	return trim($string);
}

function cs($string, $max=0, $ponct='...', $isHtml=true) {
	$string = stripTags($string);
	if (strlen($string) > $max) {
		$chaine = substr($string, 0, $max);
		$espace = strrpos($chaine, ' ');
		$string = substr($string, 0, $espace).$ponct;
	}
	if ($isHtml) $string = str_replace('\\n', '<br />', $string);
	return $string;
	/* Cf. my wordpress addon... (Dependency with WP force_balance_tags() )
		function improved_trim_excerpt($text) {
			global $post;
			$excerpt_length = 80;
			if (empty($text)) $text = apply_filters('the_content', get_the_content(''));
			if (empty($text)) return '';
			$text = strip_tags($text, '<br><p><a><quote><b><u><i><strong><cite><ul><li><ol><img><pre><code><xmp><blockquote><embed><object><h1><h2><h3><h4>');
			$words = explode(' ', $text, $excerpt_length + 1);
			if (count($words) > $excerpt_length) {
				array_pop($words);
				$text = implode(' ', $words);
				// Sick bug with link... cut in the middle ? trash patch... // Cf. formatting.php >  force_balance_tags($text)
				$diff = count(explode('<a' , ' '.$text.' ')) - count(explode('</a>' , ' '.$text.' '));
				if ($diff > 0) $text .= '"></a>'; //.str_repeat('</a>', $diff - 1);
				$text .= ' [...] ';
				$text = force_balance_tags($text);
			}
			return $text;
		}
		remove_filter('get_the_excerpt', 'wp_trim_excerpt');
		add_filter('get_the_excerpt', 'improved_trim_excerpt');
	*/
}

function jsonClean($string) {
	$bad = array('’', '“', '”');
	$better = array("'", '"', '"');
	$string = str_replace($bad, $better, $string);
	$string = stripslashes(make_iso($string));
	$string = str_replace($bad, $better, $string); // twice...
	$string = clean(stripTags(html_entity_decode($string, ENT_QUOTES, 'ISO-8859-1')));
	$string = str_replace(chr(10), ' ',$string);
	$string = str_replace(chr(13), '',$string);
	$string = str_replace('"', '\"',stripslashes($string));
	return $string;
}

function array2json($arrItems) {
	$jsonStr = '';
	foreach($arrItems as $item) {
		$itemStr = '';
		foreach((array)$item as $att=>$val) $itemStr .= '"'.$att.'":"'.jsonClean($val).'",';
		$jsonStr .= '{'.substr($itemStr, 0, -1).'},';
	}
	return '['.substr($jsonStr, 0, -1).']';
}

/*function yahooYql($feedUrl) {
	$path = 'http://query.yahooapis.com/v1/public/yql?q=';
	$path .= urlencode("SELECT * FROM feed WHERE url='$feedUrl'");
	$path .= "&format=json";
	return file_get_contents($path, true);
}*/

function generateId($prefix='obj_') {
	static $idObjects = 0;
	if ($prefix != 'obj_') $prefix = cleanName($prefix);	
	return $prefix.$idObjects++;
}

function js($script, $echo=TRUE) {
	$JS = '<script type="text/javascript">'.chr(13).chr(10).'// <![CDATA['.chr(13).chr(10);
	$JSE = chr(13).chr(10).'// ]]>'.chr(13).chr(10).'</script>';
	$js = $JS.chr(13).chr(10).$script.chr(13).chr(10).$JSE;
	if ($echo) echo $js;
	else return $js;
}

function db($var='') {
	$args = func_get_args();
	if (count($args) > 1) {
		foreach ($args as $arg) db($arg);
		return;
	}
	$t_id = generateId('db_');
	echo '<textarea id="'.$t_id.'" style="width:100%;height:250px;font:11px courier;color:#FFFFFF;background:#FF66CC;text-align:left;white-space:pre;padding:4px" rows="3" cols="7">';
	if (is_bool($var)) echo ($var ? 'TRUE' : 'FALSE');
	elseif ($var === '0' || $var === 0) echo $var;
	elseif (!empty($var)) var_export($var);
	else echo '*** No Value ***';
	echo '</textarea><br />';
	js("var lignes = document.getElementById('".$t_id."').value.split('\\n');
	document.getElementById('".$t_id."').style.height = (lignes.length*18+30)+'px';");
}

function d($var='<< PHP says that you killing him softly >>') {
	db($var);
	die();
}

?>