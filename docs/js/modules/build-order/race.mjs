export { Race, TERRAN, PROTOSS, ZERG };

class Race {

    static get _races() {
        if(Race._racesMap === undefined) {
            Race._racesMap = {};
        }

        return Race._racesMap;
    }

    constructor(name) {
        this.name = name;
        Race._races[name] = this;
    }

    toString() {
        return this.name;
    }

    static fromName(name) {
        return Race._races[name];
    }
}

/**
 * enum-like (javascript...) Race
 */

const TERRAN = new Race('Terran');
const PROTOSS = new Race('Protoss');
const ZERG = new Race('Zerg');