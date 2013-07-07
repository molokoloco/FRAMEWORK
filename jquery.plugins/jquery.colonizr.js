/* =============================================================
 *
 * jQuery colonizr V0.9.9 - Molokoloco 2013 - Copyleft
 * "In-between titles Multicols paragraphes" (Bootstrap-like plugin)
 *
 * jsFiddle demo : http://jsfiddle.net/molokoloco/FK7xr/
 * Real life demo : http://www.b2bweb.fr/gueznet/27062013-gueznet-prism-javascript-networks-politics-350-links/
 * Blog post : http://www.b2bweb.fr/molokoloco/jquery-colonize-plugin-in-between-titles-multicols-paragraphes-with-css3/
 *
 * Github :
 *   - https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonizr.js
 *   - https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonizr.min.js
 *   - https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonizr.css
 *
 * ============================================================== */

/* =============================================================

    // Usage example... (+ 10 000 chars will be long to process)

    var $container = $('div#container'); // Main box

    $('a#colonize').one('click', function() {     // Call on click
        
        $container.on('colonizrFinish', function() {
            console.log('colonizr complete');
        });

        $container.colonizr({
            chapters:   'h2,h3',           // The chapters will not be wrapped inside cols
            take:       'p,ul,quote',      // In--between chapters tags we take, adding UL and quote to the stream...
            css:        'multiplecolumns'  // If you want to change the CSS..
        });
    });

    var windowTmr = null; // Timeout...
    var resizewrapAllEvent = function() {   // Trottle resize...
        windowTmr = null;
        if ($container.data('colonizr'))    // colonizr was applyed by user click ?
            $container.colonizr('wrapAll'); //  wrapAll cols height...
    };

    $(window).on('resize', function(event) { // Resize Event
        if (windowTmr) clearTimeout(windowTmr);
        windowTmr = setTimeout(resizewrapAllEvent, 1500); // Trottle resize
    });

* ============================================================== */

(function ($) {

    "use strict"; // jshint ;_;

   /* colonizr CLASS DEFINITION
    * ========================== */

    function Colonizr(element, options) {
        this.options    = $.extend(true, {}, $.fn.colonizr.defaults, typeof options == 'object' && options || {}); // Merge user options
        this.$container = $(element);
        this.wrapper    = '<div class="'+this.options.css+'"/>';
        this.cWidth, this.intentNextP, this.lineMinHeight, this.maxHeight, this.chaptersTotal;
        this.wrapAll();
    }

    Colonizr.prototype = {

        constructor: Colonizr,

        wrapCleaner: function() {
            var $exists = this.$container.find('.'+this.options.css);
            if (!$exists.length) return;
            // Existing this.wrappers ?
            var $parent = this.$container.parent(),
                $prev   = this.$container.prev();
            this.$container.detach(); // Detach DOM
            $exists.each(function() { // Unwrapping cols
                var $this = $(this);
                $($this.html()).insertBefore($this);
                $this.remove();
            });
            if ($prev.length) this.$container.insertAfter($prev);
            else this.$container.appendTo($parent);
        },

        wrapBrothers: function (i, $element) {  // Cannot be done with $.wrapAll() || $.nextAll() // :-(

            var $next          = $element.next(),
                $collection    = [],
                jumpNext       = false,
                totalHeight    = 0,
                estimateHeight = 0;

             while ($next.length) { // Iterate next sibling
                if ($next.is(this.options.take)) {
                    estimateHeight += $next.data('h'); // Work fine if "p" margin (2) == ".multiplecolumns > p" margin (2 * nb cols)
                    $collection.push($next);
                    $next = $next.next();
                }
                else if ($next.is(this.options.chapters)) {
                    break;
                }
                else {
                    jumpNext = true; // Continue wrapping ?
                    var $jump = $next.next();
                    if ($jump.length && !$jump.is(this.options.take) && $jump.is(this.options.chapters)) {
                        $element = $next; // Skip some tag ?
                        $next = $jump;
                    }
                    break;
                }
            }

            if ($collection.length && estimateHeight > this.lineMinHeight) { // WRAP ?
                var $wrapper = $(this.wrapper);
                for (var j = 0, len = $collection.length; j < len; j++) {
                    if (totalHeight < 1 && ($collection[j].html() == '&nbsp;' || $collection[j].is('br'))) {
                        $collection[j].detach(); // strip empty elements starting inside col
                        continue;
                    }
                    totalHeight += $collection[j].data('h'); // P height considered nearly the same as futur Col height
                    $wrapper.append($collection[j].detach()); // Extract P
                    // Cut Cols if > screen height
                    if ($collection[(j + 1)] && (totalHeight + $collection[(j + 1)].data('h'))  >= this.maxHeight) {
                        $wrapper.insertAfter($element);
                        $element    = $wrapper;
                        totalHeight = 0;
                        $wrapper    = $(this.wrapper);
                    }
                }
                $wrapper.insertAfter($element); // Append new COL div container
            }

            if (jumpNext) { 
                this.wrapBrothers(i, $next);
            }
            else if ((i+1) == this.chaptersTotal) {
                this.$container.trigger('wrapBrothersFinish');
            }
        },

        wrapAll: function () {

            this.wrapCleaner();

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

            that.$container.on('wrapBrothersFinish', function() {
                // Re-attach container...
                if ($prev.length) that.$container.insertAfter($prev);
                else that.$container.appendTo($parent);
                that.$container.trigger('colonizrFinish'); // If somebody outside listen our asynchronous finish
            });

            $chapters // Before detaching the container to operate, we need the height of some elements inside
                .each(function(i, e) {
                    var $next = $(e).next();
                    while ($next.length) {
                        if ($next.is(that.options.chapters)) {
                            $next = []; // Break
                        }
                        else  {
                            if ($next.length && $next.is(that.options.take)) $next.data('h', $next.outerHeight()); // Stock each height
                            if ($next.length) $next = $next.next();
                        }
                    }
                });

            // Big optim for big page ;)
            that.$container = that.$container.detach(); 

            $chapters.each(function(i, e) { // Let's go recursive
                //setTimeout($.proxy(that.wrapBrothers, that), 0, i, $(e)); // Deferred for the so long #GuezNet page !
                //window.requestAnimationFrame(that.wrapBrothers.bind(that, i, $(e)));
                that.wrapBrothers(i, $(e));
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
        take:        'p,br',               // Take all the p (ul,quote,..) NEXT() to each chapters
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

})(window.jQuery);