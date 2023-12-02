'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var mobileMenuAndDropdown = function () {
  function mobileMenuAndDropdown() {
    var _this = this;

    this.mobileMenuButton = document.querySelector('#mobileMenuButton');
    this.mobileMenu = document.querySelector('#mobileMenu');
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    this.mobileMenuButton.addEventListener('click', this.toggleMobileMenu);
  }

  _createClass(mobileMenuAndDropdown, [ {
    key: 'toggleMobileMenu',
    value: function toggleMobileMenu(event) {
      this.mobileMenuButton.classList.toggle('open');
      this.mobileMenu.classList.toggle('open');
    }
  }]);

  return mobileMenuAndDropdown;

}();


var header = new mobileMenuAndDropdown();

console.log("sidebar_menu Module Loaded")