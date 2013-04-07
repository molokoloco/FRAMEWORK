// Workable / Testable jQuery Default Plugin Boilerplate
// --> http://docs.jquery.com/Plugins/Authoring
// --> http://jsfiddle.net/molokoloco/DzYdE/
// ...comments or suggests ? http://www.b2bweb.fr/molokoloco/jquery-default-plugin/
/*
    Sources code examples (jQuery Plugins Patterns Boilerplates)… :
    
    https://github.com/jquery-boilerplate/patterns/tree/master/patterns
    http://addyosmani.com/resources/essentialjsdesignpatterns/book/#designpatternsjquery
    http://coding.smashingmagazine.com/2011/10/11/essential-jquery-plugin-patterns/
    http://kenneth.kufluk.com/blog/2010/08/chaining-asynchronous-methods-in-jquery-using-the-queue/  
*/

(function($) {
    
    var plugName = 'tooltip'; // Our plugin base name
    
    var methods = { // Public plugin méthods
        
        init: function(options) {   
            
            options = $.extend({           // Default options
                debug:  false,             // Trace methods calls ?
                parent: 'body',            // Default tooltip appendTo
                class:  null               // Tooltip DIV element class
            }, $.fn[plugName].options || {}, options); // $.tooltip.options can serve to override
            
            return this.each(function() { // Iterate current(s) element(s)
                
                var $this = $(this), // Supposed to be a link or something with a title attribute !
                    data  = $this.data(plugName);
                if (data) return; // If the plugin has already been initialized ?
                
                var title = $this.attr('title'); // Fetch tooltip text...
                if (!title) return; // Nothing to print ?
                
                var $element = $('<div />', { // Create Tooltip Div
                        class: options.class,
                        text:  title
                    }).appendTo(options.parent).hide();
                
                if (!options.class) { // Minimum style for a tooltip ?
                    $element.css({
                        background: 'rgba(0,0,0,.5)',
                        position: 'absolute'
                    });
                }
                
                var data = {}; // Create a stock for properties
                data[plugName]  = $element; // Stock TOOLTIP $ELEMENT... in current link data !!!
                data['options'] = options;  // Stock individual plugin options
                
                $this
                    .data(plugName, data) //  Stock all properties... in current element
                    .attr('title', '')    // Remove default title
                    .on('mouseenter.'+plugName, methods.show) // Event + this plugin NameSpace
                    .on('mouseleave.'+plugName, methods.hide);
                
                if (data['options'].debug) console.log('init() data', $this.data(plugName)); // Time to Log in console ;)
            });
        },
        update: function(content) {
            var $this = $(this), // Only one link trigger show()
                data  = $this.data(plugName); // Fetch data relative to our element
            data[plugName].html(content);
            if (data['options'].debug) console.log('update', content);
        },
        reposition: function(event) {
            var mousex = event.pageX + 20, // Get event X mouse coordinates
                mousey = event.pageY + 20;
            $(this).data(plugName)[plugName].css({top: mousey+'px', left: mousex+'px'});
        },
        show: function(event) {
            var $this  = $(this), // Current link
                data   = $this.data(plugName); // Current tooltip data
            data[plugName].stop(true, true).fadeIn(600);
            $this.on('mousemove.'+plugName, methods.reposition);
            if (data['options'].debug) console.log('show');
        },
        hide: function(event) {
            var $this = $(this), // Current link
                data  = $this.data(plugName); // Current tooltip data
            $this.off('mousemove.'+plugName, methods.reposition);
            data[plugName].stop(true, true).fadeOut(400);
            if (data['options'].debug) console.log('hide');
        },
        destroy: function() {
            return this.each(function() {
                var $this = $(this),
                    data  = $this.data(plugName);
                if (!data) return; // Nothing here
                $this
                    .attr('title', data[plugName].text())
                    .off('.'+plugName) // Remove this tooltip event(s) using namespace
                    .removeData(plugName); // Clear DOM data
                if (data['options'].debug) console.log('destroy');
                data[plugName].remove(); // Clear tooltip element
            });
        }
    };
    
    $.fn[plugName] = function(method) { // Don't touch ;)
        if (methods[method]) return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof method === 'object' || !method) return methods.init.apply(this, arguments);
        else $.error('Method ' + method + ' does not exist on jQuery.'+plugName);
    };
    
})(jQuery);

///////////////////////////////////////////////////////////////////////////
//                           Exemples d'usage                            //
///////////////////////////////////////////////////////////////////////////

$(function() {

    // Appel du plugin
    $('a.tooltip').tooltip({ // Init with optional obj of optionals args
        debug: true,
        class: 'myTooltipElement' // Custom CSS for the tooltip element
    });
    
    // Call internal method
    $('a.tooltip').on('click', function() {
        console.log('update');
        $(this).tooltip('update', 'This is the new tooltip content! '+ Math.random()); // update tooltip ?
    });
    
    // Clear
    $('a#remove').on('click', function() {
        $('a#link2').tooltip('destroy');
    });

});
