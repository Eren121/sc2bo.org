import ActionFactory from './factory.mjs';
import { as, abstract } from '../../type-checker.mjs';
import UUID from '../../uuid.mjs';

/**
 * Represent an Action in the Build Order:
 * Can be remove units from gaz, build an unit,
 * For terran only lift an add-on...
 */
export default class Action {
    constructor(time) {
        abstract(new.target, Action);
        this.uuid = UUID.next();

        this.setTime(time);
    }

    getTime() {
        return this._time;
    }

    setTime(time) {
        as(time, Number);
        this._time = time;
    }

    /**
     * Return the time at which the action is completed
     * If this is a build unit actions, all sub-units created are taken
     * into consideration and the action is considered completed when
     * all units are finished.
     */
    getCompleteTiming() {
        return this._time;
    }

    // By default instant action duration of one second.
    getDuration() {
        return 1;
    }

    getDescription() {
    }

    // Trigger in the simulation when the action is started / and or finished
    started(simulation) {}
    completed(simulation) {}
    
    static fromJSON(json) {
        let a = json.action || 'build';
    
        // By default, it's build an unit
        // Because this is the center of a build order
        // Some build orders have only this action
        // But a build order has no sense without this action

        return ActionFactory.Build(a, json);
    };
}