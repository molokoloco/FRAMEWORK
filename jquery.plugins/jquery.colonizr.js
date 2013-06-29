/* =============================================================
 *
 * jQuery colonizr V0.9.5 - Molokoloco 2013 - Copyleft
 * "In-between titles Multicols paragraphes" (Bootstrap-like plugin)
 *
 * Blog post : http://www.b2bweb.fr/molokoloco/jquery-colonize-plugin-in-between-titles-multicols-paragraphes-with-css3/
 * Live fiddle demo : http://jsfiddle.net/molokoloco/Ra288/
 * Github :
 *   - https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonizr.js
 *   - https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonizr.min.js
 *   - https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonizr.css
 *
 * ============================================================== */
 
/* =============================================================

    // Usage example... (+ 10 000 chars will be very long to process)

    var $container = $('div#container');
    
    $('a#colonize').click(function() {     // Call on click 
        $container.colonizr({              // Use plugin...
            chapters:   'h2,h3',
            take:       'p,ul,quote',      // Adding UL and quote to the stream...
            css:        'multiplecolumns'  // If you want to change the CSS..
        });
    });
    
    var windowTmr = null; // Timeout...
    var resizeRefreshEvent = function() {   // Trottle resize...
        windowTmr = null;
        if ($container.data('colonizr'))    // colonizr was applyed by user click ?
            $container.colonizr('refresh'); //  Refresh cols height...
    };
    
    $(window).on('resize', function(event) { // Resize Event
        if (windowTmr) clearTimeout(windowTmr);
        windowTmr = setTimeout(resizeRefreshEvent, 1600); // Trottle resize
    });

* ============================================================== */


!function ($) {

    "use strict"; // jshint ;_;

   /* colonizr CLASS DEFINITION
    * ========================== */

    function colonizr(element, options) {
        // Merge user options
        this.options = $.extend(true, {}, $.fn.colonizr.defaults, typeof options == 'object' && options || {});
        // Privates vars
        this.$container = $(element);
        this.wrapper = '<div class="'+this.options.css+'"/>';
        this.cWidth, this.intentNextP, this.lineMinHeight, this.maxHeight, this.estimateHeight;
        this.refresh();
    };

    colonizr.prototype = {
        
        constructor: colonizr,
        
        colsExtractor: function (i, e) {  // Cannot be done with $.wrapAll() || $.nextAll() // :-(
            var $element    = $(e),
                $next       = $element.next(),
                $collection = [],
                jumpNext    = false,
                totalHeight = 0;
            while ($next) {
                if (!$next.is(this.options.take)) {
                    if (!$next.is(this.options.chapters)) jumpNext = true;
                    $next = null; // Break
                }
                else {
                    $collection.push($next);
                    $next = $next.next();
                }
            }
            this.estimateHeight = 0;
            if ($collection.length) {
                for (var j = 0, len = $collection.length; j < len; j++) {
                    this.estimateHeight += $collection[j].outerHeight(); // Work better if "p" margin (2) == ".multiplecolumns p" margin (2*cols)
                }
            }
            if ($collection.length && this.estimateHeight > this.lineMinHeight) {
                var $wrapper = $(this.wrapper);
                for (var j = 0, len = $collection.length; j < len; j++) {
                    if (!(totalHeight == 0 && $collection[j].html() == '&nbsp;')) { // first col element empty <p> ?
                        totalHeight += $collection[j].outerHeight(); // P height considered nearly the same as futur Col height
                        $wrapper.append($collection[j].detach()); // Extract P
                        if ($collection[(j + 1)] && this.maxHeight <= (totalHeight + $collection[(j + 1)].outerHeight())) { // Cut Cols if > screen height
                            $wrapper.insertAfter($element);
                            $element = $wrapper;
                            totalHeight = 0;
                            $wrapper = $(this.wrapper);
                        }
                    }
                }
                $wrapper.insertAfter($element); // Append new COL div container
                if (jumpNext) this.colsExtractor(0, $wrapper.next());
            }
            else if (jumpNext) {
                this.intentNextP++; // Max, trois tags vides après un titre
                if (this.intentNextP < 3 && $element.next()) this.colsExtractor(0, $element.next());
            }
        },
        
        refresh: function () {
            this.cWidth         = this.$container.width();
            this.intentNextP    = 0;
            this.lineMinHeight  = 0;
            this.maxHeight      = this.options.maxHeight;
            
            if (this.options.maxHeight < 1)
                this.maxHeight = Math.max(80, $(window).height() * 0.8); // (Min/) Max cols height ?
            
            var $p = $('<p>A</p>').appendTo(this.$container);
            this.lineMinHeight = $p.outerHeight() * this.options.minLine;
            $p.remove();

            var $exists = this.$container.find('.'+this.options.css);
            if ($exists.length) { // Existing this.wrappers ?
                var exists = '',
                    $prev  = this.$container.prev();
                this.$container.detach(); // Detach DOM
                $exists.each(function() {
                    var $this = $(this);
                    $($this.html()).insertBefore($this);
                    $this.remove(); 
                });
                this.$container.insertAfter($prev);
            }
            
            var that = this;
            this.$container // We cannot .detach() the container before operating because we need the height of some elements inside
                .find(this.options.chapters)
                    //.each($.proxy(this.colsExtractor, this));
                    .each(function(i, e) {
                        setTimeout($.proxy(that.colsExtractor, that), 0, i, e); // Deferred for the so long #GuezNet page !
                    });
        }
    };

   /* colonizr PLUGIN DEFINITION
    * =========================== */

    var old = $.fn.colonizr;

    $.fn.colonizr = function (options) {
        return this.each(function() { // Iterate collections
            var $this          = $(this),
                data           = $this.data('colonizr');
            if (!data) $this.data('colonizr', (data = new colonizr(this, options)));
            if (typeof options == 'string') data[options]();
        });
    };

    $.fn.colonizr.Constructor = colonizr;

    $.fn.colonizr.defaults = {
        chapters:    'h1,h2,h3,h4,h5,h6',  // Between the H1-Hx ()
        take:        'p',                  // Take all the p (ul,quote,..) NEXT() to each chapters
        css:         'multiplecolumns',    // And wrap them with class
        minLine:      2,                   // If less than 3 lines, don't wrap with columns
        maxHeight:    null                 // Max col height will be..
    };

   /* colonizr NO CONFLICT
    * ===================== */

    $.fn.colonizr.noConflict = function () {
        $.fn.colonizr = old;
        return this;
    };

   /* colonizr DATA-API
    * ================== */

    $(window).on('load', function () {
        $('[data-colonizr="true"]').each(function () {
            var $spy = $(this);
            $spy.colonizr($spy.data());
        })
    });

}(window.jQuery);