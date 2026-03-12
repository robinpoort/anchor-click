export interface ClickDelegationOptions {
  /** Attribute on the clickable item. Default: `"data-delegate"` */
  parent?: string;
  /** Attribute on the target element. Default: `"data-delegate-to"` */
  target?: string;
  /** Attribute to exclude child elements from triggering a click. Default: `"data-delegate-ignore"` */
  ignore?: string;
  /** Class added to clickable items. Default: `"is-clickable"` */
  clickableClass?: string;
  /** Max milliseconds between pointerdown and pointerup to count as a click. Default: `200` */
  downUpTime?: number;
  /** Callback fired before navigation. Receives the item and the target link element. */
  onClick?: (item: Element, link: HTMLElement) => void;
}

export interface ClickDelegationInstance {
  /** Removes all event listeners, disconnects the MutationObserver and removes `clickableClass` from all items. */
  destroy(): void;
}

declare function clickDelegation(options?: ClickDelegationOptions): ClickDelegationInstance;

export default clickDelegation;
