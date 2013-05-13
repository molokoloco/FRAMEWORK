(function($, window, document) {
    
    // jQuery scrollView V0.8.2 : Viewport scroll and screen vertical helper
    // One view for each screen that user need to scroll to get to the bottom of the HTML view
    // Molokoloco 2013 - Copyleft
    // Live fiddle : http://jsfiddle.net/molokoloco/XK3t5/
    // Github : ...
    // Infos : ...
    
    // Made another plugin here : http://jsfiddle.net/molokoloco/Atj8Z/ (Viewport live menu)
    
    // ----------- SCROLLTOP element - BROWSER SET BASE ---------------------------------------------------------------------------------- //
    
    var $window             = $(window),
        $document           = $(document),
        $body               = $('body'),
        scrollElements      = 'html,body,document',
        $scrollElement      = $(),
        newAnchror          = '',
          isAnimated          = false; // Tell if something is actually animating the scroll
    
    // Find scrollElement
    // Inspired by http://www.zachstronaut.com/posts/2009/01/18/jquery-smooth-scroll-bugs.html
    $(scrollElements).each(function(i) {
        // 'html, body' for setter... window for getter... 
        var initScrollTop = parseInt($(this).scrollTop(), 10);
        $(this).scrollTop(initScrollTop + 1);
        if ($window.scrollTop() == initScrollTop + 1) {
            scrollElements = this.nodeName.toLowerCase(); // html OR body
            return false; // Break
        }
    });
    $scrollElement = $(scrollElements);
    
    // UTILITIES...
    var getHash             = function() { return window.location.hash || ''; },
        setHash             = function(hash) { if (hash && getHash() != hash) window.location.hash = hash; },
        getWinWidth         = function() { return $window.width(); }, // iphone ? ((window.innerWidth && window.innerWidth > 0) ? window.innerWidth : $window.width());
        getWinHeight        = function() { return $window.height(); }, // iphone ? ((window.innerHeight && window.innerHeight > 0) ? window.innerHeight : $window.height());
        getPageWidth        = function() { return $document.width(); },
        getPageHeight       = function() { return $document.height(); },
        getScrollTop        = function() { return parseInt($scrollElement.scrollTop() || $window.scrollTop(), 10); },
        setScrollTop        = function(y) { $scrollElement.stop(true, false).scrollTop(y); },
        myScrollTo          = function(y) { // Call view scrolling to a value (like native window.scrollBy(x, y)) // Can be flooded
            isAnimated = true; // kill waypoint AUTO hash
            var duration = 360 + (Math.abs(y -  getScrollTop()) * 0.42); // Duration depend on distance...
            if (duration > 2222) duration = 0; // Instant go !! ^^
            $scrollElement
                .stop(true, false)
                .animate({scrollTop: y}, {
                    duration: duration,
                    easing: 'easeOutCubic',
                    complete: function() { // Listenner of scroll finish...
                        setHash(newAnchror); // If new anchor
                        newAnchror = '';
                        isAnimated = false;
                    }
                });
        };

    // ----------- JQUERY EXTEND ---------------------------------------------------------------------------------- //
    
    $.easing.jswing = $.easing.swing;
    $.extend($.easing, { // Extract from jQuery UI
        def: 'easeOutQuad',
        swing: function (x, t, b, c, d) { return $.easing[$.easing.def](x, t, b, c, d); },
        easeInQuad: function (x, t, b, c, d) { return c*(t/=d)*t + b; },
        easeOutCubic: function (x, t, b, c, d) {  return c*((t=t/d-1)*t*t + 1) + b; }
    });
    
    $.fn.scrollToMe = function(target) { // Extend jQuery, call view scrolling to a element himself
        return this.each(function() {
            if (target) newAnchror = target; // Update hash, but after scroll anim
            myScrollTo(parseInt($(this).offset().top, 10));
        });
    };
    
    $.fn.scrollScreen = function(options) { // ................... $scrollScreen();

        if ($body.data('scrollScreen') == true) return this; // Only once... and one
        $body.data('scrollScreen', true);
        
        // Merge user options
        options = $.extend(true, {}, $.fn.scrollScreen.defaults, typeof options == 'object' &&  options);
        
        var $container            = $(this),
            $scrollScreen         = $('<div class="'+options.scrollScreen+'">1</div>')
                                    .appendTo($container),
            $scrollScreenZone     = $('<div class="'+options.scrollScreenZone+'" title="Pour naviguer d\'écran en écran..."></div>')
                                    .appendTo($container);
        // Privates vars
        var mouseIsMoveViewsInt   = null,
            windowTmr             = null,
            currentHeight         = getWinHeight(),
            currentPageHeight     = getPageHeight(),
            maxScroll             = (totalViews - 1) * currentHeight,
            totalViews            = 1 + Math.floor(getPageHeight() / currentHeight),    
            scrollScreenMarginTop = - (Math.floor($scrollScreen.height() - ($scrollScreen.height() / 3))),
            scrollScreenMaxTop    = currentHeight - $scrollScreen.height();
        
        // ----------- VIEWPORT SCREEN THUMBS ---------------------------------------------------------------------------------- //
        // My others others plugins here : http://jsfiddle.net/molokoloco/Atj8Z/

        var mouseIsMoveViewsClear = function() {
                if (options.debug) console.log('mouseIsMoveViewsClear()');
                if (mouseIsMoveViewsInt) clearTimeout(mouseIsMoveViews);
                if (isAnimated) {
                    mouseIsMoveViewsInt = setTimeout(mouseIsMoveViewsClear, 2500); // Wait end of scrolling user anim
                }
                else {
                    mouseIsMoveViewsInt = null;
                    $scrollScreen.removeClass('current');
                    $scrollScreenZone.attr('title', '');
                    setCurrentViewport(getScrollTop()); // Reset
                }
            },
            mouseIsOutViews = function(event) {
                if (options.debug) console.log('mouseIsOutViews(event)', event);
                if (mouseIsMoveViewsInt) clearTimeout(mouseIsMoveViews);
                mouseIsMoveViewsInt = setTimeout(mouseIsMoveViewsClear, 2500); // Reset ?
            },
            moveViews = function(ascPos) { // Move and update Viewport slider text
                if (options.debug) console.log('moveViews(ascPos)', ascPos);
                ascPos = ascPos || getScrollTop();
                ascPos = ascPos + scrollScreenMarginTop; // Set some margin with user cursor pos
                ascPos = Math.max(ascPos, 0);
                ascPos = Math.min(ascPos, scrollScreenMaxTop);
                var view = 1 + Math.floor(totalViews * (ascPos / currentHeight)); // view 1 == < winHeight : ceil
                $scrollScreen // .stop(true, false).animate({top:ascPos}, 250, 'easeOutCubic');  // JS skipped for CSS : transition
                    .css({top:ascPos})
                    .text(view);
                if (options.checkHash  && getHash() != '#screen_'+view) setHash('#screen_'+view);
            },
            mouseIsMoveViews = function(event) {
                if (options.debug) console.log('mouseIsMoveViews(event)', event.clientY);
                if (mouseIsMoveViewsInt) {
                    clearTimeout(mouseIsMoveViewsInt);
                    mouseIsMoveViewsInt = null;
                }
                else $scrollScreen.addClass('current');
                moveViews(event.clientY);
            },
            setCurrentViewport = function(scrollTop) { // I cannot pretend to be exactly aligned with the browser scrollbar :-/
                if (options.debug) console.log('setCurrentViewport(scrollTop)', scrollTop);
                var currentScroll  = scrollTop || getScrollTop(),
                    ascPos         = (currentScroll + currentHeight) / currentPageHeight, // % in the viewport
                    ascPos         = currentHeight * ascPos; // Pix in the viewport
                moveViews(ascPos);
            },
            moveToViewport = function(view) { // Lead to corresponding screen number
                if (options.debug) console.log('moveToViewport(view)', view);
                var scrollTarget = 0;
                if (view == totalViews - 1) scrollTarget = (totalViews - 1) * currentHeight; // To be certain to reach the end...
                else scrollTarget = (view - 1) * currentHeight;
                myScrollTo(scrollTarget);
                return false;
            },
            viewportClick = function(event) { // Paginette links click lead to corresponding screen scroll
                if (options.debug) console.log('viewportClick(event)', event);
                var ascPos = currentPageHeight * (event.clientY / currentHeight);
                myScrollTo(ascPos);
                return false;
            },
            viewportDbClick = function(event) { // Double click to run up...
                if (options.debug) console.log('viewportDbClick()');
                myScrollTo(1);
                return false;
            },
            createViewport = function() { // Build viewport 
                if (options.debug) console.log('createViewport()');
                if (totalViews < 1) return; // Never now...
                $scrollScreenZone
                    .on('click touchend', viewportClick)
                    .on('dblclick',       viewportDbClick)
                    .on('mousemove',      mouseIsMoveViews)
                    .on('mouseout',       mouseIsOutViews);
                setCurrentViewport();
            };
        
        createViewport();
        
        // ----------- WIN EVENTS ---------------------------------------------------------------------------------- //

        var scrollRefreshEvent = function() {
                if (options.debug) console.log('scrollRefreshEvent()');
                windowTmr = null;
                $scrollScreen.removeClass('current');
            },
            scrollling = function(event) {
                // if (options.debug) console.log('scrollling()'); // Flood
                if (windowTmr) clearTimeout(windowTmr);
                windowTmr = setTimeout(scrollRefreshEvent, 600); //trottle resize : Wait a pause of 300ms before triggering
                setCurrentViewport();
                $scrollScreen.addClass('current');
            },
            resizeRefreshEvent = function(target) { // Global EVENT.RESIZE dispatcher, ok TODO with pub/sub pattern...
                if (options.debug) console.log('resizeRefreshEvent()');
                currentHeight     = getWinHeight();
                currentPageHeight = getPageHeight();
                maxScroll         = (totalViews - 1) * currentHeight;
                totalViews        = Math.ceil(getPageHeight() / currentHeight);
                setCurrentViewport();
                if (options.checkHash)
                    windowTmr = setTimeout(function(_target) {
                        windowTmr = null;
                        checkHash(_target); // Repos scroll to current ?
                    }, 1000, target || getHash());
            },
            resizing = function(event) { // Resize Event
                // if (options.debug) console.log('resizing()'); // Flood
                if (windowTmr) clearTimeout(windowTmr);
                windowTmr = setTimeout(resizeRefreshEvent, 360, getHash()); // trottle resize, pass current hash...
            };

        $window
            .on('scroll', scrollling)
            .on('resize', resizing);

        // ----------- DOCUMENT LOCATION INIT ---------------------------------------------------------------------------------- //

        var checkHash = function(hash) {
            var initTarget = hash || getHash();
            if (initTarget) {
                initTarget = initTarget.split('screen_'); // Catch fake hash // '#screen_'+view
                if (parseInt(initTarget[1], 10) > 0) { // (initTarget.length > 0) {
                    if (options.debug) console.log('checkHash() auto init target', initTarget[1]);
                    // $(initTarget[0]).scrollToMe(initTarget[0]); // #chapter_4_screen (fake) == #chapter_4 (real one)
                    moveToViewport(initTarget[1]);
                }
            }
        };

        if (options.checkHash) checkHash();
        
        // ----------- jQuery element (body ?) ---------------------------------------------------------------------------------- //
        
        // Iterate collections // Maybe later ?
        // return this.each(function() {});
        return this;
    };

    // Default setup options
    $.fn.scrollScreen.defaults = {
        debug             : ('console' in window && /* DEBUG ? */false), // Log all functions and events ?
        checkHash         : false, // On doc init, look for some anchors in the URL to scroll to ?...
        scrollScreenZone  : 'scrollScreenZone', // CSS class, without dot.
        scrollScreen      : 'scrollScreen'
    };
    
})(jQuery, window, document); // End of the Scrolling Lab Closure... //

