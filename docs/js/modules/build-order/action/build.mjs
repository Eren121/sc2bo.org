export { Build };

/**
 * Represent a Build production chain like queued units.
 * But the queue do not represent the in-game real queue, with a maximum of 5
 * units.
 * It represent all of the units created from within this unit from begining of
 * the build order to the end of the build order.
 */
class Build extends Action {
    #unit = "";
    #count = 1;
    _actions = []; // Build recursively
    #isMain = false;

    constructor(time, unit, count = 1) {
        super(time);
        this.setUnit(unit);
        this.setCount(count);
    }

    getActions() {
        return this._actions;
    }

    // Return if this building represent the main building
    // (The main production building created implcitly at begining)
    // If yes, the complete time remain zero if there is no action
    // even if building time is not zero because it is instantly here.
    isMain() {
        return this.#isMain;
    }

    setIsMain(isMain = true) {
        as(isMain, Boolean);
        this.#isMain = isMain;
        return this;
    }

    getUnit() { return Unit.fromName(this.#unit); }

    setUnit(unit) {
        as(unit, String);
        this.#unit = unit;
    }

    getCount() {
        return this.#count;
    }
    
    setCount(count) {
        as(count, Number);
        this.#count = count;
    }

    addAction(action) {
        as(action, Action);
        this._actions.push(action);
    }

    getCompleteTiming() {
        let d = this.getTime() + this.getDuration();
        let i, tmp;

        for(i = 0; i < this._actions.length; i++) {
            tmp = this._actions[i].getCompleteTiming();
            if(tmp > d) {
                d = tmp;
            }
        }

        return d;
    }

    getDuration() {
        if(this.isMain()) {
            return 0;
        } else {
            return this.getUnit().getCost().time;
        }
    }

    getDescription() {
        let s = this.getUnit().getName();
        if(this.getCount() > 1) {
            s += ' x' + this.getCount();
        }

        return s;
    }

    // Trigger in the simulation when the action is started / and or finished
    
    started(simulation) {

        if(this.isMain()) {
            return;
        }
        
        const unit = this.getUnit();
        const s = unit.getCost().supply * this.getCount();

        // Add supply, remove resources

        simulation.mineral -= this.getUnit().getCost().mineral;
        simulation.gas -= this.getUnit().getCost().gas;

        // Update supply

        if(s > 0) {
            simulation.supply += s;
        }

        // Only add the unit to the list when the construction is finished
    }

    completed(simulation) {

        if(this.isMain()) {
            return;
        }

        const unit = this.getUnit();
        const s = unit.getCost().supply * this.getCount();

        // Add unit to the list
        simulation.units.push(this.#unit);

        // Update max. supply (max. supply is added only when unit is finished contrarly to unit supply cost that is added when unit is started instantly)

        if(s < 0) {
            simulation.max_supply += -s;
        }

        // If the building is a gas: add harvesters to it
        // No verification is done if there is < 3 harvesters at minerals but should be possible
        // Considers when a gas is finished, instantly add 3 harvesters to it.

        if(unit.getType() === 'gas') {
            simulation.mineral_harvesters -= 3;
            simulation.gas_harvesters += 3;
        }

        // If unit is a worker, add to mineral instantly

        else if(unit.getType() == 'worker') {
            simulation.mineral_harvesters++;
        }
    }

    /**
     * Fo a building, we can check if the production queue is empty at a given point of time.
     * This permits to check if we can add an unit wherever we want.
     */
    isEmptySpaceBetween(min, max) {
        as(min, Number);
        as(max, Number, min <= max);

        let i;
        let a;

        // Check at first if building is build at min minutes

        if(this.getTime() + this.getDuration() > min) {
            return false;
        }

        // We assume that the timeline can be not sorted so no short-circuit

        for(i = 0; i < this._actions.length; i++) {
            a = this._actions[i];

            if(a instanceof Build) {

                // 1D time segment collision
                // https://eli.thegreenplace.net/2008/08/15/intersection-of-1d-segments
                if(max > a.getTime() && a.getTime() + a.getDuration() > min) {
                    return false;
                }
            }
        }

        return true;
    }
}
