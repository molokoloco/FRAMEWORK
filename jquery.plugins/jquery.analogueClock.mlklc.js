/* //////////////////////////////////////////////////////////////////////////////////////////////////////
///// Code mixing by Molokoloco ..... 2011 ......... [EVER IN PROGRESS (it's not done yet)] ////////////
//////////////////////////////////////////////////////////////////////////////////////////////////// */
/*
	// Pixel polished jQuery & CSS3 analogue clock
	// by molokoloco@gmail.com 08/10/2011
	// Infos : http://www.b2bweb.fr/molokoloco/pixels-polished-jquery-css3-analogue-clock/
	// jsFiddle : http://jsfiddle.net/molokoloco/ajcRz/

	// HTML
	<link href="http://fonts.googleapis.com/css?family=Orbitron" rel="stylesheet" type="text/css">
	<link rel="stylesheet" type="text/css" href="jquery.analogueClock.css">

	<div id="clock">
		<!--// PLUGIN BUILD THIS
			<div class="digit" style="left:56px;top:0px;"><span>12</span></div>
			<div class="digit" style="left:84px;top:7.50px;">1</div>
			...12 digits...
			<div class="sec" style="-webkit-transform:rotate(246deg);"><div class="clockwise"></div></div>
			<div class="min" style="-webkit-transform:rotate(270deg);"><div class="clockwise"></div></div>
			<div class="hour" style="-webkit-transform:rotate(412.5deg);"><div class="clockwise"></div></div>
			<div class="time">13:45:41</div>
			<div class="innerCenter"></div>
		//-->
	</div>

	// USAGE ;
	$('div#clock').analogueClock({digitBoxWidth:18, withDigitalTime:false});
*/



(function($) {
    
    Number.prototype.padTime = function() { return (this < 10 ? '0'+this : this); };
    
    $.fn.extend({ // Extend jQuery with custom plugin
        
        rotate: function(degree) { // Cross browser rotate
            return this.each(function() {
                var rotate = 'rotate('+degree+'deg)';
                return $(this).css({
                    '-moz-transform':rotate,
                    '-webkit-transform':rotate,
                    '-ms-transform':rotate,
                    '-o-transform':rotate,
                    transform:rotate
                });
            });
         },
        
         analogueClock: function(options) { // Analogue Clock plugin
            
            options = $.extend({ // Default values
                withHours:true, // Print digit time ?
                withDigitalTime:true, // Print time (digital) in center
                digitBoxWidth:20 // div.digit width : cf. css
            }, options || {});
             
            return this.each(function() {
                var $clock = $(this);
                
                // Built analog digits number
                if (options.withHours) { 
                    var plotsNum = 12, // 12 hours digits, normally ^^
                        increase = Math.PI * 2 / plotsNum, // cheeseCake
                        angle = -(increase * 3), // rotate midnight at top
                        clockCenter = parseInt($clock.innerWidth(), 10) / 2 - (options.digitBoxWidth / 2),
                        digitsHtml = '';
                    for (var i = 0; i < plotsNum; i++) {
                        var x = clockCenter * Math.cos(angle) + clockCenter,
                            y = clockCenter * Math.sin(angle) + clockCenter;
                        digitsHtml += '<div class="digit" style="left:'+x+'px;top:'+y+'px;">'+
                            (i % 3 == 0 ? '<span>'+(i == 0 ? plotsNum : i)+'</span>' : i) 
                                      +'</div>';
                        angle += increase;
                    }
                    $clock.append(digitsHtml);
                }
                
                // Buil clockwise
                var $sec = $('<div class="sec"><div class="clockwise"></div></div>').appendTo($clock),
                    $min = $('<div class="min"><div class="clockwise"></div></div>').appendTo($clock),
                    $hour = $('<div class="hour"><div class="clockwise"></div></div>').appendTo($clock),
                    $time = (options.withDigitalTime ? $('<div class="time">00:00:00</div>').appendTo($clock) : null),
                    $innerCenter = $('<div class="innerCenter"></div>').appendTo($clock);
                
                // Animate clockwise
                var timer = function() {
                    var now = new Date(),
                        seconds = now.getSeconds(),
                        mins = now.getMinutes(),
                        hours = now.getHours();
                    $sec.rotate(seconds * 6); // 60 * 6 == 360°
                    $min.rotate(mins * 6);
                    $hour.rotate(hours * 30 + (mins / 2));
                    if (options.withDigitalTime)
                        $time.html(hours.padTime()+':'+mins.padTime()+':'+seconds.padTime());
                    setTimeout(timer, 300); // precision 300ms
                };
                timer(); // init !
                return $(this);
            });
        }
    });
})(jQuery);