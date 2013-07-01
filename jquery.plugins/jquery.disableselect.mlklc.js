/* //////////////////////////////////////////////////////////////////////////////////////////////////////
///// Code mixing by Molokoloco ..... 2011 ......... [EVER IN PROGRESS (it's not done yet)] ////////////
//////////////////////////////////////////////////////////////////////////////////////////////////// */
/*
    // Disabling elements and text mouse selection
    // Source here :
    
    // Usages examples
    
    $('*').disableTextSelect();
*/

$.fn.disableTextSelect = function () {
    return this.each(function () {
        $(this).css({'-webkit-user-select':'none', '-moz-user-select':'none','user-select':'none'});
    })
};

$.fn.enableTextSelect = function () {
    return this.each(function () {
        $(this).css({'-webkit-user-select':'', '-moz-user-select':'','user-select':''});
    })
};