import ActionFactory from './factory.mjs';
import Action from './action.mjs';
import { parseTime } from '../../time.mjs';

export default class Lift extends Action {
    constructor(time) {
        super(time);
    }

    getDescription() {
        return "Lift";
    }
}

ActionFactory.registerAction('lift', function(json) {
    return new Lift(parseTime(json.time));
});