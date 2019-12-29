export { Action };

/**
 * Represent an Action in the Build Order:
 * Can be remove units from gaz, build an unit,
 * For terran only lift an add-on...
 */
class Action {
    #time = 0;

    constructor(time) {
        abstract(new.target, Action);
        this.uuid = UUID.next();

        this.setTime(time);
    }

    getTime() {
        return this.#time;
    }

    setTime(time) {
        as(time, Number);
        this.#time = time;
    }

    /**
     * Return the time at which the action is completed
     * If this is a build unit actions, all sub-units created are taken
     * into consideration and the action is considered completed when
     * all units are finished.
     */
    getCompleteTiming() {
        return this.#time;
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
}