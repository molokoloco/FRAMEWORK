/* =============================================================
 * jQuery colonizr V0.9.2 - Molokoloco 2013 - Copyleft
 * "In-between titles Multicols paragraphes" (Bootstrap-like plugin)
 * Live fiddle : http://jsfiddle.net/molokoloco/Ra288/
 * Github : https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonizr.js
            https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonizr.min.js
 *          https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonizr.css
 *  Infos : http://www.b2bweb.fr/molokoloco/jquery-colonize-plugin-in-between-titles-multicols-paragraphes-with-css3/
 * ============================================================== */
/* =============================================================
 * // Usage example...

    var $container = $('div#container');
    
    $('a#colonize').click(function() {     // Call on click 
        $container.colonizr({              // Use plugin...
            marge:      10,
            colWidth:   180,               // Report CSS "column-width"
            take:       'p,ul',            // Adding UL to the stream...
            css:        'multiplecolumns'  // If you want to change the CSS..
        });
    });
    
    var windowTmr = null; // Timeout...
    var resizeRefreshEvent = function() {   // Trottle resize...
        windowTmr = null;
        if ($container.data('colonizr'))    // Colonizr was applyed by user click ?
            $container.colonizr('refresh'); //  Refresh cols height...
    };
    
    $(window).on('resize', function(event) { // Resize Event
        if (windowTmr) clearTimeout(windowTmr);
        windowTmr = setTimeout(resizeRefreshEvent, 1600); // Trottle resize
    });

* ============================================================== */


!function ($) {

    "use strict"; // jshint ;_;

   /* COLONIZR CLASS DEFINITION
    * ========================== */

    function Colonizr(element, options) {
        // Merge user options
        this.options = $.extend(true, {}, $.fn.colonizr.defaults, typeof options == 'object' && options || {});
        // Privates vars
        this.$container = $(element);
        this.wrapper    = '<div class="'+this.options.css+'"/>';
        this.cWidth, this.intentNextP, this.lineHeight, this.maxHeight;
        this.refresh();
    };

    Colonizr.prototype = {
        
        constructor: Colonizr,
        
        colsExtractor: function (i, e) {
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
            var estimateHeight = 0;
            if ($collection.length) {
                for (var i = 0, len = $collection.length; i < len; i++) {
                    estimateHeight += $collection[i].outerHeight();
                }
            }
            if ($collection.length && estimateHeight > this.lineHeight) {
                var $wrapper = $(this.wrapper);
                for (var i = 0, len = $collection.length; i < len; i++) {
                    totalHeight += $collection[i].outerHeight(); // P height considered nearly the same as futur Col height
                    $wrapper.append($collection[i].detach()); // Extract P
                    if ($collection[(i + 1)] && this.maxHeight <= (totalHeight + $collection[(i + 1)].outerHeight())) { // Cut Cols if > screen height
                        $wrapper.insertAfter($element);
                        $element = $wrapper;
                        totalHeight = 0;
                        $wrapper = $(this.wrapper);
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
            this.lineHeight     = 0;
            this.maxHeight      = this.options.maxHeight;
            var colWidth        = this.cWidth;
            if (this.options.maxHeight < 1)
                this.maxHeight = Math.max(80, $(window).height() - 60); // (Min/) Max cols height ?            
            var $exists = this.$container.find('.'+this.options.css);
            if ($exists.length) { // Existing this.wrappers ?
                var exists = '';
                $exists.each(function() {
                    var $this = $(this);
                    $($this.html()).insertBefore($this);
                    $this.remove(); 
                });
            }
            var $p = $('<p>A</p>').appendTo(this.$container);
            this.lineHeight = $p.outerHeight();
            this.lineHeight = this.lineHeight * this.options.minLine;
            $p.remove();
            if (this.options.colWidth)
                this.options.colCount = Math.max(1, Math.floor(this.cWidth / this.options.colWidth));
            colWidth = (this.cWidth - ((this.options.marge * 2) * this.options.colCount)) / this.options.colCount;
            this.$container
                .find(this.options.chapters)
                .each($.proxy(this.colsExtractor, this)); // $.wrapAll() || $.nextAll() // :-(
        }
    };

   /* COLONIZR PLUGIN DEFINITION
    * =========================== */

    var old = $.fn.colonizr;

    $.fn.colonizr = function (options) {
        return this.each(function() { // Iterate collections
            var $this          = $(this),
                data           = $this.data('colonizr');
            if (!data) $this.data('colonizr', (data = new Colonizr(this, options)));
            if (typeof options == 'string') data[options]();
        });
    };

    $.fn.colonizr.Constructor = Colonizr;

    $.fn.colonizr.defaults = {
        marge:       10,                   // Left/right <p> margin
        colWidth:    null,                 // As in the CSS, choose between COUNT or WIDTH for cols
        colCount:    2,                    // colWidth (px) OR colCount (num)
        chapters:    'h1,h2,h3,h4,h5,h6',  // Between the H1-Hx ()
        take:        'p',                  // Take all the p (ul,quote,..) NEXT() to each chapters
        css:         'multiplecolumns',    // And wrap them with class
        minLine:      2,                   // If less than 3 lines, don't wrap with columns
        maxHeight:    null                 // Max col height will be..
    };

   /* COLONIZR NO CONFLICT
    * ===================== */

    $.fn.colonizr.noConflict = function () {
        $.fn.colonizr = old;
        return this;
    };

   /* COLONIZR DATA-API
    * ================== */

    $(window).on('load', function () {
        $('[data-colonizr="true"]').each(function () {
            var $spy = $(this);
            $spy.colonizr($spy.data());
        })
    });

}(window.jQuery);
