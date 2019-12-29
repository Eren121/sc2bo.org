export { Observable };
import { abstract } from './type-checker.mjs';
/**
 * Observer pattern
 */
class Observable {
    constructor() {
        abstract(new.target, Observable);
        this._events = {};
    }

    subscribe(event, callback) {
        if(this._events[event] === undefined) {
            this._events[event] = [];
        }

        this._events[event].push(callback);
    }

    notify(event) {
        if(this._events[event] !== undefined) {
            this._events[event].forEach(function(callback) {
                callback(this);
            });
        }
    }
}