// SOMES FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////////////

// Debug tool !
var db = function() { 'console' in window && console.log.call(console, arguments); };
var event2key = {
		'96':'0', '97':'1', '98':'2', '99':'3', '100':'4', '101':'5', '102':'6', '103':'7', '104':'8', '105':'9', // chiffres clavier num
		'48':'m0', '49':'m1', '50':'m2', '51':'m3', '52':'m4', '53':'m5', '54':'m6', '55':'m7', '56':'m8', '57':'m9', // chiffres caracteres speciaux
		'65':'a', '66':'b', '67':'c', '68':'d', '69':'e', '70':'f', '71':'g', '72':'h', '73':'i', '74':'j', '75':'k', '76':'l', '77':'m', '78':'n', '79':'o', '80':'p', '81':'q', '82':'r', '83':'s', '84':'t', '85':'u', '86':'v', '87':'w', '88':'x', '89':'y', '90':'z', // Alphabet
		'37':'left', '39':'right', '38':'up', '40':'down', '13':'enter', '27':'esc', '32':'space', '107':'+', '109':'-', '33':'pageUp', '34':'pageDown', '223':'!', '178':'stop','176':'suivant','177':'precedant' // KEYCODES
	},
	e2key = function(e) {
		if (!e) return;
		//db(e.which, e.keyCode);
		return event2key[(e.which || e.keyCode)];
	};

// LET'S GO /////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function() {
	var setZoom = function() {
		var currentZoom = $(window).width() / 1680; //  This slide target confortable screen so adapt for other
		currentZoom = (currentZoom < 0.7 ? 0.7 : currentZoom); // Cannot read
		$('div.roundabout').css({
			zoom: currentZoom,
			'transform': 'scale('+currentZoom+')'
		});
	};
	setZoom();
	
	var $carousel = $('div.roundabout ul:first');
	$carousel
		.roundabout({
			//easing: 'easeInOutBack',
			duration: 1200,
			minScale: 0.1,
			tilt: 7.0,
			maxScale: 1.0,
			//btnNext: '.next',
			//btnPrev: '.previous',
			clickToFocus: true,
			reflect: true,
			childSelector: 'li.slide'
		})
		.find('li.slide')
			.hide().fadeIn(2400)
			.bind('mousewheel', function(e, delta) {
				e.preventDefault();
				//$(this).roundabout_adjustBearing(10.00 * delta);
				//$(this).data('roundabout').shape = $(this).val();
				if (delta > 0) $.roundabout_goPrev();
				else $.roundabout_goNext();
				return false;
			});
	
	var pageKey = function(e) {
		e.preventDefault();
		var k = e2key(e);
		db('pageKey('+k+')');
		switch(k) {
			case 'up': break;
			case 'down': break;
			case 'left': $.roundabout_goPrev(); break;
			case 'right': $.roundabout_goNext(); break;
			case 'enter': $carousel.roundabout_setBearing(0); break; // HOME
		}
	};
	
	$(document).focus().bind('keyup', pageKey);
	
	$(window).resize(function() {
		setZoom();
		$carousel.roundabout_animateToBearing($.roundabout_getBearing($carousel));
	});
});