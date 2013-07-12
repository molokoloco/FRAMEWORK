/*

    Workable / Testable jQuery Default Plugin Boilerplate
    V1.5.3 - 12/07/13 - Molokoloco - Copyleft

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
    // Example of HTML setup ////////////////////

    <a href="#" id="link1" class="tooltips" title="It's a test">Tooltip 1</a> !<br />
    <a href="#" id="link2" class="tooltips" title="Click to update">Tooltip 2</a> !<br />
    <a href="#" class="tooltips" data-url="http://www.b2bweb.fr/_COURS/api.php?id=link2">Tooltip AJAX</a> !<br />
    <a href="https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.tooltips.js" class="tooltips">https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.tooltips.js</a> !<br />
    <hr />
    <a href="javascript:void(0);" id="remove">Remove Tooltip n°2</a>

    // Example CSS styling ////////////////////

    .myTooltip {
        background:rgb(30, 145, 212);
        background:rgba(30, 145, 212, 0.9);
        color:#FFFD69;
        position: absolute;
        z-index: 9999999;
        padding:4px 8px;
        -moz-border-radius:3px;-webkit-border-radius:3px;-ms-border-radius:3px;-o-border-radius:5px;border-radius:3px;
    }

    .myTooltipWrap {
        max-width: 180px;
        display: inline-block;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    // Example n°1 ////////////////////

    $(function() {

        // Appel du plugin sur les liens avec la class "tooltips"
        $('a.tooltips').tooltip({ // Call plug in on our collection with optional obj of optionals args
            class: 'myTooltip' // Ex. : user custom CSS for the tooltip element
        });

        $('a.tooltips').on('click', function(event) {
            event.preventDefault();
            $(this).tooltip('update', 'This is the new tooltip content! '+ Math.random()); // update tooltip ?
        });

        $('a#remove').on('click', function() {
            $('a.tooltips')
                .tooltip('destroy') // Remove Tooltip plugin !
                .off('click');      // Remove our custom listener below
        });

    });

    // Example n°2 ////////////////////

    $('.multiplecolumns p a').each(function(i, e) {
        var $this = $(e),
            text  = $this.text();
        if (text.substring(0, 4) == 'http') {
            text = text.replace(/https?\:\/\/(www\.)?/gi, '');
            $this.text(text);
            if (text.length > 23) {
                $this
                    .addClass('myTooltipWrap')
                    .tooltip({class:'myTooltip'});
            }
        }
        else if (text != $this.attr('href')) {
            $this.tooltip({class:'myTooltip'});
        }
    });

*/

///////////////////////////////////////////////////////////////////////////
//      Fichier à enregistrer sous le nom "jquery.tooltip.js"            //
///////////////////////////////////////////////////////////////////////////

(function($) { // our plugin is inside a closure, it keep the NameSpace safe

    var plugName = 'tooltip';  // Our plugin base name !
        debug    = false;      // Edit here to debug ;)

    var privatesMethods = {    // Privates plugin methods

        reposition: function(event) { // Move tooltip
            var mousex = event.pageX + 20, // Get event X mouse coordinates
                mousey = event.pageY + 20;
            $(this).data(plugName)[plugName].css({top: mousey+'px', left: mousex+'px'});
        },

        show: function(event) {
            if (debug) console.log(plugName+'.show()');
            var $this  = $(this), // Current link
                data   = $this.data(plugName); // Current tooltip data
            if (!data[plugName]) {
                data[plugName] = $('<div />', { // Create One Tooltip Div
                    class: data.options.class,
                    text:  data.title
                }).appendTo('body');
                $this.data(plugName, data); // Update data to keep our current tooltip
            }
            data[plugName].hide().fadeIn(600); // Start animation
            $this.on('mousemove.'+plugName, $.proxy(privatesMethods.reposition, this)); // Listen mousemove, updating tooltip position
        },

        hide: function(event) {
            if (debug) console.log(plugName+'.hide()');
            var $this = $(this), // Current link
                data  = $this.data(plugName); // Current tooltip data
            $this.off('mousemove.'+plugName);
            if (data && data[plugName]) {
                data[plugName]
                    .stop(true, false)
                    .fadeOut(400);
            }
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

                // Fetch tooltip static content...
                var title    = $this.data('tooltip') || $this.attr('title') || $this.attr('href'),
                    fetchUrl = $this.data('url');

                if (fetchUrl) { // Do some Ajax request to fetch tooltip content ?
                    // http://api.jquery.com/jQuery.ajax/ - http://api.jquery.com/jQuery.proxy/
                    if (fetchUrl) $.ajax({
                        dataType:'jsonp',
                        url: fetchUrl,
                        context: $this, // Keep the actual context in the success callback
                        success: function(data) {
                            if (debug) console.log('fetchUrl success', data);
                            if (data && data.key1) {
                                $.proxy(publicMethods.update, this)(data.key1);
                                // publicMethods.update.apply(this, [data.key1]);
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            console.log('JSON error : ', textStatus);
                        }
                  });
                }
                else if (!title) return; // Nothing to print ?

                var data = { // Create a data stock per element
                    options: options,  // Stock individual plugin options (if needed)
                    title:   title     // Original title
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
                if (data[plugName]) {
                    data[plugName].html(content);
                }
                else {
                    data.title = content;
                    $this.data(plugName, data);
                }
             });
        },

        destroy: function() { // Remove plugin
            if (debug) console.log(plugName+'.destroy()');
            return this.each(function() {
                $('.'+plugName).remove(); // Remove all tooltips elements
                var $this = $(this),
                    data  = $this.data(plugName);
                if (!data) return; // Nothing here
                $this
                    .attr('title', data['title'])
                    .off('.'+plugName)     // Remove this tooltip event(s) using .namespaceg
                    .removeData(plugName); // Clear data
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