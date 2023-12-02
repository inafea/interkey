'use strict';
///////////////////////////////
// Activate Page DropdownMenus
///////////////////////////////

/// ACTIVATE ALL DROPDOWNS ///
$(function() {
  $("div[class*=dropmenuWrapper]").click(function(e){
      // Avoid to call below subsequent callback to close all dropdowns
      e.stopPropagation();
      var isOpen = false;
      // Mark if currently clicked dropdown is open
      if ($(this).hasClass('clicked')) { var isOpen = true; }
      // Close all open dropdowns right away and...
      $("div[class*=dropmenuWrapper]").removeClass('clicked');
      // ..only then Toggle Open or Close of current dropdown if it has not already been closed
      if (!isOpen) {
        $(this).toggleClass('clicked'); 
      }
   });
});

$(function() {
  $("[class*=stopprop]").click(function(e){
      // Avoid to call below subsequent callback to close all dropdowns
      e.stopPropagation();
   });
});

/// CLOSE ALL OPEN DROPDOWNS WHEN DOCUMENT IS CLICKED ///
$(document).click(function(){
  $("div[class*=dropmenuWrapper]").removeClass('clicked');
});

/// ACTIVATE ALL TOGGLELANGUAGE DROPDOWN ITEMS ///
$(function() {
  $("a[class*=dropdown-item][id*=toggleLanguage]").click(function(){
        // Append Label to Langauge Selector
        var cl = $(this).attr("rel");
        var alt = $(this).attr("alt");
        window.setCookie("language", cl + "/" + alt, 365);
        window.setLanguage(cl, alt);
   });
});

/// place alternative dynamic dropdowns functions here ///


