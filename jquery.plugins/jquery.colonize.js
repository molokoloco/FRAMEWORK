(function($) {

    // Molokoloco 2013 - Copyleft
    // Live fiddle : http://jsfiddle.net/molokoloco/Ra288/
    // Github : https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonize.js

    $.fn.colonize = function(options) { // Wrapping P between H2
        options = $.extend(true, {}, $.fn.colonize.defaults, typeof options == 'object' &&  options); 
        return this.each(function() {
            var $container     = $(this),
                cWidth         = $container.width(),
                colWidth       = cWidth,
                colHeightRatio = 1,
                intentNextP    = 0,
                lineHeight     = 0;
            
            var $p = $('<p>A</p>').appendTo($container);
            lineHeight = $p.outerHeight();
            $p.remove();
            
            if (options.colWidth) 
                colWidth = options.colWidth;
            else if (options.colCount)
                colWidth = (cWidth - ((options.marge * 2) * options.colCount)) / options.colCount;
            colHeightRatio = cWidth / colWidth;
            
            var colsExtractor = function () { // wrapAll || nextAll // :-(
                
                var $this       = $(this),
                    $next       = $this.next(),
                    $collection = [],
                    jumpNext    = false,
                    totalHeight = 0;
                
                while ($next) {
                    if (!$next.is(options.take)) {
                        if (!$next.is(options.chapters)) jumpNext = true;
                        $next = null; // Break
                    }
                    else {
                        $collection.push($next);
                        $next = $next.next();
                    }
                }
                
                if ($collection.length > 1 || ( $collection.length && $collection[0].outerHeight() > lineHeight) ) {
                    var $wrapper = $(options.wrapper);
                    for (var i = 0, len = $collection.length; i < len; i++) {
                        totalHeight += ($collection[i].height() * colHeightRatio); // Futur P height
                        $wrapper.append($collection[i].detach()); // Extract P
                        if (totalHeight > options.maxHeight) {
                            $wrapper.insertAfter($this);
                            $this = $wrapper;
                            totalHeight = 0;
                            $wrapper = $(options.wrapper);
                        }
                    }
                    $wrapper.insertAfter($this); // Append new COL div container
                    if (jumpNext) $.proxy(colsExtractor, $wrapper.next())();
                }
                else if (jumpNext) {
                    intentNextP++; // Max, trois tags vides après un titre
                    if (intentNextP < 3) $.proxy(colsExtractor, $this.next())();
                }
            };
            
            $container
                .find(options.chapters)
                .each(colsExtractor);
        });
    };
    
    $.fn.colonize.defaults = {
        marge:       10,   // Left/right margin
        colWidth:    null, // As in the CSS, chose between COUNT or WIDTH for cols
        colCount:    null, // colWidth OR colCount
        chapters:    'h1,h2,h3,h4,h5,h6',                   // Between the
        take:        'p',                                   // Take all the
        wrapper:     '<div class="multiplecolumns"/>',      // And wrap them with
        maxHeight:   Math.min(420, $(window).height() / 2)  // Max col height will be...
    };
    
})(window.jQuery);


$('#colonize').click(function() {

    $('#container').colonize({ // Use it...
        marge:      10,
        colWidth:   180, // Report CSS "column-width"
        take:        'p,ul', // Adding UL to the stream...
        wrapper:    '<div class="multiplecolumns"/>'
    });

});

