"use strict";
// All units that must be loaded into the database of available units
const UNITS = {};

class Unit {
    #name;
    #race;
    #type;
    #cost;
    #parent;

    constructor(name, race, type, cost, parent) {
        as(name, String);
        as(race, Race);
        as(type, String);
        as(cost, Object);
        as(cost.time, Number);
        as(parent, String);

        this.#name = name;
        this.#race = race;
        this.#type = type;
        this.#cost = cost;
        this.#parent = parent;

        if(this.#cost.mineral === undefined) {
            this.#cost.mineral = 0;
        }
        if(this.#cost.gas === undefined) {
            this.#cost.gas = 0;
        }
        if(this.#cost.supply === undefined) {
            this.#cost.supply = 0;
        }
    }

    getName() { return this.#name; }
    getRace() { return this.#race; }
    getType() { return this.#type; }
    getCost() { return this.#cost; }

    hasParent() { return this.#parent !== ''; }
    getParent() { return Unit.fromName(this.#parent); }

    static fromName(name) {
        as(name, String);

        if(UNITS[name] === undefined) {
            throw new TypeError("Is not an unit: " + "'" + name + "'");
        } else {
            return UNITS[name];
        }
    }
}

Unit.preload = function(url, callback) {
    $.getJSON(url, function(json) {
        Unit.fromJSON(json);
        callback();
    });
};

// Load all units into a select
Unit.loadInto = function($select) {
    let i;
    let u;

    $select.empty();

    for(i = 0; i < UNITS.array.length; i++) {
        u = UNITS.array[i];

        $select.append(
            $('<option>')
                .val(u.getName())
                .text(u.getName())
        );
    }
};

Unit.fromJSON = function(json) {
    let i, j, u;

    UNITS.array = []; // Units as an array

    for(i = 0; i < json.length; i++) {
        j = json[i];
        u = new Unit(j.unit, j.race, j.type || 'generic', j.cost, j.parent || '');
        UNITS[j.unit] = u;
        UNITS.array.push(u);
    }
};
