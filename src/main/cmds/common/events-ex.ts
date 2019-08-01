import { EventEmitter} from "events";

export enum EEventEmitterEmit2Result {
  none =                      0b0,
  preventDefault =            0b1,
  preventRoot =               0b10,
}

export class SubEventEmitter {
  emitter: EventEmitter;
  event: string
  constructor(event: string, emitter: EventEmitter) {
      this.event = event
      this.emitter = emitter;
  }
  destroy() {
      delete this.event;
      delete this.emitter;
  }
  add(fn: (...args: any[]) => any) {
      this.emitter.addListener(this.event, fn)
  }
  remove(fn: (...args: any[]) => any) {
      this.emitter.removeListener(this.event, fn)
  }    
}

(EventEmitter.prototype as any).emit2 = function(type) {
    var er, handler, len, args, i, listeners, preventRoot, preventDefault;
    preventRoot = 0b0;
    preventDefault = 0b0;

    if (!this._events)
      this._events = {};
  
    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events.error ||
          (isObject(this._events.error) && !this._events.error.length)) {
        er = arguments[1];
        if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
          // At least give some kind of context to the user
          var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
          (err as any).context = er;
          throw err;
        }
      }
    }
  
    handler = this._events[type];
  
    if (isUndefined(handler))
      return EEventEmitterEmit2Result.none;
  
    if (isFunction(handler)) {
      switch (arguments.length) {
        // fast cases
        case 1:
          return handler.call(this);
          break;
        case 2:
          return handler.call(this, arguments[1]);
          break;
        case 3:
          return handler.call(this, arguments[1], arguments[2]);
          break;
        // slower
        default:
          args = Array.prototype.slice.call(arguments, 1);
          return handler.apply(this, args);
      }
    } else if (isObject(handler)) {
      args = Array.prototype.slice.call(arguments, 1);
      listeners = handler.slice();
      len = listeners.length;
      for (i = 0; i < len; i++) {
        var result = listeners[i].apply(this, args);
        preventRoot = preventRoot | (result & EEventEmitterEmit2Result.preventRoot);
        preventDefault = preventDefault | (result & EEventEmitterEmit2Result.preventDefault);        
        if (preventDefault) 
          break;
      }
    }
  
    return preventRoot | preventDefault;
  };

function isFunction(arg) {
    return typeof arg === 'function';
}
  
function isNumber(arg) {
    return typeof arg === 'number';
}
  
function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
}
  
function isUndefined(arg) {
    return arg === void 0;
}