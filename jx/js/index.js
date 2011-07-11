/*
	// SlidR - copyleft Molokoloco 2011 - Version alpha 1.1
	// Demo : http://www.b2bweb/bonus/jx/
	// The sources here : https://github.com/molokoloco/FRAMEWORK/tree/master/jx/
*/

// SOMES FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////////////

var db = function() { 'console' in window && console.log.call(console, arguments); }, // Debug tool !
	escapeURI = function(url) { return encodeURIComponent(url) || encodeURI(url) || escape(url) || url; },
	event2key = {
		'96':'0', '97':'1', '98':'2', '99':'3', '100':'4', '101':'5', '102':'6', '103':'7', '104':'8', '105':'9', // chiffres clavier num
		'48':'m0', '49':'m1', '50':'m2', '51':'m3', '52':'m4', '53':'m5', '54':'m6', '55':'m7', '56':'m8', '57':'m9', // chiffres caracteres speciaux
		'65':'a', '66':'b', '67':'c', '68':'d', '69':'e', '70':'f', '71':'g', '72':'h', '73':'i', '74':'j', '75':'k', '76':'l', '77':'m', '78':'n', '79':'o', '80':'p', '81':'q', '82':'r', '83':'s', '84':'t', '85':'u', '86':'v', '87':'w', '88':'x', '89':'y', '90':'z', // Alphabet
		'37':'left', '39':'right', '38':'up', '40':'down', '13':'enter', '27':'esc', '32':'space', '107':'+', '109':'-', '33':'pageUp', '34':'pageDown', '223':'!', '178':'stop','176':'suivant','177':'precedant' // KEYCODES
	},
	e2key = function(e) { return event2key[(e.which || e.keyCode)] || ''; }, // db(e.which, e.keyCode);
	getHash = function() { return document.location.hash.replace(/^#/, '') || ''; };

// LET'S GO /////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function() {
	var $carousel = $('div.roundabout ul:first'),
		$slides = $carousel.find('li.slide');
		$sommaire = $('div#footer span#sommaire'),
		startH = getHash(), // #1 , we got a page ?
		currentZoom = 1.0,
		title = $slides.eq(0).find('h1:first').text();
		url = 'http://www.b2bweb.fr/bonus/jx/'; //window.document.location.href;
	
	if (startH > 0) // Once setup is done, go to wanted slide
		setTimeout(function() {
			$carousel.roundabout_animateToChild(startH-1);
		}, 2000);
	
	$('div.roundabout').css({
		'transform': 'scale(5)', // effect starwars appear ;)
		'transform-origin': '50% 0',
		'-ms-transform-origin': '50% 0',
		'-webkit-transform-origin': '50% 0',
		'-moz-transform-origin': '50% 0',
		'-o-transform-origin': '50% 0'
	});
	
	// Setup carousel !!!
	$carousel
		.roundabout({
			//easing: 'easeInOutBack',
			duration: 1200,
			//focusBearing: 300,
			//startingChild:getHash() || 0,
			minScale: 0.15,
			maxScale: 1.0,
			minOpacity: 0.1,
			tilt: 0.555, // axe d'inclinaison
			btnNext: '.next',
			btnPrev: '.previous',
			clickToFocus: true,
			reflect: true, // reverse slide order
			childSelector: 'li.slide'
		})
		.bind('roundaboutFocus', function(e, a) { // RoundAbout send EVENT who is in now focus
			window.location.hash = '#'+(a.childPos+1); // Update URL hash
			$sommaire.find('a').removeClass('current').eq(a.childPos).addClass('current'); // Highlight current sommaire link
		});
	
	$slides
		//.hide().each(function(i){ $(this).fadeIn(500*(i+1)); }) // Effect appear
		.each(function(i) {  // Build sommaire forEach slides (with H5)
			$sommaire.append('<a href="#'+(i+1)+'" title="'+$(this).find('h5:first').text()+'">'+(i+1)+'</a>');
		});
	
	// Activate sommaire links
	$sommaire.delegate('a', 'click', function() {									
		var h = $(this).attr('href').replace(/^#/, '');
		if (h > 0) $carousel.roundabout_animateToChild(h-1);
	});
	
	// Global slideR zoom
	var setZoom = function(zoom) { 
		currentZoom = zoom ? zoom : $(window).width() / 1680; //  This slide target confortable screen so adapt for other
		currentZoom = (currentZoom < 0.5 ? 0.5 : currentZoom);
		$('div.roundabout').stop(true).animate({'transform': 'translate(0, 0) scale('+currentZoom+')'}, 1200); // with $.transform.js
		$carousel.roundabout_updateChildPositions();
		$carousel.roundabout_animateToBearing($.roundabout_getBearing($carousel));
		// var webkitZoom = document.width / $(document).width();
		$('html,body').css('zoom', '101%'); // Intent to restore user zoom to 100% to only zoom the slide, but fail with chrome
		db($('html').css('zoom'));
	};
	
	$('body').bind('mousewheel', function(event, delta) { // Can't cache USER ZOOM in chrome when ctrl + wheel
    	event.preventDefault();
		if (event.ctrlKey) { // CATCH default CTRL + WHEEL browser ZOOM : Set zoom only on slides
			if (delta > 0) setZoom(currentZoom + 0.05);
			else setZoom(currentZoom - 0.1);
		}
		if (delta > 0) $.roundabout_goPrev(); // $(this).roundabout_adjustBearing(10.00 * delta);
		else $.roundabout_goNext();
		return false;
	})
	
	$(window)
		.bind('resize', function() { setZoom(); })
		.trigger('resize');

	var pageKey = function(event) {
		event.preventDefault();
		var k = e2key(event);
		switch(k) {
			case 'up': break;
			case 'down': break;
			case 'left': $.roundabout_goPrev(); break;
			case 'right': $.roundabout_goNext(); break;
			case 'enter': $carousel.roundabout_setBearing(0); break; // HOME
		}
		return false;
	};
	
	/*var pageKeyIntent = function(event) {
		event.stopPropagation();
    	event.preventDefault();
		return false;
	}*/
	
	$(document)
		.focus()
		.bind('keyup', pageKey)
		//.bind('keydown', pageKeyIntent);
});

