/* //////////////////////////////////////////////////////////////////////////////////////////////////////
///// Code mixing by Molokoloco ..... 2011 ......... [EVER IN PROGRESS (it's not done yet)] ////////////
//////////////////////////////////////////////////////////////////////////////////////////////////// */
/*
	// Select a text range in input or textarea
	// Source here : http://plugins.jquery.com/project/selectRange
	
	$('#q').selectRange(0, 10);
	
	var searchVal = $('#myInput').val();
	$('#myInput').selectRange(searchVal.indexOf('{'), (searchVal.indexOf('}')+1));
*/

(function($){
     $.fn.selectRange = function(start, end) {
		var e = document.getElementById($(this).attr('id')); // I don't know why... but $(this) don't want to work today :-/
		if (!e) return;
		else if (e.setSelectionRange) { e.focus(); e.setSelectionRange(start, end); } /* WebKit */ 
		else if (e.createTextRange) { var range = e.createTextRange(); range.collapse(true); range.moveEnd('character', end); range.moveStart('character', start); range.select(); } /* IE */
		else if (e.selectionStart) { e.selectionStart = start; e.selectionEnd = end; }
	};
})(jQuery);