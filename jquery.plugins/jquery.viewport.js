/*
    jQuery.viewport.JS
    Window viewport "screen to thumbs" scrolling navigator
    GPL/MIT/Copyleft - @molokoloco 2011 - http://b2bweb.fr

    * Live JS Fiddle démo : http://jsfiddle.net/molokoloco/Atj8Z/
    * Sources : https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.viewport.js
    
    Ex. :
    
        <ul id="viewport">
            <!--// Plugin insert viewport here //-->
        </ul>

        $(document).ready(function() {
            $('#viewport').viewport({tag:'li'});
        });

    Firstly it was implemented in a (larger) code here :

        - Infos : http://www.b2bweb.fr/molokoloco/my-book-readr-v1-12-html5-jquery-polished-page-as-a-book-reader/
        - Demo : http://www.b2bweb.fr/bonus/piratons-la-democratie.html
        - Sources : https://github.com/molokoloco/My-Book-ReadR/
*/

;(function($, window, document, undefined) {
    
    // ----------- UTILITIES... (To put in your framework, outside of this plugin ------------------------------------------ //
    
    // Debug tool
    var db = function() { 'console' in window && console.log.call(console, arguments); },
        _db_ = false; // Wanna print debug in console ?
        
    // Set in cache, intensive use !
    var $window = $(window),
        $document = $(document),
        scrollElement = 'html, body',
        $scrollElement = null;
    
    // Find scrollElement // inspired by http://www.zachstronaut.com/posts/2009/01/18/jquery-smooth-scroll-bugs.html
    $(scrollElement).each(function() { // 'html, body' for setter... window for getter... // window.scrollBy(0,0) is native also
        var initScrollTop = parseInt($(this).scrollTop(), 10);
        $window.scrollTop(initScrollTop + 1);
        if ($(this).scrollTop() == initScrollTop + 1) {
            scrollElement = this.nodeName.toLowerCase(); // html OR body
            if (_db_) db('scrollElement=', scrollElement);
            return false; // Break
        }
    });
    $scrollElement = $(scrollElement);

    // Various screen navigation functions...
   var tools = {
       getHash: function() {
            return window.location.hash || '';
       },
       setHash: function(hash) {
            if (hash && getHash() != hash) window.location.hash = hash;
       },
       getWinWidth: function() {
            return $window.width();
       },
       getWinHeight: function() { // iphone ? ((window.innerWidth && window.innerWidth > 0) ? window.innerWidth : $window.width());
            return $window.height();
       },
       getPageWidth: function() { // iphone ? ((window.innerHeight && window.innerHeight > 0) ? window.innerHeight : $window.height());
            return $document.width();
       },
       getPageHeight: function() {
            return $document.height();
       },
       getScrollTop: function() {
            return parseInt($scrollElement.scrollTop() || $window.scrollTop(), 10);
       },
       setScrollTop: function(y) {
            $scrollElement.stop(true, false).scrollTop(y);
       },
       myScrollTo: function(y) { // Call page scrolling to a value (like native window.scrollBy(x, y)) // Can be flooded
            if (_db_) db('myScrollTo(scrollTop)', y);
            isAnimated = true; // kill waypoint AUTO hash
            var duration = 360 + (Math.abs(y - tools.getScrollTop()) * 0.42); // Duration depend on distance...
            if (duration > 2222) duration = 0; // Instant go !! ^^
            $scrollElement.stop(true, false).animate({scrollTop: y}, {
                duration: duration,
                complete: function() { // Listenner of scroll finish...
                    if (_db_) db('myScrollTo.complete');
                    tools.setHash(newAnchror); // If new anchor
                    newAnchror = '';
                    isAnimated = false;
                }
            });
        },
        goToScreen: function(dir) { // Scroll viewport page by paginette // 1, -1 or factor
            if (_db_) db('goToScreen(dir)', dir);
            var winH = parseInt((tools.getWinHeight() * 0.75) * dir, 10); // 75% de la hauteur visible comme unite
            tools.myScrollTo(tools.getScrollTop() + winH);
        }
    };
   
    window.tools = tools;

    

    // ----------- PLUGIN VIEWPORT SCREEN THUMBS -------------------------------------------------------------------- //
    
    var plugName = 'viewport', // Base name
        options = null,
        newAnchror = '',
        isAnimated = false,
        totalViews = 0;

    var $viewport = '', // keep a ref to UL
        $viewportLinks = '';

    var methods = {
        init: function(options_) {
            
            options = $.extend({
                tag: 'span'
            }, options_);
            
            // EVENTS
    
            var windowTmr = null,
                windowViewTmr = null;
        
            var scrollRefreshEvent = function() {
                    if (_db_) db('scrollRefreshEvent()');
                    clearInterval(windowViewTmr);
                    windowViewTmr = null;
                    methods.setCurrentViewport();
                },
                scrollling = function(event) {
                    // if (_db_) db('body.scrollling'); // Flood
                    if (!windowViewTmr) // Optimize, viewport pages select, interval of 150ms
                        windowViewTmr = setInterval(methods.setCurrentViewport, 150);
                    if (windowTmr) clearTimeout(windowTmr);
                    windowTmr = setTimeout(scrollRefreshEvent, 333); // trottle scroll : Wait a pause of 300ms before trigger the redrawing
                },
                resizeRefreshEvent = function() { // Global EVENT.RESIZE
                    if (_db_) db('resizeRefreshEvent()');
                    methods.createViewport();
                },
                resizing = function(event) { // EVENT.RESIZE
                    // if (_db_) db('body.resizing'); // Flood
                    if (windowTmr) clearTimeout(windowTmr);
                    windowTmr = setTimeout(resizeRefreshEvent, 333); // trottle resize
                };
                
            $window
                .bind('scroll.' + name, scrollling)
                .bind('resize.' + name, resizing); 
            
            $viewport = $(this).eq(0); // Only one viewport ... 
            methods.createViewport();
            return $viewport;
        },
        createViewport: function() { // Build viewport, one link for each screen that user need to scroll to get to the bottom of the HTML page
            if (_db_) db('createViewport()');
            totalViews = Math.ceil(tools.getPageHeight() / tools.getWinHeight());
            if ($viewportLinks.lenght > 0) {
                $viewportLinks.unbind('click.' + name, methods.viewportClick);
                $viewport.empty();
            }
            if (totalViews < 1) return; // Never now...
            for (var i = 0, views = []; i < totalViews; i++)
            views.push('<' + options.tag + '><a href="#screen_' + (i + 1) + '">' + (i + 1) + '</a></' + options.tag + '>');
            $viewport.html(views.join(''));
            views = null;
            $viewportLinks = $viewport.find('a');
            $viewportLinks.bind('click.' + name, methods.viewportClick);
            methods.setCurrentViewport();
        },
        setCurrentViewport: function() { // Focus current page view link
            var page = 0, // ?
                currentScroll = tools.getScrollTop(),
                maxScroll = (totalViews - 1) * tools.getWinHeight();
            if (_db_) db('setCurrentViewport() currentScroll maxScroll', currentScroll, maxScroll);
            if (currentScroll < tools.getWinHeight()) page = 1; // Current page is processed relatively to view's bottom
            else if (currentScroll >= maxScroll) page = totalViews; // Last page..
            else page = Math.ceil(totalViews * (currentScroll / maxScroll)); // page 1 == < winHeight : ceil
            $viewportLinks
                .removeClass('current') // reset
                .eq(page - 1)
                .addClass('current'); // -1 : Page (1 , 2 , 3, ...) to #id eq(0, 1, 2, ...)
        },
        viewportClick: function(event) { // Paginette links click lead to corresponding screen scroll
            if (_db_) db('viewportClick()');
            event.preventDefault(); // set screen anchor in url for Screen can flood history
            var index = parseInt($(this).text(), 10) - 1, // Pages (1,2,3) to id (0,1,2)
                scrollTarget = index * tools.getWinHeight();
            if (index == totalViews - 1) scrollTarget = (totalViews - 1) * tools.getWinHeight(); // To be certain to reach the end...
            tools.myScrollTo(scrollTarget);
            // printInfos('&Eacute;cran n&deg;'+(index+1));
            return false;
        }
    };

    // ----------- PLUGIN-IZE ---------------------------------------------------------------------------------- //
    $.fn[plugName] = function(method) { // Don't touch ;)
        if (methods[method]) return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof method === 'object' || !method) return methods.init.apply(this, arguments);
        else $.error('Method ' + method + ' does not exist on jQuery.' + plugName);
    };

})(jQuery, window, document);


// ----------- FINAL --------------------------------------------------------- //

$(document).ready(function() {
    
    $('#viewport').viewport({tag: 'li'}); // Create viewport
    
    tools.myScrollTo((tools.getPageHeight() / 2), 'iamAMiddleAnchor'); // Scroll to the middle of the page
    
});