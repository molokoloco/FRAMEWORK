/*
    Workable / Testable jQuery Default Plugin Boilerplate
        Doc : http://docs.jquery.com/Plugins/Authoring
        Edit : http://jsfiddle.net/molokoloco/DzYdE/
        Download : https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.tooltips.js
        Comments or suggests : http://www.b2bweb.fr/molokoloco/jquery-default-plugin/
    
    Sources code examples (jQuery Plugins Patterns Boilerplates)… :
        https://github.com/jquery-boilerplate/patterns/tree/master/patterns
        http://addyosmani.com/resources/essentialjsdesignpatterns/book/#designpatternsjquery
        http://coding.smashingmagazine.com/2011/10/11/essential-jquery-plugin-patterns/
        http://kenneth.kufluk.com/blog/2010/08/chaining-asynchronous-methods-in-jquery-using-the-queue/  
*/


///////////////////////////////////////////////////////////////////////////
//      Fichier à enregistrer sous le nom "jquery.tooltip.js"            //
///////////////////////////////////////////////////////////////////////////


(function($) { // our plugin is inside a closure, it keep the NameSpace safe
    
    var plugName = 'tooltip'; // Our plugin base name !
        debug    = true;      // Edit here to debug ;)
    
    var privatesMethods = {   // Privates plugin methods
        
        reposition: function(event) { // Move tooltip
            var mousex = event.pageX + 20, // Get event X mouse coordinates
                mousey = event.pageY + 20;
            
            $(this).data(plugName)['tooltip'].css({top: mousey+'px', left: mousex+'px'});
        },
        
        show: function(event) {
            if (debug) console.log(plugName+'.show()');
            var $this  = $(this), // Current link
                data   = $this.data(plugName); // Current tooltip data
            
             if (data['titleUrl'] && !data['titleAjax']) // Do the Ajax request to fetch tooltip content ?
                privatesMethods.fetch(data['titleUrl'], $this);
            
            data['tooltip'].stop(true, true).fadeIn(600); // Start animation
            $this.on('mousemove.'+plugName, privatesMethods.reposition); // Listen mousemove, updating tooltip position
        },
        
        hide: function(event) {
            if (debug) console.log(plugName+'.hide()');
            var $this = $(this), // Current link
                data  = $this.data(plugName); // Current tooltip data
            
            $this.off('mousemove.'+plugName, privatesMethods.reposition);
            data['tooltip'].stop(true, true).fadeOut(400); // End animation
        },
        
		fetch: function(url, $element) {
            if (debug) console.log(plugName+'.fetch()');
            $.ajax({ // http://api.jquery.com/jQuery.ajax/
                dataType:'jsonp',
                url: url,
                context: $element, // Keep the actual context in the success callback
                success: function(jsonData) { // Ex. : {key1: "Plein de données utiles"}
                    if (debug) console.log(plugName+'.fetch() success(jsonData)', jsonData);
                    if (!jsonData || !jsonData.key1) return; // jsonData is an arbitrary result
                    $(this).data(plugName)['titleAjax'] = jsonData.key1; // For later use...
                    $.proxy(publicMethods.update, this)(jsonData.key1); // Keep the context (this == $element)
                    // http://api.jquery.com/jQuery.proxy/
                    // == publicMethods.update.apply(this, [data.key1]);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) { 
                    console.log('JSON error', textStatus, errorThrown);
                }
            });
		}
        
    }; // End Privates plugin methods
    
    var publicMethods = { // Publics plugin methods
        
        init: function(options) {   
            if (debug) console.log(plugName+'.init()');  // Time to Log in console ;)
            
            // Merge custom options with defaults options
            options = $.extend(
                true,                                  // Deep merge object
                {},                                    // Merge in a new object
                $.fn[plugName].defaults,               // Minimal default options
                typeof options == 'object' &&  options // User override ?
           ); 
            
            return this.each(function() { // Iterate current(s) element(s) collection
                
                var $this = $(this), // Supposed to be a link or something with a title attribute !
                    data  = $this.data(plugName);
                if (data) return; // If the plugin has already been initialized for this element ?
                
                var title    = $this.attr('title'), // Fetch tooltip static content...
                    titleUrl = $this.data('url'); // Fetch tooltip content url...
                if (!title && !titleUrl) return;    // Nothing to print ?
                
                var $tooltip = $('<div />', { // Create Tooltip Div
                        class: options.class,
                        text:  title
                    }).appendTo('body').hide(); // Append it to the body...

                var data = { // Create a data stock per element
                    tooltip:   $tooltip, // Stock current tooltip $ELEMENT...
                    options:   options,  // Stock individual plugin options (if needed)
                    title:     title,    // Original title
                    titleUrl:  titleUrl, // Optional content url
                    titleAjax: null      // Optional content url result
                };

                $this
                    .data(plugName, data) //  Stock all properties... in current element
                    .attr('title', '')    // Remove default title
                    .on('mouseenter.'+plugName, privatesMethods.show) // Event + this plugin NameSpace
                    .on('mouseleave.'+plugName, privatesMethods.hide);
                
                // HOW TO KEEP THE CURRENT ELEMENT CONTEXT ?
                // Newly created "tooltip elements" are accessible via
                // $(this).data(plugName)['tooltip']
                // Si on est dans le context d'une méthode ou $(this) == current link
                // Exemple : $(this).data(plugName)['tooltip'].html('New tooltip title');
                
            }); // End Iterate collection
        },
        
        update: function(content) { // Update tooltip content
            if (debug) console.log(plugName+'.update(content)', content);
            
            return this.each(function() {
                var $this = $(this), // One link
                    data  = $this.data(plugName); // Fetch data relative to our element
                if (!data) return; // Nothing here
                
                data['tooltip'].html(content);
            });
        },
        
        destroy: function() { // Remove plugin
            if (debug) console.log(plugName+'.destroy()');
            
            return this.each(function() {
                var $this = $(this),
                    data  = $this.data(plugName);
                if (!data) return; // Nothing here
                
                $this
                    .attr('title', data['title'])
                    .off('.'+plugName)     // Remove this tooltip event(s) using .namespace
                    .removeData(plugName); // Clear data
                
                data['tooltip'].remove();  // Clear tooltip element
            });
        }
        
    }; // End Publics plugin methods

    // Here we map our plugin publics methods to jQuery : $.fn.tooltip = function()...
    
    $.fn[plugName] = function(method) {
        if (publicMethods[method]) return publicMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof method === 'object' || !method) return publicMethods.init.apply(this, arguments);
        else $.error('Method '+method+' does not exist on jQuery.'+plugName+'.js');
    };
    
    // Default (overridables) public options
    
    $.fn[plugName].defaults = {    
        class:  plugName+'Element'  // Tooltips have a defaut class of "tooltipElement"
    };
    
})(window.jQuery);


///////////////////////////////////////////////////////////////////////////
//                           Usage examples                              //
///////////////////////////////////////////////////////////////////////////

/*
    <a href="#" id="link1" class="tooltips" title="It's a test">Tooltip 1</a> !<br />
    <a href="#" id="link2" class="tooltips" data-url="./api.php?id=link2">Tooltip 2</a>
*/

$(function() {
    
    // Appel du plugin sur les liens avec la class "tooltips"
    $('a.tooltips').tooltip({ // Call plug in on our collection with optional obj of optionals args
        class: 'myTooltipElement' // Ex. : user custom CSS for the tooltip element
    });
    
    $('a.tooltip').on('click', function() {
        // Call internal method
        $(this).tooltip('update', 'This is the new tooltip content! '+ Math.random()); // update tooltip ?
    });

    $('a#remove').on('click', function() {
        $('a#link2')
            .tooltip('destroy') // Remove Tooltip plugin !
            .off('click');      // Remove our custom listener below
    });

});
