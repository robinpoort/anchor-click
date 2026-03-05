(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return factory(root);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    root.anchorClick = factory(root);
  }
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function (window) {

  if (!('querySelector' in document && 'addEventListener' in window)) {
    return function () { return { destroy: function () {} }; };
  }

  return function anchorClick(options) {
    var config = Object.assign({
      parent: 'data-anchor-target',
      link: 'data-anchor',
      ignore: 'data-anchor-ignore',
      clickableClass: 'is-clickable',
      downUpTime: 200,
      onClick: null
    }, options);

    var parentAttr = config.parent;
    var linkAttr = config.link;
    var ignoreAttr = config.ignore;
    var clickableClass = config.clickableClass;
    var downUpTime = config.downUpTime;
    var down;
    var observer;
    var onPointerDown;
    var onPointerUp;
    var onPointerCancel;

    function handleItem(item) {
      var link;
      try {
        link = item.querySelector('[' + linkAttr + ']');
      } catch (e) {
        return;
      }
      if (link !== null) {
        item.classList.add(clickableClass);
      } else {
        item.classList.remove(clickableClass);
      }
    }

    function init() {
      document.querySelectorAll('[' + parentAttr + ']').forEach(function (item) {
        handleItem(item);
      });

      observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function (addedNode) {
              if (addedNode && addedNode.nodeType === Node.ELEMENT_NODE) {
                if (addedNode.hasAttribute(parentAttr)) {
                  handleItem(addedNode);
                }
                addedNode.querySelectorAll('[' + parentAttr + ']').forEach(function (item) {
                  handleItem(item);
                });
              }
            });
          } else if (mutation.type === 'attributes') {
            var target = mutation.target;
            if (mutation.attributeName === parentAttr) {
              if (target.hasAttribute(parentAttr)) {
                handleItem(target);
              } else {
                target.classList.remove(clickableClass);
              }
            } else if (mutation.attributeName === linkAttr) {
              var parent = target.closest('[' + parentAttr + ']');
              if (parent) {
                handleItem(parent);
              }
            }
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [parentAttr, linkAttr]
      });

      onPointerDown = function (event) {
        if (!event.isPrimary) {
          return;
        }
        if (event.button !== 0 && event.button !== 1) {
          return;
        }
        down = Date.now();
      };

      onPointerUp = function (event) {
        // Ignore non-primary pointers (multi-touch)
        if (!event.isPrimary) {
          return;
        }

        // Ignore right-click
        if (event.button === 2) {
          return;
        }

        // Ignore clicks on or inside interactive elements
        if (event.target.closest('button, input, select, textarea')) {
          return;
        }

        // If clicking directly on or inside the target link, let the browser handle it
        if (event.target.closest('[' + linkAttr + ']')) {
          return;
        }

        var up = Date.now();
        var item = event.target.closest('[' + parentAttr + ']');

        if (!item) {
          return;
        }

        var ignore;
        try {
          ignore = event.target.closest('[' + ignoreAttr + '], [href]:not([' + linkAttr + '])');
        } catch (e) {
          return;
        }

        var itemValue = item.getAttribute(parentAttr);
        var link;
        try {
          link = itemValue && itemValue.length > 0
            ? item.querySelector('[' + linkAttr + '="' + itemValue + '"]')
            : item.querySelector('[' + linkAttr + ']');
        } catch (e) {
          return;
        }

        if (!link) {
          return;
        }

        if (up - down < downUpTime && !ignore) {
          if (config.onClick) {
            config.onClick(item, link);
          }
          if (event.ctrlKey || event.metaKey || event.button === 1) {
            window.open(link.href);
          } else {
            link.click();
          }
        }
      };

      onPointerCancel = function () {
        down = undefined;
      };

      window.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerCancel);
    }

    if (!document.body) {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }

    return {
      destroy: function () {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (onPointerDown) {
          window.removeEventListener('pointerdown', onPointerDown);
          onPointerDown = null;
        }
        if (onPointerUp) {
          window.removeEventListener('pointerup', onPointerUp);
          onPointerUp = null;
        }
        if (onPointerCancel) {
          window.removeEventListener('pointercancel', onPointerCancel);
          onPointerCancel = null;
        }
        document.querySelectorAll('[' + parentAttr + ']').forEach(function (item) {
          item.classList.remove(clickableClass);
        });
      }
    };
  };

});
