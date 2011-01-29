/*!
	// Wallified -  http://www.b2bweb/wall/
	// Copyleft Molokoloco 2010
	// Version alpha 0.5

	// Original JS http://www.b2bweb/wall/js/jquery.wall.js
	// The sources here : http://www.b2bweb.fr/wp-content/uploads/wall-by-molokoloco.zip // Certainly bugged one and so on.. V0.3
*/

// Debug tool !
var db = function(x) { 'console' in window && console.log.call(console, arguments); };

var loadJs = function(jsPath) {
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', jsPath);
    document.getElementsByTagName('head')[0].appendChild(s);
};

// Ok.. so DOM is up...
$(document).ready(function() { // $(document).bind('mobileinit', function() {
	// Parse OPML from my Google Reader export
	var parseOpmlFeed = function (xml) {
		if ($.browser.msie) {  // IE !!!
			var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');  
			xmlDoc.loadXML(xml);  
			xml = xmlDoc;  
		}		
		var feedsHtml = ''; //'<ul data-role="listview" data-dividertheme="d" style="margin-top: 0;">';
		$(xml).find('body > outline').each(function() {
			feedsHtml += '<li data-role="list-divider">'+$(this).attr('title')+'</li>';
			$(this).find('outline').each(function() {
				feedsHtml += '<li><a href="index.php?url='+encodeURIComponent($(this).attr('xmlUrl'))+'" rel="external">'+$(this).attr('title')+'</a></li>';
			});
		});
		//feedsHtml += '</ul>';
		$('ul#feeds').html(feedsHtml);	
		loadJs('js/jquery.mobile-1.0a2.js');
		//$.mobile.pageLoading( true );
		$('div#loading').fadeOut(400);
	};
	// jQuery mobile "custom" dialog
	var popUpMobile = function(message, delay) {
		delay = delay || 5000;
		//$(options.divLoading).stop().fadeOut(150);
		$('<div />')
			.addClass('ui-loader ui-overlay-shadow ui-body-e ui-corner-all')
			.css({opacity:0.96, 'zIndex':100000, top:($(window).scrollTop() + 100)})
			.html('<h1>Message...</h1><p>'+message+'</p>')
			.appendTo('body')
			.hide().fadeIn(200)
			.delay(delay)
			.fadeOut(400, function(){ $(this).remove(); });
	};
	// Load OPML...
	var callOpmlFeed = function() {
		$.ajax({
			dataType	: ($.browser.msie) ? 'text' : 'xml',
			cache		: true,
			processData	: true,
			url			: './data/google-reader-subscriptions.xml',
			success		: parseOpmlFeed,
			error		: function(request, status, error) { popUpMobile('OPML loading error :( '+request+', '+status+', '+error+'):', 6000); }
		});
	};
	//$.mobile.pageLoading();	
	$('div#loading').fadeIn(600);
	callOpmlFeed();
	window.scrollTo(0, 1); // Droid address bar..
});
									
/*$(document).bind('mobileinit', function() {
	$.mobile.ajaxFormsEnabled		= false; // Do it myself
	$.mobile.metaViewportContent	= 'width=device-width; initial-scale=1.0;'; // To check..
});*/
									
									