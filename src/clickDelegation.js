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
    let activePress;
    let observer;
    let onPointerDown;
    let onPointerUp;
    let onPointerCancel;
    let onDomReady;
    let initialized = false;
    let destroyed = false;

    const resolveTarget = (item) => {
      const itemValue = item.getAttribute(parentAttr);

      if (!(itemValue && itemValue.length > 0)) {
        return item.querySelector(`[${targetAttr}]`);
      }

      return Array.from(item.querySelectorAll(`[${targetAttr}]`)).find((candidate) => {
        return candidate.getAttribute(targetAttr) === itemValue;
      }) || null;
    };

    const shouldIgnoreElement = (element) => {
      if (!element || !element.closest) {
        return false;
      }

      if (element.closest('button, input, select, textarea')) {
        return true;
      }

      if (element.closest(`[${targetAttr}]`)) {
        return true;
      }

      try {
        return !!element.closest(`[${ignoreAttr}], [href]:not([${targetAttr}])`);
      } catch (e) {
        return true;
      }
    };

    const getClosest = (element, selector) => {
      if (!element || !element.closest) {
        return null;
      }

      try {
        return element.closest(selector);
      } catch (e) {
        return null;
      }
    };

    const handleItem = (item) => {
      let target;
      try {
        target = resolveTarget(item);
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

        const item = getClosest(event.target, `[${parentAttr}]`);
        if (!item || shouldIgnoreElement(event.target)) {
          activePress = null;
          return;
        }

        activePress = {
          time: Date.now(),
          pointerId: event.pointerId,
          item
        };
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

        if (shouldIgnoreElement(event.target)) {
          return;
        }

        const up = Date.now();
        const item = getClosest(event.target, `[${parentAttr}]`);

        if (!item) {
          return;
        }

        let target;
        try {
          target = resolveTarget(item);
        } catch (e) {
          return;
        }

        if (!target) {
          return;
        }

        if (
          activePress &&
          activePress.pointerId === event.pointerId &&
          activePress.item === item &&
          up - activePress.time < downUpTime
        ) {
          if (config.onClick) {
            config.onClick(item, target);
          }
          if ((event.ctrlKey || event.metaKey || event.button === 1) && target.href) {
            window.open(target.href, '_blank', 'noopener,noreferrer');
          } else {
            target.click();
          }
          activePress = null;
        }
      };

      onPointerCancel = () => {
        activePress = null;
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
        activePress = null;
        document.querySelectorAll(`[${parentAttr}]`).forEach((item) => {
          item.classList.remove(clickableClass);
        });
      }
    };
  };

});
