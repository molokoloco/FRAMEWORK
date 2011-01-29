<?
/**
 * <molokoloco:2008/>
 *
 * Exemple :
 *
 * $X = new XML('http://127.0.0.1/wall4php/iptv.xml');
 * if (!($xResulat = $X->getItems('//item'))) db($X->error());
 * else {
 * 		foreach($xResulat as $item) db((string)$item->title);
 * }
 *
 */

// ------------------------- GET XML FLUXXXX SHORTCUT ----------------------------------//
// $xItems = getXmlItems('http://btx48675:8080/labmobile/OdpTv/', '//flux_media');
// echo (string)$xItem[0]->url;
// foreach((array)$xItems as $xItem) echo $xItem->url

function getXmlItems($xmlUrl, $xPath) {
	global $debug;
	//$R = new HTTP($xmlUrl);
	//if (!$R->isUrl()) db($R->error());
	//else {
		$X = new XML($xmlUrl);
		if ($xResulat = $X->getItems($xPath)) return $xResulat;
		else if ($debug == 1) return $X->error();
		
	//}
}


// ------------------------- GET XML FLUXXXX ----------------------------------//
class XML {

	private $_path = '';
	private $_xml = '';
	private $_error = array();
	
	// PHP 5
	function __construct($path) {
		$this->_path = $path;
	}
	
	// PHP 4
	function XML($path) {
		$this->__construct($path);
	}
	
	private function _loadXml() {
		if (empty($this->_path)) {
			$this->_error[] = '[XML()] Le chemin sp&eacute;cifi&eacute; est vide';
			return FALSE;
		}
		$this->_xml = @simplexml_load_file($this->_path); // CORE FUNCTION // --------------------------------------------- //
		if (!$this->_xml) {
			$this->_error[] = '[XML()] Probleme de lecture du flux XML : '.$this->_path;
			return FALSE;
		}
		return TRUE;
	}
	
	// Obtenir l'Objet XML
	public function getXml() {
		if (!$this->_loadXml()) return FALSE;
		else return $this->_xml;
	}
	
	// Obtenir un objet représentant les items spécifiés par un Xpath
	public function getItems($xPath) {
		if (empty($xPath)) {
			$this->_error[] = '[XML()] Le xPath sp&eacute;cifi&eacute; est vide';
			return FALSE;
		}
		
		if (!$this->_loadXml()) return FALSE;

		$xResult = $this->_xml->xpath($xPath);
		if (empty($xResult)) {
			$this->_error[] = '[XML()] Le xPath sp&eacute;cifi&eacute; ne renvoi aucune info : '.$xPath;
			return FALSE;
		}
		return $xResult;
    }
	
	// Obtenir un array représentant les items spécifiés par un Xpath
	public function getItemsArray($xPath) {
		if (!($xResult = $this->getItems($xPath))) return FALSE;
		$items = array();
		foreach((array)$xResult as $item) $items[] = (array)$item;
		return $items;
    }
	
	// Récupérer le(s) message(s) d'erreur
	public function error() {
		return implode('<br />', $this->_error);
	}
}



////////////////////////////////////////////////////////////////////////////////////////////////
/*
function xml2assoc(&$xml){
    $assoc = NULL;
    $n = 0;
    while($xml->read()){
        if($xml->nodeType == XMLReader::END_ELEMENT) break;
        if($xml->nodeType == XMLReader::ELEMENT and !$xml->isEmptyElement){
            $assoc[$n]['name'] = $xml->name;
            if($xml->hasAttributes) while($xml->moveToNextAttribute()) $assoc[$n]['atr'][$xml->name] = $xml->value;
            $assoc[$n]['val'] = xml2assoc($xml);
            $n++;
        }
        else if($xml->isEmptyElement){
            $assoc[$n]['name'] = $xml->name;
            if($xml->hasAttributes) while($xml->moveToNextAttribute()) $assoc[$n]['atr'][$xml->name] = $xml->value;
            $assoc[$n]['val'] = "";
            $n++;               
        }
        else if($xml->nodeType == XMLReader::TEXT) $assoc = $xml->value;
    }
    return $assoc;
} 
*/
/*
	$xml = new XMLReader();
	$xml->open([XML file]);
	$assoc = xml2assoc($xml);
	$xml->close();
*/

////////////////////////////////////////////////////////////////////////////////////////////////