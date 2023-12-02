'use strict';
// ====================================
// WINDOW SET COOKIES FUNCTIONS
// ====================================

(function(window){
        window.setCookie = function(cookieName, cookieValue, nDays) {
           var today = new Date();
           var expire = new Date();

           if (nDays==null || nDays==0)
               nDays=1;

           expire.setTime(today.getTime() + 3600000*24*nDays);
           document.cookie = cookieName+"="+escape(cookieValue) + ";expires="+expire.toGMTString();
        }

        window.readCookie = function(name) {
          var nameEQ = name + "=";
          var ca = document.cookie.split(';');
          for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
          }
          return null;
        }

        window.setLanguage = function(language, lang_to_hide) {
          // $($.find("#current_language")).html(language);
          // document.querySelectorAll('#current_language').forEach(function(e) {e.innerHTML=language});
          window.currentLanguage = language;
          document.querySelectorAll('.' + language).forEach(function(e) {e.style.display = "inline-block"});
          document.querySelectorAll('.' + lang_to_hide).forEach(function(e) {e.style.display = "none"});
          window.setCookie("language", language + "/" + lang_to_hide, 365);

          // $('.' + language).css("display", "inline");
          // $('.' + lang_to_hide).css("display", "none");
        }

})(window);

// Set current language according to cookie
var cookieString = window.readCookie("language");
if (typeof cookieString !== 'undefined' && cookieString !== null) {
  var cookieValues = window.readCookie("language").split("/");
} else {
  var cookieValues = ["English","Arabic"];
}
window.setLanguage(cookieValues[0], cookieValues[1]);
document.querySelectorAll('#language_selector').forEach(function(e) {
  e.options[e.selectedIndex].removeAttribute("selected");
  var i;
  for (i = 0; i < e.options.length; i++) { 
    // console.log(e.options[i].value);
    if (e.options[i].value === cookieValues[0]) {
      e.options[i].setAttribute('selected', true);
    }
  }
});
// document.querySelectorAll('#language_selector').forEach(function(e) {
//   e.options.forEach(function(p) {
//     console.log(p)
//   })
// });
// console.log(document.querySelectorAll('#language_selector')[0].options)
console.log("set_language Module Loaded")