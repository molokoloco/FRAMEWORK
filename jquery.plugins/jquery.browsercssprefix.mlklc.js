/* //////////////////////////////////////////////////////////////////////////////////////////////////////
///// Code mixing by Molokoloco ..... 2011 ......... [EVER IN PROGRESS (it's not done yet)] ////////////
//////////////////////////////////////////////////////////////////////////////////////////////////// */
/*
	// Get browser CSS style name properties (-Moz -Webkit, ... CSS support)
	// A function to get browser specific CSS style name properties... eg. "MozBorderRadius" or "WebkitTransform" ...

	// Playground here : http://jsfiddle.net/molokoloco/f6Z3D/
	// Source here : https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.browsercssprefix.mlklc.js
	
	// Usages examples
	
	var cssTransform = cssPrefix('Transform'); // "MozTransform" or "WebkitTransform"
	if (cssTransform) {
		var cssProp = {};
		cssProp['border'] = '1px solid rgba(0, 0, 0, .5)';
		cssProp[cssTransform] = 'rotate(20deg)';
		cssProp[cssPrefix('borderRadius')] = '5px'; // Keep the camelCaze
		$('#myDiv').css(cssProp);
	}
*/


var cssPrefixString = null;
var cssPrefix = function(propertie) {
    if (cssPrefixString !== null) return cssPrefixString + propertie;
    var e = document.createElement('div');
    var prefixes = ['', 'Moz', 'Webkit', 'O', 'ms', 'Khtml']; // Various supports...
    for (var i in prefixes) {
        if (typeof e.style[prefixes[i] + propertie] != 'undefined') {
            cssPrefixString = prefixes[i];
            return prefixes[i] + propertie;
        }
    }
    return false;
};