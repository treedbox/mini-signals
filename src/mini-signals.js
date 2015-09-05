/*jshint -W097 */

/**
 * Representation of a single MiniSignals function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @api private
 */
function Node(fn, context) {
  this.fn = fn;
  this.context = context;
  this.next = this.prev = null;
}

/**
 * Minimal MiniSignals interface modeled against the js-signals
 * interface.
 */
class MiniSignals {

  constructor() {
    this._head = this._tail = undefined;
  }

  /**
  * Return a list of assigned event listeners.
  *
  * @param {Boolean} exists We only need to know if there are listeners.
  * @returns {Array|Boolean}
  * @api public
  */
  listeners(exists) {
    var node = this._head;

    if (exists) { return !!node; }
    if (!node) { return []; }

    var i = 0, ee = new Array();

    while (node) {
      ee.push(node.fn);
      node = node.next;
    }

    return ee;
  };

  /**
  * Emit an event to all registered event listeners.
  *
  * @returns {Boolean} Indication if we've emitted an event.
  * @api public
  */
  dispatch() {
    var node = this._head;

    if (!node) { return false; }

    while (node) {
      node.fn.apply(node.context, arguments);
      node = node.next;
    }

    return true;
  };

  /**
  * Register a new EventListener.
  *
  * @param {Functon} fn Callback function.
  * @param {Mixed} context The context of the function.
  * @api public
  */
  add(fn, context) {

    var node = new Node(fn, context || this);

    if (!this._head) {
      this._head = node;
      this._tail = node;
    } else {
      this._tail.next = node;
      node.prev = this._tail;
      this._tail = node;
    }

    return this;
  };

  /**
  * Remove event listeners.
  *
  * @param {Function} fn The listener that we need to find.
  * @param {Mixed} context Only remove listeners matching this context.
  * @api public
  */
  remove(fn, context) {
    var node = this._head, next;
    if (!node) { return this; }
    if (!fn) { return this.removeAll(); }  // maybe change this

    while (node) {
      next = node.next;

      if (node.fn === fn && (!context || node.context === context)) {
        if (node === this._head)  {  // first node
          this._head = node.next;
          if (!this._head){
            this._tail = null;
          } else {
            this._head.prev = null;
          }
        } else if (node === this._tail) {  // last node
          this._tail = node.prev;
          this._tail.next = null;
        } else {  // middle
          node.prev.next = node.next;
          node.next.prev = node.prev;
        }
        node.next = node.prev = null;
      }

      node = next;
    }

    return this;
  };

  /**
  * Remove all listeners.
  *
  * @api public
  */
  removeAll() {
    var node = this._head, next;
    if (!node) { return this; }

    while (node) {
      next = node.next;
      node.next = node.prev = null;
      node = next;
    }
    this._head = this._tail = null;
    return this;
  };
}

//
// Expose the module.
//
export default MiniSignals;