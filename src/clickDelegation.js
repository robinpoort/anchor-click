(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return factory(root);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    root.clickDelegation = factory(root);
  }
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function (window) {

  if (!(typeof document !== 'undefined' && document && 'querySelector' in document && 'addEventListener' in window)) {
    return () => ({ destroy() {} });
  }

  return function clickDelegation(options) {
    const config = Object.assign({
      parent: 'data-delegate',
      target: 'data-delegate-to',
      ignore: 'data-delegate-ignore',
      clickableClass: 'is-clickable',
      downUpTime: 200,
      onClick: null
    }, options);

    const parentAttr = config.parent;
    const targetAttr = config.target;
    const ignoreAttr = config.ignore;
    const clickableClass = config.clickableClass;
    const downUpTime = config.downUpTime;
    let down;
    let observer;
    let onPointerDown;
    let onPointerUp;
    let onPointerCancel;
    let onDomReady;
    let initialized = false;
    let destroyed = false;

    const handleItem = (item) => {
      let target;
      try {
        target = item.querySelector(`[${targetAttr}]`);
      } catch (e) {
        return;
      }
      if (target) {
        item.classList.add(clickableClass);
      } else {
        item.classList.remove(clickableClass);
      }
    };

    const init = () => {
      if (initialized || destroyed) {
        return;
      }
      initialized = true;

      document.querySelectorAll(`[${parentAttr}]`).forEach(handleItem);

      observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((addedNode) => {
              if (addedNode && addedNode.nodeType === Node.ELEMENT_NODE) {
                if (addedNode.hasAttribute(parentAttr)) {
                  handleItem(addedNode);
                }
                addedNode.querySelectorAll(`[${parentAttr}]`).forEach(handleItem);
              }
            });
          } else if (mutation.type === 'attributes') {
            const mutationTarget = mutation.target;
            if (mutation.attributeName === parentAttr) {
              if (mutationTarget.hasAttribute(parentAttr)) {
                handleItem(mutationTarget);
              } else {
                mutationTarget.classList.remove(clickableClass);
              }
            } else if (mutation.attributeName === targetAttr) {
              const parent = mutationTarget.closest(`[${parentAttr}]`);
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
        attributeFilter: [parentAttr, targetAttr]
      });

      onPointerDown = (event) => {
        if (!event.isPrimary) {
          return;
        }
        if (event.button !== 0 && event.button !== 1) {
          return;
        }
        down = Date.now();
      };

      onPointerUp = (event) => {
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

        // If clicking directly on or inside the target element, let the browser handle it
        if (event.target.closest(`[${targetAttr}]`)) {
          return;
        }

        const up = Date.now();
        const item = event.target.closest(`[${parentAttr}]`);

        if (!item) {
          return;
        }

        let ignore;
        try {
          ignore = event.target.closest(`[${ignoreAttr}], [href]:not([${targetAttr}])`);
        } catch (e) {
          return;
        }

        const itemValue = item.getAttribute(parentAttr);
        let target;
        try {
          target = itemValue && itemValue.length > 0
            ? item.querySelector(`[${targetAttr}="${itemValue}"]`)
            : item.querySelector(`[${targetAttr}]`);
        } catch (e) {
          return;
        }

        if (!target) {
          return;
        }

        if (up - down < downUpTime && !ignore) {
          if (config.onClick) {
            config.onClick(item, target);
          }
          if ((event.ctrlKey || event.metaKey || event.button === 1) && target.href) {
            window.open(target.href, '_blank', 'noopener,noreferrer');
          } else {
            target.click();
          }
          down = undefined;
        }
      };

      onPointerCancel = () => {
        down = undefined;
      };

      window.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerCancel);
    };

    if (!document.body) {
      onDomReady = () => {
        onDomReady = null;
        init();
      };
      document.addEventListener('DOMContentLoaded', onDomReady, { once: true });
    } else {
      init();
    }

    return {
      destroy() {
        destroyed = true;
        if (onDomReady) {
          document.removeEventListener('DOMContentLoaded', onDomReady);
          onDomReady = null;
        }
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
        document.querySelectorAll(`[${parentAttr}]`).forEach((item) => {
          item.classList.remove(clickableClass);
        });
      }
    };
  };

});
