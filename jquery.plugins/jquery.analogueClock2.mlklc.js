/*
    // Pixel polished jQuery & CSS3 Analogue Clock plugin V2
    // by molokoloco@gmail.com 10/10/2011 - 
    // Infos : http://www.b2bweb.fr/molokoloco/pixels-polished-jquery-css3-analogue-clock/
    // jsFiddle : http://jsfiddle.net/molokoloco/ajcRz/

    // HTML
    <link href="http://fonts.googleapis.com/css?family=Orbitron" rel="stylesheet" type="text/css">
    <link rel="stylesheet" type="text/css" href="jquery.analogueClock.css">
    script src="http://code.jquery.com/jquery-latest.js"

    <div id="clock">
        <!--// PLUGIN BUILD THIS // ---
            <div class="digit" style="left:56px;top:0px;"><span>12</span></div>
            <div class="digit" style="left:84px;top:7.50px;">1</div>
            ...12 digits...
            <div class="unit"></div>
            ...12 units...
            <div class="sec" style="transform:rotate(246deg);"><div class="clockwise"></div></div>
            <div class="min" style="transform:rotate(270deg);"><div class="clockwise"></div></div>
            <div class="hour" style="transform:rotate(412.5deg);"><div class="clockwise"></div></div>
            <div class="time">13:45:41</div>
            <div class="innerCenter"></div>
       --- // END PLUGIN //-->
    </div>

    // USAGE
    $(document).ready(function(){
        $('div#clock').analogueClock({digitBoxWidth:18, withDigitalTime:false});
    });
*/

/*
    // Pixel polished jQuery & CSS3 Analogue Clock plugin V2.1
    // by molokoloco@gmail.com 10/10/2011 - 
    // Infos : http://www.b2bweb.fr/molokoloco/pixels-polished-jquery-css3-analogue-clock/
    // jsFiddle : http://jsfiddle.net/molokoloco/V2rFN/
*/

