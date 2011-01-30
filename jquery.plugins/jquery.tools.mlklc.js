/*///////////////////////////////////////////////////////////////////////////////////////////////////////
///// Code mixing by Molokoloco ..... 2011 ......... [EVER IN PROGRESS (it's not done yet)] ////////////
//////////////////////////////////////////////////////////////////////////////////////////////////// */

// ------------------------------------ Some vars... ------------------------------------ //

var WWW = ( /localhost\//.test(document.location) ? 'http://localhost/www.b2bweb.fr/' : 'http://www.b2bweb.fr/' ),
	H	= $(window).height(), // Viewport dimensions
	W	= $(window).width();

// ------------------------------------ Some littles functions... ------------------------------------ //

var db = function(x) { 'console' in window && console.log.call(console, arguments); };
var die = function(mess) { throw(( mess ? mess : "Oh my god moonWalker is down...")); };
var trim = function(string) { return string.replace(/^\s+|\s+$/g, ''); };
var escapeURI = function(url) { if (encodeURIComponent) return encodeURIComponent(url); else if (encodeURI) return encodeURI(url); else if (escape) return escape(url); else return url; };
var pad = function(n) { return (n < 10 ? '0'+n : n); };
var count = function (arr) { var i = 0; for (var k in arr) i++; return i; };
var addslashes = function (str) { return (str+'').replace(/([\\"'])/g, "\\$1").replace(/\u0000/g, "\\0"); };
var baseName = function(path) { var vb; for (var i=path.length; i>0; i--) { vb = path.substring(i,i+1) if (vb == '/' || vb == '\\') return path.substring(i+1, path.length); } return path; };
// index.html?name=foo -> var name = getUrlVars()[name]; 
var getUrlVars = function() { var vars = {}; var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) { vars[key] = value; }); return vars; };
// sites['link'].sort($.objSortByTitle);
var objSortByTitle = function (a, b) { var x = a.title.toLowerCase(); var y = b.title.toLowerCase(); return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }; 
var loadCss = function(stylePath) { $('head').append('<link rel="stylesheet" type="text/css" href="'+stylePath+'"/>'); };
// loadJs('http://other.com/other.js'); // For external link
var loadJs = function(jsPath) { var s = document.createElement('script'); s.setAttribute('type', 'text/javascript'); s.setAttribute('src', jsPath); document.getElementsByTagName('head')[0].appendChild(s); };
// getScript('./other.js', function() { ok(); }); // For same domain link
var getScript = function(src, callback) { $.ajax({dataType:'script', async:false, cache:true, url:src, success:function(response) { if (callback && typeof callback == 'function') callback(); }}); };
// var touch = e2key(event);
var event2key = {
	'96':'0', '97':'1', '98':'2', '99':'3', '100':'4', '101':'5', '102':'6', '103':'7', '104':'8', '105':'9', // Chiffres clavier num
	'48':'m0', '49':'m1', '50':'m2', '51':'m3', '52':'m4', '53':'m5', '54':'m6', '55':'m7', '56':'m8', '57':'m9', // Chiffres caracteres speciaux
	'65':'a', '66':'b', '67':'c', '68':'d', '69':'e', '70':'f', '71':'g', '72':'h', '73':'i', '74':'j', '75':'k', '76':'l', '77':'m', '78':'n', '79':'o', '80':'p', '81':'q', '82':'r', '83':'s', '84':'t', '85':'u', '86':'v', '87':'w', '88':'x', '89':'y', '90':'z', // Alphabet
	'37':'left', '39':'right', '38':'up', '40':'down', '13':'enter', '27':'esc', '32':'space', '107':'+', '109':'-'// Keycodes
};
var e2key = function(e) { if (!e) return; return event2key[(e.which || e.keyCode)]; };
String.prototype.camelize = function() {
    var tmp = '';
    var words = this.split('-');
    for (var i in words) tmp += words[i].toLowerCase().charAt(0).toUpperCase() + words[i].slice(1);
    return tmp;
};