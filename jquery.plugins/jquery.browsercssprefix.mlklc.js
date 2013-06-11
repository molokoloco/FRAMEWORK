/////////////////////////////////////////////////////////////////////////
//   JS HTML5 cssPrefix By molokoloco - http://www.b2bweb.fr - 2011   //
///////////////////////////////////////////////////////////////////////
/*
	// A function to get browser specific CSS style name properties...
	// eg. "MozBorderRadius" or "WebkitTransform" ...
	// Playground here : http://jsfiddle.net/molokoloco/f6Z3D/
	// Source here : https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.browsercssprefix.mlklc.js
	
	// Usages examples
	
	var cssTransform = cssPrefix('Transform'); // "MozTransform" or "WebkitTransform"
	if (cssTransform ) {
		var cssProp = {};
		cssProp['border'] = '1px solid rgba(0, 0, 0, .5)';
		cssProp[cssTransform] = 'rotate(20deg)';
		cssProp[cssPrefix('borderRadius')] = '5px'; // Keep the camelCaze (jQuery like)
		cssProp[cssPrefix('boxShadow')] = '2px 2px 2px grey';
		$('div#myDiv').css(cssProp);
		// console.log(cssProp);
	}
	
	// Want more code ? That here...
	// https://github.com/molokoloco/FRAMEWORK/
*/

var cssPrefixString = {};
var cssPrefix = function(propertie) {
    if (cssPrefixString[propertie]) return cssPrefixString[propertie] + propertie;
    var e = document.createElement('div');
    if (e.style[propertie]) return propertie;
    var prefixes = ['Moz', 'Webkit', 'O', 'ms', 'Khtml']; // Various supports...
    for (var i in prefixes) {
        if (typeof e.style[prefixes[i] + propertie] !== 'undefined') {
            cssPrefixString[propertie] = prefixes[i];
            return prefixes[i] + propertie;
        }
    }
    return false;
};
