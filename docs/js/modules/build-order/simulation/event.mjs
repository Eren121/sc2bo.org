import { abstract, as } from '../../type-checker.mjs';
import Action from '../action/action.mjs';

// Represents an Event in the simulation.
// Each action has a begining and an end, also the Event can bo of two sort: a begin event or an end event.
export default class Event {
    constructor(action, time) {
        as(action, Action);
        abstract(new.target, Event);
        this.action = action;
        this.time = time;
    }

    trigger(simulation) {
        throw new TypeError("Event::trigger() not implemented: Derived Class does not implemented abstract method Event::trigger() of abstract class Event");
    }
}