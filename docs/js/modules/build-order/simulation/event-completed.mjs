import Event from './event.mjs';

export default class CompletedActionEvent extends Event {
    constructor(action) {
        super(action, action.getTime() + action.getDuration());
    }

    trigger(simulation) {
        this.action.completed(simulation);
    }
}