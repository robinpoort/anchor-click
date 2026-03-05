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
      parent: 'data-anchor-parent',
      link: 'data-anchor-click',
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

    function handleItem(item) {
      var link = item.querySelector('[' + linkAttr + ']');
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
        if (event.button !== undefined && event.button !== 0 && event.button !== 1) {
          return;
        }
        down = Number(new Date());
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

        // Ignore direct clicks on anchors and buttons
        if (event.target.hasAttribute('href') || event.target.tagName === 'BUTTON') {
          return;
        }

        var up = Number(new Date());
        var item = event.target.closest('[' + parentAttr + ']');
        var ignore = event.target.closest('[' + ignoreAttr + '], [href]:not([' + linkAttr + '])');

        if (!item) {
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

      window.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);
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
        document.querySelectorAll('[' + parentAttr + ']').forEach(function (item) {
          item.classList.remove(clickableClass);
        });
      }
    };
  };

});
