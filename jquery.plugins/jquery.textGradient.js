/*
    jQuery $.textGradient() ReadR V0.2 - remix by @molokoloco 2011
    Demo : http://jsfiddle.net/molokoloco/23RAr/
    Git  : https://github.com/molokoloco/FRAMEWORK/blob/master/jquery.plugins/jquery.textGradient.js
    Blog : http://www.b2bweb.fr/molokoloco/beeline-reader-lire-plus-vite-et-reduire-les-erreurs/

    "Save Time. Save Your Eyes. Read With BeeLine."
    Original idea from http://beelinereader.com

    Use "jquery.xcolor.js" plugin for funny colors
    http://www.xarg.org/project/jquery-color-plugin-xcolor/
    Ex : $.xcolor.opacity('white', 'rgb(100,10,0)', 0.5)
*/

(function($, window, document, undefined) {

    // Old school debug
    var db = function() { 'console' in window && console.log.call(console, arguments); };

    ///////////////////////////////////////////////////////////////////////////////
    // $.textGradient() plugin 
    ///////////////////////////////////////////////////////////////////////////////
    
    // Base name
    var plugName = 'textGradient'; 
    
    // Default plugin properties
    $[plugName+'Options'] = {
        color1      : '#C53727',
        color2      : '#4D90FE',
        tag         : 'p',   // Text container is <p>
        gradientBox : 'span',
        resetAtEnd  : false, // Reset gradient after each new tag
        doResize    : true  // Redraw text on window resize
    };

    // Here we go
    $.fn[plugName] = function(options) {
        
        options = $.extend({}, $[plugName+'Options'], options);

        return this.each(function() {

            var $this = $(this), // This is the BOX element for witch the plugin apply
                P     = {};      // All our props

            ///////////////////////////////////////////////////////////////////////////////
            // PUBLIC // Externals methods // $this.bind(publicMethods) : $canvas.trigger('play')
            ///////////////////////////////////////////////////////////////////////////////
            var publicMethods = {
                reposition: function(event) {
                    //db('reposition');
                    if (P.windowTmr) clearTimeout(P.windowTmr);
                    P.windowTmr = setTimeout(privateMethods.redraw, 330); // Trottle resize : Wait before triggering
                },
                destroy: function(event) {
                    //db('destroy');
                    if (P.windowTmr) clearTimeout(P.windowTmr);
                    $(window).unbind('.'+plugName); // clear all events of the plugin namespace
                }
            };

            ///////////////////////////////////////////////////////////////////////////////
            // PRIVATES...
            ///////////////////////////////////////////////////////////////////////////////
            var privateMethods = {
                init: function() { // Our $.textGradient() plugin
                    //db('init');
                    P.maxLetter = privateMethods.findMaxLetters();
                    P.colorInc  = 1 / P.maxLetter;
                    P.color     = '';
                    P.row       = 0;
                    P.col       = 0;
                },
                // Array of letters mapped with surrounding span gradient
                create: function() {
                    //db('create');
                    privateMethods.init();
                    $this.find(options.tag).each(function() { // <p>
                        var $thisP   = $(this),
                            letters  = $thisP.html().split(''),
                            result   = '',
                            isTag    = false;
                        if (options.resetAtEnd) P.col = 0;
                        for (var i=0, len=letters.length; i<len; i++) {
                            if (letters[i] == '<') isTag = true; // skip tags
                            if (isTag) {
                                result += letters[i];
                                if (letters[i] == '>') isTag = false;
                                continue; // Jump
                            }
                            if (P.row % 2 === 0) P.color = P.colorInc * P.col;
                            else                P.color = P.colorInc * (P.maxLetter - P.col);
                            P.color = $.xcolor.opacity(options.color1, options.color2, P.color); // get Hexa color
                            result += '<'+options.gradientBox+' style="color:'+P.color+';" class="'+plugName+'">'+letters[i]+'</'+options.gradientBox+'>';
                            if (P.col == P.maxLetter) {
                                P.row++;
                                P.col = 0;
                            }
                            else P.col++;
                        }
                        $thisP.html(result);
                    });
                },
                redraw: function() {
                    //db('redraw');
                    privateMethods.init();
                    $this.find(options.tag).each(function() { // <p>
                        if (options.resetAtEnd) P.col = 0;
                        $(this).find(options.gradientBox+'.'+plugName).each(function() { // <span>
                            if (P.row % 2 === 0) P.color = P.colorInc * P.col;
                            else                P.color = P.colorInc * (P.maxLetter - P.col);
                            P.color = $.xcolor.opacity(options.color1, options.color2, P.color).toString();
                            $(this).css({color:P.color});
                            if (P.col == P.maxLetter) {
                                P.row++;
                                P.col = 0;
                            }
                            else P.col++;
                        });
                    });
                },
                // How many letters for a line in a box ?
                findMaxLetters: function() {
                    //db('findMaxLetters');
                    var letter      = 'abcdefABC123ghijklmnopqrstuvwxyz',
                        letterMax   = letter.length,
                        letterNum   = 1,
                        letterCount = 0,
                        $boxTest    = $this.clone()
                                           .css({overflow:'auto', height:''})
                                           .html('<'+options.tag+'>'+letter[0]+'</'+options.tag+'>')
                                           .appendTo($this.parent()),
                        $boxTestP   = $boxTest.find(options.tag),
                        boxHeight   = parseInt($boxTest.height(), 10);
                    while(boxHeight == parseInt($boxTest.height(), 10)) {
                        $boxTestP.html($boxTestP.html()+letter[letterNum]);
                        letterCount++;
                        letterNum++;
                        if (letterNum >= letterMax) letterNum = 0;
                        if (letterCount >= 1000) break; // security
                    }
                    $boxTest.remove();
                    return letterCount;
                }
            };
            
            
            ///////////////////////////////////////////////////////////////////////////////
            // INIT
            $this.bind(publicMethods);     // Map our methods to the element
            privateMethods.create();
            if (options.doResize) 
                $(window).bind('resize.'+plugName, publicMethods.reposition);

        }); // End each closure

    }; // End plugin

})(jQuery, window, document);
