/* //////////////////////////////////////////////////////////////////////////////////////////////////////
///// Code mixing by Molokoloco ..... 2011 ......... [EVER IN PROGRESS (it's not done yet)] ////////////
//////////////////////////////////////////////////////////////////////////////////////////////////// */
/*
    // Add Or Switch Stylesheet
    
        // Ressources :
            * Source here : http://home.b2bweb.fr/js/jquery.style.js
            * Official : http://plugins.jquery.com/project/AddOrSwitchStylesheet
            * Use cookie manager from : http://plugins.jquery.com/project/cookie 
            
        // Plugin who load (at the first demand) and switch stylesheet, with cookie :
            * Manage links to change style
            * Add stylesheet to head, if not exist
            * If already exist, switch style with the disabled attribute
            * Prevent changing styles who are not related to theme : No modification on styles without id attribute
            * Prevent changing other styles who are not related to theme
            * Stock and autoload user style preference, with a cookie 
    
        // HTML
    
            <head>
                 <link rel="stylesheet" type="text/css" media="all" href="css/styles.css" id="themeDefault"/>
            </head>
            <body>
                 <ul>
                      <li><a href="javascript:void(0);" rel="css/styles.css" class="css">Original</a></li>
                      <li><a href="javascript:void(0);" rel="css/style_light.css" class="css">Blanc</a></li>
                      <li><a href="javascript:void(0);" rel="css/style_dark.css" class="css">Sombre</a></li>
                 </ul>
            </body>
        
        // JS USE CASE
        
            $('a.css').styleInit(); // That all ! Wait user click...
            $.fn.styleSwitch('css/styles.css'); // Direct style change with JS call
*/

(function($){
     $.fn.extend({
          styleDisable: function (disabled) {
               setTimeout(function () {
                    $(disabled).each(function () {
                         $(this).attr('disabled', 'disabled');
                    });
               }, 250);
          },
          styleLoad: function (stylePath) {
               $('head').append('<link rel="stylesheet" type="text/css" href="' + stylePath + '" id="theme' + Math.random() + '"/>');
          },
          styleSwitch: function (stylePath) {
               var exist = false;
               var disabled = [];
               $('link[@rel*=style][id]').each(function () {
                    if (stylePath == $(this).attr('href')) {
                         $(this).removeAttr('disabled');
                         exist = true;
                    }
                    else disabled.push(this);
               });
               if (exist == false) $.fn.styleLoad(stylePath);
               $.fn.styleDisable(disabled);
               $.cookie('css', stylePath, {
                    expires: 365,
                    path: '/'
               });
          },
          styleInit: function () {
               if ($.cookie('css')) {
                    var isSet = false;
                    $('link[rel*=style][id]').each(function () {
                         if ($.cookie('css') == $(this).attr('href')) isSet = true;
                    });
                    if (isSet == false) $.fn.styleSwitch($.cookie('css'));
               }
               return $(this).click(function (event) {
                    event.preventDefault();
                    $.fn.styleSwitch($(this).attr('rel'));
                    $(this).blur();
               });
          }
     });
})(jQuery);