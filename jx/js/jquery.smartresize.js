(function($){  
  /*!
   * smartresize: debounced resize event for jQuery
   * http://github.com/lrbabe/jquery-smartresize
   * Copyright (c) 2009 Louis-Remi Babe
   * Licensed under the GPL license.
   */
	var event = $.event,
		resizeTimeout;
	event.special.smartresize = {
		setup: function() { $(this).bind( 'resize', event.special.smartresize.handler ); },
		teardown: function() { $(this).unbind( 'resize', event.special.smartresize.handler ); },
		handler: function( event, execAsap ) {
			var context = this, // Save the context
				args = arguments;
			event.type = 'smartresize';// set correct event type
			if (resizeTimeout) clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(function() {
				jQuery.event.handle.apply( context, args );
			}, execAsap === 'execAsap'? 0 : 100);
		}
	};
	$.fn.smartresize = function( fn ) {
		return fn ? this.bind( 'smartresize', fn ) : this.trigger( 'smartresize', ['execAsap'] );
	};
}(jQuery));