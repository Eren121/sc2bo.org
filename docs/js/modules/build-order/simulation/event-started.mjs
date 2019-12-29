import Event from './event.mjs';

export default class StartActionEvent extends Event {
    constructor(action) {
        super(action, action.getTime());
    }

    trigger(simulation) {
        this.action.started(simulation);
    }
 }