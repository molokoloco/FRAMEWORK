/*!
	// Wallify -  http://www.b2bweb/wall/
	// Copyleft Molokoloco 2010
	// Version alpha 0.81

	// This is not a "really" a jQuery Plugin... i have to much HTML and CSS dependency..
	// ...and i don't even know where this app goes...

	// Original JS http://www.b2bweb/wall/js/jquery.wall.js
	// The sources here : http://www.b2bweb.fr/wp-content/uploads/wall-by-molokoloco.zip // Certainly bugged one and so on.. V0.3
*/

// Debug tool !
var db = function() { 'console' in window && console.log.call(console, arguments); };
var dump = function() { 'console' in window && console.table.call(console, arguments); };
var escapeURI = function(url) { if (encodeURIComponent) return encodeURIComponent(url); else if (encodeURI) return encodeURI(url); else if (escape) return escape(url); else return url; };

(function($){
	
	$.easing.jswing = $.easing.swing;
	$.extend($.easing, { // Extract from jQuery UI
		def: 'easeOutQuad',
		swing: function (x, t, b, c, d) { return $.easing[$.easing.def](x, t, b, c, d); },
		easeInQuad: function (x, t, b, c, d) { return c*(t/=d)*t + b; },
		easeOutQuad: function (x, t, b, c, d) { return -c *(t/=d)*(t-2) + b; },
		easeInOutQuad: function (x, t, b, c, d) { if ((t/=d/2) < 1) return c/2*t*t + b; return -c/2 * ((--t)*(t-2) - 1) + b; }
	});
	
	$.fn.extend({ 
		wallify: function(options) { // Let's go for a data grid wall... 
			
			// Main Box
			var $wall = $(this);  // Can only work for one element at a time... (Each wall need a different config)
			
			// Public
			options =  $.extend({
				defaultFeed		: 'http://feeds.feedburner.com/b2bweb', // Feed
				inputFeed		: 'input#url', // Feed URL input
				divLoading		: 'div#loading',
				baseAppUrl 		: '', //'http://www.b2bweb.fr/wall/',
				provider		: './feed2json.php', // PHP SimplePie Feed parser
				colorArr		: $.xcolor && $.xcolor.monochromatic('#0099CC') || ['#0099CC', '#0099BB'], // Monochromatic array of colors
				colWidth		: 122, // Pixels
				currentPage		: 1, // Start page
				boxWidth		: $wall.width(),
				boxHeight 		: $wall.height(),
				W				: $(window).width(),
				H				: $(window).height(),
				dW				: $(document).width(),
				dH				: $(document).height()
			}, options || {});

			// Private
			var _wallified		= false,
				_intWaitLoad	= null,
				_ajax			= null,
				_ajaxWork		= false,
				_globalId		= 0,
				_stockedBox		= {},
				_countLoadImg	= 0,
				_totalLoadImg	= 0,
				_mouseTopBottom	= false;
			
			//////////////////// GENERAL ///////////////////////////////////////////////////////////////////
			
			// Get feed url...
			var getFeed = function() {
				//var getUrlVars = function() { var vars = {}; var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) { vars[key] = value; }); return vars; };
				var url = $(options.inputFeed).val(); // || getUrlVars()['feed']
				if (!url || !/^https?:\/\/[A-Za-z0-9\-_%&\?\/.=:+ ]{5,}$/.test(url)) url = options.defaultFeed;
				return url;
			};
			
			//////////////////// WALL RELATED ///////////////////////////////////////////////////////////////////

			// Form Input URL managing
			var formInputValidate = function() {
				$(options.inputFeed) //.data('valInit', $(this).val())
					.mouseenter(function() { if (!$(this).val() || $(this).val() == options.defaultFeed) { $(this).val('http://'); } $(this).select(); })
					.mouseleave(function() { if (!$(this).val() || $(this).val() == 'http://') $(this).val(options.defaultFeed); $(this).blur(); });
				
				$('form#formFeed').bind('submit', function(event) {
					event.preventDefault();
					var inputUrl = $(options.inputFeed).val();
					if (inputUrl == getFeed()) {
						cancel();
						document.location = options.baseAppUrl+'?url='+encodeURIComponent(inputUrl);
					}
					else {
						$(options.inputFeed).focus();
						$(options.inputFeed).select();
					}
				});
			};
			
			/*var checkMouseIfTopBottom = function(e) {
				if (!_mouseTopBottom && (e.pageY < 60 || e.pageY > (options.H - 60))) {
					_mouseTopBottom = true;
					$.fixedToolbars.show();
				}
				else if (_mouseTopBottom && (e.pageY > 60 && e.pageY < (options.H - 60))) {
					_mouseTopBottom = false;
					$.fixedToolbars.hide();
				}
			};*/
			
			// Parse OPML... Choose a random feed
			var parseOpmlRandFeed = function (xml) { 
				if ($.browser.msie) {  // IE !!!
					var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');  
					xmlDoc.loadXML(xml);  
					xml = xmlDoc;  
				}
				var $urls = $(xml).find('body > outline > outline');
				var randUrl = Math.floor(Math.random() * ($urls.length - 1));
				randUrl = $urls.eq(randUrl).attr('xmlUrl');
				$(options.inputFeed).val(randUrl);
				options.currentPage = 1;
				callNextFeed();
			};
			
			// Load OPML...
			var getRandomFeed = function() {	
				$.ajax({
					dataType	: ($.browser.msie) ? 'text' : 'xml',
					cache		: true,
					processData	: true,
					url			: './data/google-reader-subscriptions.xml',
					success		: parseOpmlRandFeed,
					error		: function(request, status, error) { popUp('OPML loading error :( '+request+', '+status+', '+error+'):', 6000); }
				});
			};
			
			//////////////////// WALL ITSELF ///////////////////////////////////////////////////////////////////
			
			// Load JSON feed from PHP
			var callNextFeed = function() {
				_ajaxWork = true;
				_ajax = $.ajax({ 
					dataType	: 'json', 
					timeout		: 60000, // Can be looong
					//cache		: false,
					data 		: {url: getFeed(), page: options.currentPage},
					url			: options.provider, 
					success		: buildWall, // Yeah
					error		: function(request, status, error) { cancel(); popUp('Feed loading error :( '+request+', '+status+', '+error+'):', 6000); }
				}); 
			};
			
			// Clear workers and listenners
			var cancel = function() {
				$(window).unbind('scroll', isNearBottom); // Stopping next call
				$('a#up').stop().fadeIn(600); // hum
				if (_intWaitLoad) { clearInterval(_intWaitLoad); _intWaitLoad = null; } // Stop wait
				_ajax.abort(); // Cancel any ajax
				_ajaxWork = false;
				_wallified = false;
			};

			// onResize callback
			var centerWall = function() {
				options.boxWidth = $wall.width();
				options.boxHeight = $wall.height();
				options.W = $(window).width();
				options.H = $(window).height();
				options.dW = $(document).width();
				options.dH = $(document).height();
				var Wwid = Math.floor(options.W / options.colWidth) * options.colWidth, // Largeur avec nombre maximal de colonnes possibles
					Wleft = (options.boxWidth - Wwid) / 2; // Centrage
				$wall.css({left: Wleft+'px'});
			};
			
			// "Custom" dialog
			var popUp = function(message, delay) {
				delay = delay || 5000;
				$(options.divLoading).stop().fadeOut(150);
				$('<div />')
					.addClass('popup')
					.css({opacity:0.96, top:($(window).scrollTop() + 100)})
					.html('<h1>Message...</h1><p>'+message+'</p>')
					.appendTo('body')
					.hide().fadeIn(200)
					.delay(delay)
					.fadeOut(400, function(){ $(this).remove(); });
			};
			
			// Scrolling page to bottom make me eat data
			var didScroll = false;
			var isNearBottom = function() { didScroll = true; };
			setInterval(function() { // Check scroll every 250ms
				if (!didScroll) return;
				didScroll = false;
				var wst = $(window).scrollTop();
				if (wst > 2 && !$('a#up').is(':visible')) $('a#up').stop().fadeIn(600);
				else if (wst <= 2 && $('a#up').is(':visible')) $('a#up').stop().fadeOut(600);
				if (_ajaxWork || _intWaitLoad) return;
				if ( ($(document).height() - $(window).height() - $(window).scrollTop()) < 30 ) // Could be improved but not minimized ;)
					callNextFeed();
			}, 250);
			
			// Read more popup
			var imgBoxMouseEnter = function() { // Box image Focus
				var $this = $(this);
				var $leg = $this.find('div.imgLeg'); 
				$leg.stop().animate({bottom:'-'+($leg.outerHeight()+2)+'px', backgroundPosition:'-550px 0'}, 250);
				
				// Scroll window to place element more at the vertical center if element is only partially visible
				$('html, body').stop();
				var t = $this.offset()['top'],
					h = Math.max($this.height(), 240),
					wst = $(window).scrollTop(),
					s = null; // t - (options.H / 2) + (h / 2); // center
				if (t < (wst + 80)) s = t - 80;
				else if ((t + h) > (wst + options.H - 80)) s = t - options.H + h + 80;
				if (s != null && s != wst) $('html, body').animate({scrollTop:(s)}, ( (wst - s) > 60 || (s - wst) > 60 ? '1400' : '800' ));
				
				// Wait a little and popOut big infos div...
				var _mouser = setTimeout(function(T) {
					var $this = $(T),
						Off = $this.offset(),
						t = parseInt(Off['top']), l = parseInt(Off['left']),
						w = $this.width(), h = $this.height(),
						hMin = Math.max(h, 240),
						marg = 10, larg = 300,
						props = {opacity:0.96, top:(t-marg)+'px', width:((w+larg) + (marg*3))+'px', height:(hMin + (marg*2))+'px'};
					if (l < (options.W/2)) $.extend(props, {left:(l-marg)+'px'});
					else $.extend(props, {left:(l-larg-(marg*2))+'px'});
					var $divVoile = $('<div />')
						.addClass('voilage')
						.css({opacity:0, width:options.dW+'px', height:options.dH+'px'})
						.appendTo('body')
						.animate({opacity:.8}, {duration:600});
					var $divPop = $('<div />')
						.addClass('popupIntro')
						.css({opacity:0, top:t+'px', left:l+'px', width:w+'px', height:h+'px'}) // top:($(window).scrollTop() + 100)})
						.html('<div style="width:'+(larg+marg)+'px;height:'+hMin+'px;float:'+(l < (options.W/2) ? 'right' : 'left')+'"><h2>'+$leg.text()+'</h2><p>'+$this.data('introduction')+'</p></div>')
						.appendTo('body')
						.animate(props, {duration:333});
					$this.css('zIndex', '900');
					$this.data({t:t, l:l, w:w, h:h, divVoile:$divVoile, divPop:$divPop});
				}, 1200, this);
				$this.data({mouser:_mouser});
			};
			
			// Box image Blur
			var imgBoxMouseleave = function() { 
				var $this = $(this),
					_mouser = $this.data('mouser'),
					$divPop = $this.data('divPop'),
					$divVoile = $this.data('divVoile'),
					$leg = $this.find('div.imgLeg');
				if (_mouser) {
					clearTimeout(_mouser);
					$this.data({mouser:null});
				}
				if ($divPop && $divPop.length > 0)
					$divPop.stop().animate(
						{opacity:0, top:$this.data('t')+'px', left:$this.data('l')+'px', width:$this.data('w')+'px', height:$this.data('h')+'px'},
						{duration:300, complete:function() { $divPop.remove(); $this.css('zIndex', '500'); }}
					);
				if ($divVoile && $divVoile.length > 0)
					$divVoile.stop().animate(
						{opacity:0},
						{duration:333, complete:function() { $divVoile.remove(); $this.css('zIndex', '500'); }}
					); 
				$leg.stop().show();
				$leg.animate({bottom:'0'}, 250);
				$leg.animate({backgroundPosition:'0px 0px', opacity:1}, 500);
			};
				
			// Is all images are loaded... ???
			var waitCompleteLoad = function() {
				if (_countLoadImg > 0) {
					_totalLoadImg = Math.max(_countLoadImg, _totalLoadImg);
					if (_totalLoadImg > 1) {
						var loaded = _totalLoadImg - _countLoadImg;
						var pctLoadImg = parseInt((loaded /  _totalLoadImg) * 100);
						$('span#scrollInfos').html('Loading images <strong>'+pctLoadImg+'%</strong>');
					}
					return;
				}
				// Wallified !!
				_totalLoadImg = 0;
				if (_intWaitLoad) { clearInterval(_intWaitLoad); _intWaitLoad = null; } // Stop
				$('span#scrollInfos').html('Scroll down to load more items... (<strong>P'+options.currentPage+'</strong>)');
				if (_wallified) { // Update wall
					for (var i in _stockedBox) $wall.masonry({appendedContent:_stockedBox[i]});
					_stockedBox = [];
					return;
				}
				// INIT WALL ! once loaded...
				_wallified = true;
				$(options.divLoading).fadeOut(1600);
				$wall.masonry(
					{columnWidth:options.colWidth, itemSelector:'div.box', animate:true, animationOptions:{duration:800}},
					function() { // Callback, but animate is not finish
						setTimeout(function() { // Time for each box to take his leg and go to the right place...
							centerWall();
							$(window).bind('smartresize', centerWall); // cf. masonry
							$(window).bind('scroll', isNearBottom); // Call next page when user scroll down
							//$('body').bind('mousemove', checkMouseIfTopBottom);
							if ($wall.height()+300 < $(document).height()) setTimeout(function() { callNextFeed(); }, 5000); // Il reste de la place ?
							$wall.masonry({animate:false});
						}, 1200);
					}
				);
			};
			
			// JSON CallBack, building HTML
			var buildWall = function(data) {
				_ajaxWork = false;
				_countLoadImg = 0;
				// Normally Php return error info...
				if (!data || (data[0] && data[0]['message'])) { 
					cancel();
					if (!data || !data[0] || !data[0]['message']) popUp('Can\'t find PHP feed fetcher...', 5000);
					else if (data[0]['message'] == 'no more') {
						$('span#scrollInfos').html('No more data...  we fetch a new one ! (Or <a href="javascript:void(0);" onclick="$(\'html, body\').animate({scrollTop:0}, 1600);">Try a new feed</a> !)'); // append
					}
					else popUp(data[0]['message'], 10000);
					setTimeout(function() { getRandomFeed(); }, 5000);
					return;
				}
				
				// OK good JSON to parse... Let's go !
				$.each(data, function(i, item) {
					_globalId++;
					var $color = options.colorArr[Math.round(Math.random() * (options.colorArr.length-1))], // Can we have a criteria in feeds ?
						t = item['title'].length,
						id = 'box_'+_globalId,
						colNum = '';	
					if (options.W > 480) colNum = 'col'+(t < 50 ? '1' : (t < 100 ? '2' : '3')); // Personal feeling...
					else colNum = 'col'+(t < 80 ? '1' : '2');

					if (i == 0 && options.currentPage == 1) { // Add first BOX.. (feed desc)
						$color = '#0099CC';
						$box = $('<div id="'+id+'" class="box col3 shadow titleBox"><h1 style="color:'+$color+';">'+item['title']+'</h1><p style="color:'+$color+';"><strong>'+item['description']+'</strong></p><p style="color:'+$color+';"><strong>Site :</strong> <a href="'+item['link']+'" target="_blank">'+unescape(item['link'])+'</a><br /><strong>Feed :</strong> <a href="'+getFeed()+'" target="_blank">'+unescape(getFeed())+'</a><br />&nbsp;</p></div>');
					}
					else if (i == 0 && options.currentPage > 1) { // Otherwise, skip feed desc
						return true;
					}
					else { // Items Text BOX !
						$box = $('<div id="'+id+'" class="box '+colNum+' shadow" onclick="window.open(\''+item['permalink']+'\');"><h3 style="color:'+$color+';">'+item['title']+'</h3></div>');
					}
					$box.data({introduction:item['introduction'], url:item['permalink']});

					$wall.append($box);
					$box.css('opacity', 0).delay(1000+(i*250)).animate({opacity:1}, 800, 'easeOutQuad');	
					if (i != 0 || options.currentPage > 1) $box.bind({mouseenter:imgBoxMouseEnter, mouseleave:imgBoxMouseleave});
					if (_wallified) _stockedBox[id] = $box; // for being appended to masonry later
					if (item['enclosure']) { // Ok.. so images are up ? I prefer to check for too small img asynchronously.. and rebuild the box after..
						_countLoadImg++;
						$('<img />')
						.load(function(){
							var $this = $(this);
							var w = $this.width(),
							h = $this.height();
							$this.remove(); // Clear loaded img
							if (w > 50 && h > 50) { // New Item Images BOX
								var colNum = 'col1';
								if (options.W > 480) colNum = 'col'+(w < 100 ? '1' : (w < 300 || h > 300 ? '2' : '3')); // Personal feeling ;)
								else colNum = 'col'+(w < 200 ? '1' : '2');
								$imgBox = $('<div id="'+id+'" class="box '+colNum+' withImg" onclick="window.open(\''+item['permalink']+'\');" style="width:'+w+'px; height:'+h+'px;"><div style="background:url('+item['enclosure']+') no-repeat center center;width:'+w+'px; height:'+h+'px;">&nbsp;</div><div class="imgLeg"><p>'+item['title']+'</p></div></div>'); // Replace "Only title" div...
								$('div#'+id).replaceWith($imgBox).hide(); // Update old BOX
								$leg = $imgBox.find('div.imgLeg');
								$leg.css({bottom:'-'+($leg.outerHeight()+2)+'px'});
								if (_wallified) _stockedBox[id] = $imgBox; // for being appended to masonry later
								$imgBox.data({introduction:item['introduction'], url:item['permalink']});
								$imgBox.bind({mouseenter:imgBoxMouseEnter, mouseleave:imgBoxMouseleave}); // Overlay legend for images
								$imgBox.find('div:first')
									.css({marginTop: (h/2), marginLeft: (w/2), width:0, height:0})
									.delay(600 + (i * 200))
									.show()
									.animate({marginTop: 0, marginLeft: 0, width: w, height: h }, 800, 'easeOutQuad', function() {
										$(this).parent('div.box').addClass('shadow');
										setTimeout(function(T) { T.trigger('mouseleave'); }, 600 + (i * 200), $(this));
									})
							}
							_countLoadImg--;
						})
						.error(function() { $(this).remove(); _countLoadImg--; db('Img error : '+item['enclosure']); })
						.attr('src', item['enclosure'])
						.css('marginLeft', '100%') // Hidden
						.appendTo($wall); // In $box CSS deform img width()
					}
				});
				options.currentPage++;
				_intWaitLoad = setInterval(waitCompleteLoad, 25);
			};
			
			// Load JSON feed from PHP
			var callNextFeed = function() {
				_ajaxWork = true;
				var feedUrl = getFeed();
				$('span#scrollInfos').html('Loading data... '+unescape(feedUrl)+(options.currentPage > 1 ? ' (<strong>P'+options.currentPage+'</strong>)' : ''));
				_ajax = $.ajax({ 
					dataType	: 'json', 
					timeout		: 60000, // Can be looong
					cache		: true,
					data 		: {url: feedUrl, page: options.currentPage},
					url			: options.provider, 
					success		: buildWall, // Yeah
					error		: function(request, status, error) { cancel(); popUp('Feed loading error '+feedUrl+' :( '+request+', '+status+', '+error+'):', 6000); }
				}); 
			};
			
			// Loading Message
			if ($(options.divLoading).length < 1) {
				$('<div id="loading">\
					<img src="'+options.baseAppUrl+'img/loading.gif" width="31" height="31" alt="loading" /><br />\
					<div id="message"></div>\
					<p>Parsing feed... <a href="'+getFeed()+'" target="_blank"><strong>'+unescape(getFeed())+'</strong></a><br />\
					Fetching items real URL, finding and resizing images...</p>\
					<br />\
					<p><strong>Waiting !</strong>... But only the first time ^^</p>\
				</div>').appendTo('body'); //.hide().fadeIn(300); // Better to fire display directly
			}
			
			// Init
			callNextFeed();
			formInputValidate();

			return $wall;
		}
	});
})(jQuery);

// Ok.. so DOM is up...
$(document).ready(function() {
	$('div#masonry').wallify(); // Call "plugin"
	$('html, body').css({scrollTop:0}); // Droid address bar..
});
$(window).bind('load', function() {
	$('html, body').css({scrollTop:0}); // Droid address bar..
});