(function($) {
    
    // jQuery colonize V0.8.1 : In-between titles Multicols paragraphes
    // Molokoloco 2013 - Copyleft
    // Live fiddle : http://jsfiddle.net/molokoloco/Ra288/
    // Github : https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonize.js
    //          https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.colonize.css
    // Infos : http://www.b2bweb.fr/molokoloco/jquery-colonize-plugin-in-between-titles-multicols-paragraphes-with-css3/
    
    $.fn.colonize = function(options) { // Wrapping P between H2
        // Merge user options
        options = $.extend(true, {}, $.fn.colonize.defaults, typeof options == 'object' &&  options);
        
        // Privates vars
        var $container     = null,
            wrapper        = '<div class="'+options.css+'"/>',
            cWidth         = 0,
            colWidth       = 0,
            colHeightRatio = 0,
            intentNextP    = 0,
            lineHeight     = 0;
        
        // private func
        var colsExtractor = function () {
            
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
                var $wrapper = $(wrapper);
                for (var i = 0, len = $collection.length; i < len; i++) {
                    totalHeight += ($collection[i].height() * colHeightRatio); // Futur P height
                    $wrapper.append($collection[i].detach()); // Extract P
                    if (totalHeight >= options.maxHeight) { // Breaking Cols if > screen height
                        $wrapper.insertAfter($this);
                        $this = $wrapper;
                        totalHeight = 0;
                        $wrapper = $(wrapper);
                    }
                }
                $wrapper.insertAfter($this); // Append new COL div container
                if (jumpNext) $.proxy(colsExtractor, $wrapper.next())();
            }
            else if (jumpNext) {
                intentNextP++; // Max, trois tags vides après un titre
                if (intentNextP < 3 && $this.next()) $.proxy(colsExtractor, $this.next())();
            }
        };
        
        // Iterate collections
        return this.each(function() {
            
            $container     = $(this);
            cWidth         = $container.width();
            colWidth       = cWidth;
            colHeightRatio = 1;
            intentNextP    = 0;
            lineHeight     = 0;
            
            var $exists = $container.find(options.css);
            if ($exists.length) { // Existing wrappers ?
                var exists = '';
                $exists.each(function() {
                    var $this = $(this);
                    exists += $this.html();
                    $this.remove(); 
                });
                $container.append(exists);
            }

            var $p = $('<p>A</p>').appendTo($container);
            lineHeight = $p.outerHeight();
            $p.remove();
            
            if (options.colWidth)
                options.colCount = Math.max(1, Math.floor(cWidth / options.colWidth));
            
            colWidth = (cWidth - ((options.marge * 2) * options.colCount)) / options.colCount;
            colHeightRatio = cWidth / colWidth;

            $container
                .find(options.chapters)
                .each(colsExtractor); // wrapAll() || nextAll() // :-(
        });
    };
    
    // Default setup options
    $.fn.colonize.defaults = {
        marge:       10,   // Left/right margin
        colWidth:    null, // As in the CSS, chose between COUNT or WIDTH for cols
        colCount:    null, // colWidth OR colCount
        chapters:    'h1,h2,h3,h4,h5,h6',                    // Between the
        take:        'p',                                    // Take all the
        css:         'multiplecolumns',                      // And wrap them with
        maxHeight:    Math.max(100, $(window).height() - 60) // Max col height will be..
    };
    
})(window.jQuery);

// Usage example...

$('#colonize').click(function() {

    $('#container').colonize({ // Use it...
        marge:      10,
        colWidth:   180, // Report CSS "column-width"
        take:       'p,ul', // Adding UL to the stream...
        css:        'multiplecolumns'
    });

});
