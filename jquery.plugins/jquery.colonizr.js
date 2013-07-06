/* =============================================================
 *
 * jQuery colonizr V0.9.7 - Molokoloco 2013 - Copyleft
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

    function Colonizr(element, options) {
        this.options    = $.extend(true, {}, $.fn.colonizr.defaults, typeof options == 'object' && options || {}); // Merge user options
        this.$container = $(element);
        this.wrapper    = '<div class="'+this.options.css+'"/>';
        this.cWidth, this.intentNextP, this.lineMinHeight, this.maxHeight, this.chaptersTotal;
        this.refresh();
    }

    Colonizr.prototype = {

        constructor: Colonizr,

        colsExtractor: function (i, $element) {  // Cannot be done with $.wrapAll() || $.nextAll() // :-(

            var $next          = $element.next(),
                $collection    = [],
                jumpNext       = false,
                totalHeight    = 0,
                estimateHeight = 0;

            while ($next) {
                if ($next.is(this.options.chapters)) {
                    $next = null; // Break
                }
                else if ($next.is(this.options.take)) {
                    $collection.push($next);
                    $next = $next.next();
                }
                else {
                    if ($next.length) $element = $next; // Move inserting after skipped elements...
                    $next = $next.next();
                    if ($next.length) jumpNext = true; // Continue wrapping ?
                    $next = null; // break
                }
            }

            if ($collection.length) {
                for (var j = 0, len = $collection.length; j < len; j++) {
                    estimateHeight += $collection[j].data('h'); // Work fine if "p" margin (2) == ".multiplecolumns > p" margin (2 * nb cols)
                }
            }

            if ($collection.length && estimateHeight > this.lineMinHeight) {
                var $wrapper = $(this.wrapper);
                for (var j = 0, len = $collection.length; j < len; j++) {
                    if (totalHeight < 1 && $collection[j].html() == '&nbsp;') continue; // first col element empty <p> ?
                    totalHeight += $collection[j].data('h'); // P height considered nearly the same as futur Col height
                    $wrapper.append($collection[j].detach()); // Extract P
                    if ($collection[(j + 1)] && this.maxHeight <= (totalHeight + $collection[(j + 1)].outerHeight())) { // Cut Cols if > screen height
                        $wrapper.insertAfter($element);
                        $element    = $wrapper;
                        totalHeight = 0;
                        $wrapper    = $(this.wrapper);
                    }
                }
                $wrapper.insertAfter($element); // Append new COL div container
            }
            if (jumpNext) {
                this.colsExtractor(i, $element.next());
            }
            else if ((i+1) == this.chaptersTotal) {
                this.$container.trigger('finish'); //.colonizr
            }
        },

        cleanColumns: function() {
            var $exists = this.$container.find('.'+this.options.css);
            if (!$exists.length) return;
            // Existing this.wrappers ?
            var $parent = that.$container.parent(),
                $prev   = this.$container.prev();
            this.$container.detach(); // Detach DOM
            $exists.each(function() {
                var $this = $(this);
                $($this.html()).insertBefore($this);
                $this.remove();
            });
            if ($prev.length) this.$container.insertAfter($prev);
            else this.$container.appendTo($parent);
        },

        refresh: function () {

            this.cleanColumns();

            var that      = this,
                $chapters = that.$container.find(that.options.chapters),
                $parent   = that.$container.parent(),
                $prev     = that.$container.prev();

            that.chaptersTotal = $chapters.length;
            that.cWidth        = that.$container.width();
            that.maxHeight     = that.options.maxHeight;
            that.intentNextP   = 0;
            that.lineMinHeight = 0;

            if (that.options.maxHeight < 1)
                that.maxHeight = Math.max(80, $(window).height() * 0.8); // (Min/) Max cols height ?

            var $p = $('<p>A</p>').appendTo(that.$container);
            that.lineMinHeight = $p.outerHeight() * that.options.minLine;
            $p.remove();

            that.$container.on('finish', function() {
                if ($prev.length) that.$container.insertAfter($prev);
                else that.$container.appendTo($parent);
            });

            $chapters  //  We cannot detach the container before operating because we need the height of some elements inside
                .each(function(i, e) {
                    var $next = $(e).next();
                    while ($next.length) {
                        if ($next.is(that.options.chapters)) {
                            $next = []; // Break
                        }
                        else  {
                            if ($next.length && $next.is(that.options.take)) $next.data('h', $next.outerHeight());
                            if ($next.length) $next = $next.next();
                        }
                    }
                });

            that.$container = that.$container.detach(); // Big optim for big page ;)

            $chapters.each(function(i, e) {
                //setTimeout($.proxy(that.colsExtractor, that), 0, i, $(e)); // Deferred for the so long #GuezNet page !
                //window.requestAnimationFrame(that.colsExtractor.bind(that, i, $(e)));
                that.colsExtractor(i, $(e));
            });

        }
    };

   /* colonizr PLUGIN DEFINITION
    * =========================== */

    var old = $.fn.colonizr;

    $.fn.colonizr = function (options) {
        return this.each(function() { // Iterate collections
            var $this = $(this),
                data  = $this.data('colonizr');
            if (!data) $this.data('colonizr', (data = new Colonizr(this, options)));
            if (typeof options == 'string') data[options]();
        });
    };

    $.fn.colonizr.Constructor = Colonizr;

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
        });
    });

}(window.jQuery)