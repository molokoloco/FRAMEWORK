/*

    Workable / Testable jQuery Default Plugin Boilerplate
    V1.5 - 12/07/13 - Molokoloco - Copyleft

        Demo : http://jsfiddle.net/molokoloco/E3DbT/
        Download : https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.tooltips.js
        Blog : http://www.b2bweb.fr/molokoloco/jquery-default-plugin/

    Sources code examples (jQuery Plugins Patterns Boilerplates) :

        http://docs.jquery.com/Plugins/Authoring
        https://github.com/jquery-boilerplate/patterns/tree/master/patterns
        http://addyosmani.com/resources/essentialjsdesignpatterns/book/#designpatternsjquery
        http://coding.smashingmagazine.com/2011/10/11/essential-jquery-plugin-patterns/
        http://kenneth.kufluk.com/blog/2010/08/chaining-asynchronous-methods-in-jquery-using-the-queue/
*/

///////////////////////////////////////////////////////////////////////////
//                           Usage examples                              //
///////////////////////////////////////////////////////////////////////////

/*
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

            $(this).data(plugName)[plugName].css({top: mousey+'px', left: mousex+'px'});
        },

        show: function(event) {
            if (debug) console.log(plugName+'.show()');
            var $this  = $(this), // Current link
                data   = $this.data(plugName); // Current tooltip data

            data[plugName] = $('<div />', { // Create One Tooltip Div
                class: data.options.class,
                text:  data.title
            });
            data[plugName].appendTo('body').hide().fadeIn(600); // Start animation

            $this.data(plugName, data); // Update data to keep our current tooltip
            $this.on('mousemove.'+plugName, privatesMethods.reposition); // Listen mousemove, updating tooltip position
        },

        hide: function(event) {
            if (debug) console.log(plugName+'.hide()');
            var $this = $(this), // Current link
                data  = $this.data(plugName); // Current tooltip data

            $this.off('mousemove.'+plugName, privatesMethods.reposition);
            data[plugName].stop(true, true).fadeOut(400, function() { data[plugName].remove(); }); // End animation
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

                if (titleUrl) { // Do some Ajax request to fetch tooltip content ?
                    // http://api.jquery.com/jQuery.ajax/
                    // http://api.jquery.com/jQuery.proxy/
                    $.ajax({
                        dataType:'jsonp',
                        url: titleUrl,
                        context: $this, // Keep the actual context in the success callback
                        success: function(data) {
                            console.log(this);
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

                var data = { // Create a data stock per element
                    options:   options,  // Stock individual plugin options (if needed)
                    title:     title     // Original title
                };

                $this
                    .data(plugName, data) //  Stock all properties... in current element
                    .attr('title', '')    // Remove default title
                    .on('mouseenter.'+plugName, privatesMethods.show) // Event + this plugin NameSpace
                    .on('mouseleave.'+plugName, privatesMethods.hide);

                // HOW TO KEEP THE CURRENT ELEMENT CONTEXT ?
                // Newly created "tooltip elements" in privatesMethods.show() are accessible via
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
                data.title = content;
                $this.data(plugName, data);
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

                data[plugName].remove();  // Clear tooltip element ?
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