//////////////////////////////////////////////////////////////////////////////////////////////////////
// Usage example... //////////////////////////////////////////////////////////////////////////////////

/* 
    // Assuming this CSS...
 
    // a rectangle from top to bottom of the viewport (ex. 40*600) - User events zone
    div.scrollScreenZone { 
        position:fixed;
        z-index:999;
        top:0;
        right:0;
        bottom:0;
        width:40px;
        cursor:pointer;
    }
    
    // a square that print pages and follow user OR scrollbar
    div.scrollScreen { 
        position:fixed;
        z-index:989;
        top:0;
        right:3px;
        width:33px;
        height:33px;
        // border-radius:3px; - skipped for fast perf
        line-height:33px;
        font-size:16px;
        font-weight:normal;
        text-align:center;
        color:rgba(5,5,5,0.2);
        text-shadow:0 1px 0 rgba(250,250,250,0.6);
        // box-shadow:inset 0 1px 0 rgba(250,250,250,0.6); - avoided for fast perf
        background:rgba(5,5,5,0.05);
        -webkit-transition: background 1s cubic-bezier(0.215, 0.610, 0.355, 1.000),
                            top 1200ms cubic-bezier(0.215, 0.610, 0.355, 1.000); //  easeOutCubic
           -moz-transition: background 1s cubic-bezier(0.215, 0.610, 0.355, 1.000),
                            top 1200ms cubic-bezier(0.215, 0.610, 0.355, 1.000);
            -ms-transition: background 1s cubic-bezier(0.215, 0.610, 0.355, 1.000),
                            top 1200ms cubic-bezier(0.215, 0.610, 0.355, 1.000);
             -o-transition: background 1s cubic-bezier(0.215, 0.610, 0.355, 1.000),
                            top 1200ms cubic-bezier(0.215, 0.610, 0.355, 1.000);
                transition: background 1s cubic-bezier(0.215, 0.610, 0.355, 1.000),
                            top 1200ms cubic-bezier(0.215, 0.610, 0.355, 1.000);
    }
        div.scrollScreen.current {
            color:rgba(250,250,250,0.9);
            text-shadow:0 1px 0 rgba(0, 0, 0, 0.33);
            // box-shadow:0 1px 0 rgba(250,250,250,0.6); - avoided for fast perf ==
            background:rgba(5,5,5,0.3);
            text-decoration:none;
        }

*/

$('body').scrollScreen({ // Use it...
    checkHash        :  true,              // On doc init, look for some anchors in the URL to scroll to ?...
    scrollScreen     : 'scrollScreen',
    scrollScreenZone : 'scrollScreenZone' // CSS class, withou dot.
});