;(function($, window) {
    $.fn.extend({ // Extend jQuery with custom plugin
        
        // Cross browser CSS rotate
        rotate: function(val) { // $('div').rotate('90deg');
            return this.each(function() {
                var rotate = 'rotate('+val+')';
                return $(this).css({'-moz-transform':rotate, '-webkit-transform':rotate, '-ms-transform':rotate, '-o-transform':rotate, transform:rotate});
            });
        },
        
        // Distribute elements clockwise inside a box
        circalise: function(options) { // $('div').circalise({targets:'div.unit'});
            options = $.extend({
                targets          :'> *', // childs elements to distribute inside this box
                rotateTargets    :false,
                startAngle       :270, // 270deg, start at top center (like a clock)
                xRadius          :null, // default radius to the radius of the box, minus target width
                yRadius          :null
            }, options || {});
            
            return this.each(function() {  
                var $this = $(this),
                    $targets = $this.find(options.targets),
                    plotsNum = $targets.length,
                    increase = (Math.PI * 2) / plotsNum, // Rad cheeseCake  
                    angle = Math.PI * (options.startAngle / 180); // convert from DEG to RAD
                $targets.each(function() {
                    var $target = $(this),
                        xCenter = (parseInt($this.innerWidth(), 10) - parseInt($target.outerWidth(), 10)) / 2,
                        yCenter = (parseInt($this.innerHeight(), 10) - parseInt($target.outerHeight(), 10)) / 2,
                        xRadius = (options.xRadius || options.xRadius === 0 ? options.xRadius : xCenter),
                        yRadius = (options.yRadius || options.yRadius === 0 ? options.yRadius : yCenter),
                        params = {
                            left: xRadius * Math.cos(angle) + xCenter,
                            top: yRadius * Math.sin(angle) + yCenter
                        };
                    $target.css(params);
                    if (options.rotateTargets)
                        $target.rotate((Math.atan2(params.top-yCenter, params.left-xCenter)+(Math.PI/2))+'rad'); // (Math.PI/2) == 90deg in rad : rotate to keep tangent
                    angle += increase;
                });
            });
         },
         
        // Analogue Clock plugin
         analogueClock: function(options) {
             options = $.extend({ // Default values
                withHours        :true, // Print digit time ?
                rotateHours      :true, // Rotate digit time ?
                withUnits        :true, // Print unit ?
                withDigitalTime  :false, // Print time (digital) in center
                withDate         :false // Print date
            }, options || {});  
            
             return this.each(function() {
                
                 // Build clock
                var $clock = $(this),
                    clockW = $clock.width(), clockH = $clock.height(),
                    $sec = $('<div class="sec"><div class="clockwise"></div></div>').appendTo($clock),
                    $min = $('<div class="min"><div class="clockwise"></div></div>').appendTo($clock),
                    $hour = $('<div class="hour"><div class="clockwise"></div></div>').appendTo($clock),
                    $time = (options.withDigitalTime ? $('<div class="time">00:00:00</div>').appendTo($clock) : null),
                    $date = (options.withDate ? $('<div class="date"> XXX </div>').appendTo($clock) : null),
                    $innerCenter = $('<div class="innerCenter"></div>').appendTo($clock),
                    $clockGlass = $('<div class="clockGlass"></div>').appendTo($clock);
                
                // CSS Center elements with half clock diameter
                $sec.css({top:0, left:( (clockW/2)-(parseInt($sec.width(), 10) / 2) )+'px', height:clockH+'px'});
                $min.css({top:0, left:( (clockW/2)-(parseInt($min.width(), 10) / 2) )+'px', height:clockH+'px'});
                $hour.css({top:0, left:( (clockW/2)-(parseInt($hour.width(), 10) / 2) )+'px', height:clockH+'px'});
                $clock.find('div.clockwise').css({bottom:(clockH/2)+'px'}); // center of the #clock inside hour,min,sec
                $innerCenter.css({margin:'-'+(parseInt($innerCenter.height(), 10)/2)+'px 0 0 -'+(parseInt($innerCenter.width(), 10)/2)+'px'});
                
                // Built analog digits number
                if (options.withHours) {
                    var plotsNum = 12, // 12 hours digits, normally ^^
                        digitsHtml = '';
                    for (var i = 0; i < plotsNum; i++) {
                        var digit = (i % 3 == 0 ? '<span>'+(i == 0 ? plotsNum : i)+'</span>' : i); // 0 == midnight == 12
                        digitsHtml += '<div class="digit">'+digit+'</div>';
                    }
                    $clock.append(digitsHtml);
                    $clock.circalise({targets:'div.digit', rotateTargets:options.rotateHours});
                }
                
                // Built analog digits number
                if (options.withUnits) {
                    var plotsNum = 12, // 12 hours digits, normally ^^
                        unitsHtml = '';
                    for (var i = 0; i < plotsNum; i++) unitsHtml += '<div class="unit"></div>';
                    $clock.append(unitsHtml);
                    var xRadius = parseInt($innerCenter.width(), 10) / 2
                               - (parseInt($clock.find('div.unit').eq(0).outerHeight(), 10) / 2),
                        yRadius = parseInt($innerCenter.height(), 10) / 2
                               - (parseInt($clock.find('div.unit').eq(0).outerHeight(), 10) / 2);;
                    $clock.circalise({targets:'div.unit', rotateTargets:true, xRadius:xRadius, yRadius:yRadius});
                }
                
                // Animate clockwise
                var timer = function() {
                    var now = new Date(),
                        seconds = now.getSeconds(),
                        mins = now.getMinutes(),
                        hours = now.getHours();
                    $sec.rotate((seconds * 6)+'deg'); // 60 * 6 == 360°
                    $min.rotate((mins * 6)+'deg');
                    $hour.rotate((hours * 30 + (mins / 2))+'deg');
                    if (options.withDate) // Tue Oct 11 2011 00:37:36 GMT+0200 (Paris, Madrid (heure d'été))
                        $date.html(now.toString().split(now.getFullYear())[0]);
                    if (options.withDigitalTime) 
                        $time.html(now.toString().split(now.getFullYear())[1].split(' ')[1]);
                    setTimeout(timer, 300); // precision 300ms is fine when widget is alone ;)
                };
                timer(); // init !
                
                return $(this);
            });
        }
    });
})(jQuery, window);