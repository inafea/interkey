'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Main header function with docsearch
 * @param  {Object} docSearch config
 */

var mobileMenuAndDropdown = function () {
  function mobileMenuAndDropdown() {
    var _this = this;

    _classCallCheck(this, mobileMenuAndDropdown);

    this.menuState = {
      isOpen: false,
      isOpenMobile: false
    };

    this.INIT_VAL = {
      WIDTH: 490,
      HEIGHT: 360
    };

    this.disableTransitionTimeout;

    this.navRoot = document.querySelector('#navRoot');
    this.dropdownRoot = document.querySelector('#dropdownRoot');
    this.navItems = document.querySelectorAll('a[data-enabledropdown="true"]');
    this.navContainer = document.querySelector('#navContainer');
    this.menuContainer = document.querySelector('#menuContainer');
    this.navBg = document.querySelector('#navBg');
    this.navArrow = document.querySelector('#navArrow');



    this.mobileMenuButton = document.querySelector('#mobileMenuButton');
    this.mobileMenu = document.querySelector('#mobileMenu');

    this.menuDropdowns = {};

    [].forEach.call(document.querySelectorAll('[data-dropdown-content]'), function (item) {
      _this.menuDropdowns[item.dataset.dropdownContent] = {
        parent: item.parentNode,
        content: item
      };
    });


    this.triggerMenu = this.triggerMenu.bind(this);
    this.shouldTriggerMenu = this.shouldTriggerMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    // this.closeMenu = function() {};
    this.toggleMobileMenu = this.toggleMobileMenu.bind(this);
    this.bindListeners = this.bindListeners.bind(this);
    this.calculatePosition = this.calculatePosition.bind(this);

    this.bindListeners();
  }

  _createClass(mobileMenuAndDropdown, [{
    key: 'calculatePosition',
    value: function calculatePosition(sourceNode) {
      var box = sourceNode.getBoundingClientRect();
      var realWidth = sourceNode.offsetWidth;
      var realHeight = sourceNode.offsetHeight;

      return {
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        realWidth: realWidth,
        realHeight: realHeight,
        center: box.left + box.width / 2
      };
    }
  }, {
    key: 'triggerMenu',
    value: function triggerMenu(event) {
      var _this2 = this;

      var dropdown = event.target.dataset.dropdown;
      var newTarget = this.menuDropdowns[dropdown].content;
      var newContent = this.menuDropdowns[dropdown].parent;

      var navItem = this.calculatePosition(event.target);
      var newTargetCoordinates = this.calculatePosition(newTarget);
      var menuContainerOffset = this.calculatePosition(this.menuContainer);
      var leftDistance = void 0;

      var scaleFactors = {
        X: newTargetCoordinates.realWidth / this.INIT_VAL.WIDTH,
        Y: newTargetCoordinates.realHeight / this.INIT_VAL.HEIGHT
      };

      var leftDistanceArrow = '';
      if (window.innerWidth > 1000) {
        leftDistance = navItem.center - menuContainerOffset.left + "px";
        leftDistanceArrow = leftDistance;
      } else {
        leftDistanceArrow = navItem.center - menuContainerOffset.left + "px";
        leftDistance = (window.innerWidth / 2 + window.innerWidth / 8) + "px";
      }

      // var leftDistanceNav = leftDistance;

      // if (menuContainerOffset.left < 20) {
      //   leftDistance = "calc(50% - 36px)";
      //   leftDistanceNav = "calc(50% - 56px)";
      // } else {
      //   leftDistanceNav = "calc(50% - 40px)";
      // }

      this.navBg.style.cssText = '\n      transform: translateX(' + leftDistance + ') scale(' + scaleFactors.X + ', ' + scaleFactors.Y + ')';

      this.navArrow.style.cssText = '\n      transform: translateX(' + leftDistanceArrow + ') rotate(45deg)';

      this.navContainer.style.cssText = '\n      transform: translateX(' + leftDistance + ');\n      width: ' + newTargetCoordinates.realWidth + 'px;\n      height: ' + (newTargetCoordinates.realHeight + 10) + 'px;';

      this.dropdownRoot.style.pointerEvents = "auto";

      Object.keys(this.menuDropdowns).forEach(function (key) {
        if (key === dropdown) {
          _this2.menuDropdowns[key].parent.classList.add('active');
        } else {
          _this2.menuDropdowns[key].parent.classList.remove('active');
        }
      });

      if (!this.menuState.isOpen) {
        setTimeout(function () {
          _this2.navRoot.className = "activeDropdown";
        }, 50);
      }

      window.clearTimeout(this.disableTransitionTimeout);
      this.menuState.isOpen = true;
    }
  }, {
    key: 'shouldTriggerMenu',
    value: function shouldTriggerMenu(event) {
      var _this3 = this;

      if (this.menuState.isOpen) {
        this.triggerMenu(event);
      } else {
        this.triggerMenuTimeout = setTimeout(function () {
          _this3.triggerMenu(event);
        }, 200);
      }
    }
  }, {
    key: 'closeMenu',
    value: function closeMenu(event) {
      var _this4 = this;

      window.clearTimeout(this.triggerMenuTimeout);
      this.menuState.isOpen = false;
      this.disableTransitionTimeout = setTimeout(function () {
        _this4.dropdownRoot.style.pointerEvents = "none";
        _this4.navRoot.className = "notransition";
      }, 50);
    }
  }, {
    key: 'toggleMobileMenu',
    value: function toggleMobileMenu(event) {
      this.mobileMenuButton.classList.toggle('open');
      this.mobileMenu.classList.toggle('open');
    }

    // Search

  },  {
    key: 'bindListeners',
    value: function bindListeners() {
      var _this7 = this;

      var that = this;

      this.navItems.forEach(function (item) {
        item.addEventListener('mouseenter', _this7.shouldTriggerMenu);
        item.addEventListener('focus', _this7.triggerMenu);
        item.addEventListener('mouseleave', _this7.closeMenu);
      });

      this.navContainer.addEventListener('mouseenter', function () {
        clearTimeout(_this7.disableTransitionTimeout);
      });

      this.mobileMenuButton.addEventListener('click', this.toggleMobileMenu);
      document.addEventListener('click', this.closeSubLists);
      document.querySelector('#navContainer').addEventListener('mouseleave', this.closeMenu);
    }
  }]);

  return mobileMenuAndDropdown;

}();


var header = new mobileMenuAndDropdown();

console.log("header_menu Module Loaded")