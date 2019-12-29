import ActionFactory from './factory.mjs';
import Action from './action.mjs';
import { parseTime } from '../../time.mjs';
import { as } from '../../type-checker.mjs';

export default class Land extends Action {
    _unit;

    constructor(time, unit) {
        super(time);
        this.setUnit(unit);
    }

    getUnit() { return this._unit; }

    setUnit(unit) {
        as(unit, String);
        this._unit = unit;
    }

    getDescription() {
        return "Land";
    }
}

ActionFactory.registerAction('land', function(json) {
    return new Land(parseTime(json.time), json.unit);
});