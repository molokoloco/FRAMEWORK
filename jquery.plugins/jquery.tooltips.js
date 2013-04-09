// Workable / Testable jQuery Default Plugin Boilerplate
// --> http://docs.jquery.com/Plugins/Authoring
// --> http://jsfiddle.net/molokoloco/DzYdE/
// --> https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.tooltips.js
// --> Comments or suggests ? http://www.b2bweb.fr/molokoloco/jquery-default-plugin/
/*
    Sources code examples (jQuery Plugins Patterns Boilerplates)… :
    
    https://github.com/jquery-boilerplate/patterns/tree/master/patterns
    http://addyosmani.com/resources/essentialjsdesignpatterns/book/#designpatternsjquery
    http://coding.smashingmagazine.com/2011/10/11/essential-jquery-plugin-patterns/
    http://kenneth.kufluk.com/blog/2010/08/chaining-asynchronous-methods-in-jquery-using-the-queue/  
*/

(function($) { // Plugin inside a closure to keep NameSpace safe
    
    var plugName = 'tooltip'; // Our plugin base name !
    
    var privatesMethods = { // Private plugin methods
        reposition: function(event) {
            var mousex = event.pageX + 20, // Get event X mouse coordinates
                mousey = event.pageY + 20;
            $(this).data(plugName)['tooltip'].css({top: mousey+'px', left: mousex+'px'});
        },
        show: function(event) {
            var $this  = $(this), // Current link
                data   = $this.data(plugName); // Current tooltip data
            data['tooltip'].stop(true, true).fadeIn(600);
            $this.on('mousemove.'+plugName, privatesMethods.reposition);
            if (data['options'].debug) console.log('show');
        },
        hide: function(event) {
            var $this = $(this), // Current link
                data  = $this.data(plugName); // Current tooltip data
            $this.off('mousemove.'+plugName, privatesMethods.reposition);
            data['tooltip'].stop(true, true).fadeOut(400);
            if (data['options'].debug) console.log('hide');
        }
    };
    
    var publicMethods = { // Public plugin methods
        
        init: function(options) {   
            
            var that = this;
            
            // Merge custom options with defaults optiosn
            options = $.extend(true, $.fn[plugName].defaults, typeof options == 'object' && options); 
            
            return this.each(function() { // Iterate current(s) element(s) collection
                
                var $this = $(this), // Supposed to be a link or something with a title attribute !
                    data  = $this.data(plugName);
                if (data) return; // If the plugin has already been initialized ?
                
                var title    = $this.attr('title'), // Fetch tooltip static content...
                    titleUrl = $this.data('title'); // Fetch tooltip content url...
                if (!title && !titleUrl) return;    // Nothing to print ?
                
    			if (titleUrl) { // Do some Ajax request to fetch tooltip content ?
                    // http://api.jquery.com/jQuery.ajax/
                    // http://api.jquery.com/jQuery.proxy/
                    $.ajax({
                        dataType:'jsonp',
                        url: titleUrl,
                        context: $this, // Keep the actual context in the success callback
                        success: function(data) {
                            if (data && data.key1) {
                                $.proxy(publicMethods.update, this)(data.key1);
                                // publicMethods.update.apply(this, [data.key1]);
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) { 
                            console.log('JSON error', textStatus, errorThrown);
                        }
                  });
                }
				
                var $element = $('<div />', { // Create Tooltip Div
                        class: options.class,
                        text:  title
                    }).appendTo('body').hide();

                if (!options.class) { // Minimum style for a tooltip ?
                    $element.css({
                        background: 'rgba(0,0,0,.5)',
                        position: 'absolute'
                    });
                }
                
                var data = {}; // Create a stock for properties
                data['tooltip'] = $element; // Stock TOOLTIP $ELEMENT... in current link data !!!
                data['options'] = options;  // Stock individual plugin options

                $this
                    .data(plugName, data) //  Stock all properties... in current element
                    .attr('title', '')    // Remove default title
                    .on('mouseenter.'+plugName, privatesMethods.show) // Event + this plugin NameSpace
                    .on('mouseleave.'+plugName, privatesMethods.hide);
                
                // HOW TO KEEP THE CURRENT ELEMENT CONTEXT ?
                // Plugin tooltip "options" config is accessible via
                // $(this).data(plugName)['options'] //> $(this) == current link
				
                // Newly created "tooltip elements" are accessible via
                // $(this).data(plugName)['tooltip']
                // Exemple : $(this).data(plugName)['tooltip'].html('New tooltip title');
                
                if (data['options'].debug) // Time to Log in console ;)
                    console.log('init() data', $this.data(plugName));
            });
        },
        update: function(content) { // Update tooltip content
            return this.each(function() {
                var $this = $(this), // One link
                    data  = $this.data(plugName); // Fetch data relative to our element
                data['tooltip'].html(content);
                if (data['options'].debug) console.log('update', content);
            });
        },
        destroy: function() { // Remove plugin
            return this.each(function() {
                var $this = $(this),
                    data  = $this.data(plugName);
                if (!data) return; // Nothing here
                $this
                    .attr('title', data['tooltip'].text())
                    .off('.'+plugName) // Remove this tooltip event(s) using namespace
                    .removeData(plugName); // Clear DOM data
                if (data['options'].debug) console.log('destroy');
                data['tooltip'].remove(); // Clear tooltip element
            });
        }
    };

    $.fn[plugName] = function(method) { // Don't touch ;)
        if (publicMethods[method]) return publicMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof method === 'object' || !method) return publicMethods.init.apply(this, arguments);
        else $.error('Method ' + method + ' does not exist on jQuery.'+plugName);
    };
    
     $.fn[plugName].defaults = {   // Default overridables options
        debug:  false,             // Trace methods calls ?
        class:  null               // Tooltip DIV element class
    };
    
})(window.jQuery);

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
        $(this).tooltip('update', 'This is the new tooltip content! '+ Math.random()); // update tooltip ?
    });
    
    // Clear
    $('a#remove').on('click', function() {
        $('a#link2')
            .tooltip('destroy') // Remove Tooltip plugin
            .off('click');      // Remove our custom listener below
    });

});
