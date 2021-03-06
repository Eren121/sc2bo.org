export { Unit };
import { as, abstract } from '../type-checker.mjs';
import { Race } from './race.mjs';

// All units that must be loaded into the database of available units
const UNITS = {};

export default class Unit {
    constructor(name, race, type, cost, parent) {
        as(name, String);
        as(race, Race);
        as(type, String);
        as(cost, Object);
        as(cost.time, Number);
        as(parent, String);

        this._name = name;
        this._race = race;
        this._type = type;
        this._cost = cost;
        this._parent = parent;

        if(this._cost.mineral === undefined) {
            this._cost.mineral = 0;
        }
        if(this._cost.gas === undefined) {
            this._cost.gas = 0;
        }
        if(this._cost.supply === undefined) {
            this._cost.supply = 0;
        }
    }

    getName() { return this._name; }
    getRace() { return this._race; }
    getType() { return this._type; }
    getCost() { return this._cost; }

    hasParent() { return this._parent !== ''; }
    getParent() { return Unit.fromName(this._parent); }

    static fromName(name) {
        as(name, String);

        if(UNITS[name] === undefined) {
            throw new TypeError("Is not an unit: " + "'" + name + "'");
        } else {
            return UNITS[name];
        }
    }

    static preloadfromJSON(json) {
        let i, j, u;
        UNITS.array = []; // Units as an array
    
        for(i = 0; i < json.length; i++) {
            j = json[i];
            u = new Unit(j.unit, Race.fromName(j.race), j.type || 'generic', j.cost, j.parent || '');
            UNITS[j.unit] = u;
            UNITS.array.push(u);
        }
    };

    // Load all units into a select
    static loadInto($select) {
        const array = UNITS.array;
        let i;
        let u;

        $select.empty();

        for(i = 0; i < array.length; i++) {
            u = array[i];

            $select.append(
                $('<option>')
                    .val(u.getName())
                    .text(u.getName())
            );
        }
    };
}