class BuildOrder extends Observable {
    constructor() {
        // Priority queue of all actions
        this._actions = new SortedArray([], function(a, b) {
            return a.time - b.time;
        });

        this.productionRows = [{
            time: 0,
            unit: "Command Center"
        }];                       // Each line represent a production queue (each element depends of the preceding, that is to say a production building)
                                  // Note: zerg can product units from others units.

        // Max seconds for the build order.
        // Useful for drawing table, and use for slider.
        // Depends on latest unit created
        this.maxTime = 300;
    }
    
    buildUnit(time, unit, parent = null) {
        if(parent === null) { // Built unit is built from no production queue, it's probably a building.
            this.productionRows.push({
                time: time,
                unit: unit
            });
            parent = this.productionRows.length - 1; // Return a newly created production row only if parent is null
        }

        this.addAction(new StartUnit(time, unit, parent));
        return parent;
    }

    addAction(action) {
        this._actions.push(action);
    }
    
    removeAction(uuid) {
        let i, action;
        for(i = 0; i < this._actions.length; i++) {
            action = this._actions.get(i);
            if(action.uuid === uuid) {
                this._actions.removeAt(i);

                if(action.parent === null) {
                    // If the parent is null, also remove row
                }
                
                return true;
            }
        }

        console.log('Cannot remove not found element');
        return false;
    }

    get actions() { // Copy array to simulate
        const copy = new SortedArray([], function(a, b) {
            return a.time - b.time;
        });

        let x, i;
        for(i = 0; i < this._actions.length; i++) {
            x = this._actions.get(i);
            copy.push(Object.assign(Object.create(Object.getPrototypeOf(x)), x));
        }

        return copy;
    }

    display() {
        DisplayBuildOrder(this);
    }
}

// Represents a simulation of a build order, that is a game with a time, a current amount of resources, a supply...
class Base {
    constructor(buildOrder) {
        this.resources = {
            mineral: 50,
            gas: 0
        };
        this.supply = {
            max: 15,
            current: 12
        };
        this.time = 0;
        this.workers = {
            gas: 0,
            mineral: 12,

            get total() {
                return this.gas + this.mineral;
            }
        };

        // Priority queue of all actions
        this.actions = buildOrder.actions;
        this.productionRows = buildOrder.productionRows;

        this.actors = []; // All units at this point in the base (Units + Buildings)
    }

    advanceToNextSecond() {
        // Update resources

        this.resources.mineral += this.workers.mineral * (40 / 60.0); // A mineral worker 40. min. per minute
        this.resources.gas += this.workers.gas * (38.0 / 60.0); // A gas worker 38. gaz per minute

        
        // Updates actions: check if another action is available
        // And if current next action is at this point of time

        while(this.actions.length > 0 && this.actions.peek().time === this.time) {

            const action = this.actions.pop();
            action.trigger(this);
        }
        
        // Update time

        this.time++;
    }
    
    /**
     * Return, the ID of the actor associated with the production.
     * It's to enqueue units if it's a production building
     * 
     * Each building is represented into a row in the production tab.
     * 
     *
     * @param parent int The ID of the parent if this unit is built from a production facility.
     *                   Parent = from where the production tab.
     *                   Usually buildings have a parent equals to null (not zero, zeros is the first building also the main: cc, hatchery, nexus at begining of the game)
     *                   The main production building has ID 0.
     *                   The first unit created, usually always a worker in standard build order, has also ID 1, and parent ID 0 (main building). 
     */

    addAction(action) {
        this.actions.push(action);
    }

    addActor(actor) {
        this.actors.push(actor);
    }

    /**
     * Display advancement of build order, that is to say display mineral count, etc...
     */
    display() {
        DisplayAdvancementOfBuildOrder(this);
    }
}

function LoadUnitsFromJSON(json) {
    let i;

    window.UNITS = {};
    for(i = 0; i < json.length; i++) {
        window.UNITS[json[i].unit] = json[i];
    }
}

// Find an Unit from it's name
function GetUnit(name) {

    if(UNITS[name] === undefined) {
        console.error("Unit " + name + " not defined.");
        return null;
    }

    return UNITS[name];
}

/**
 * Represent an Actor in the game. An "unit" was reserved for the term for the "model" (the Actor is the "instance").
 * Class = Unit, Instance = Actor.
 * 
 * It has a production queue.
 * It was not named Building, because even if not implemented yet, units can have production queue, in the zerg race:
 * Roachs can transform into ravagers, or hydralisks into lurkers
 * And drones can morph into buildings so when one building is created for zerg, one drone must be removed for the zerg race.
 */
class Actor {
    constructor(unit) {
        this.unit = unit;

        /*
        this.time = time; // "build time", "time": finally this.time is the time at which the actor is done, ready. also starting_time + cost_time = Actor.time
        this.productionQueue = []; // No distinction between units and building: units have also a production queue.
                                   // And its true: some units have a building queue to morph into another unit for the zerg race.
                                   // The others ones let the production queue empty but its simplify and generify the representation.
        */
    }
}

/**
 * Represent an action in the simulation/bo
 */
class Action {
    constructor(time) {
        this.time = time;
        this.uuid = UUID.next();
    }

    trigger(base) {}
}

/**
 * The Action to "start an unit"
 * Was modified to the action "Enqueue an unit into a production building"
 * Also, when a unit is started, it represents the action of producting an unit in the game. But that is to say,
 * Enqueuing an unit into a production building. Also if the building is producing another unit, the unit is enqueued and not producted immediatly.
 */
class StartUnit extends Action {
    constructor(time, unit, parent) {
        super(time);
        this.unit = unit;
        this.parent = parent;
    }

    trigger(base) {
        const u = GetUnit(this.unit);

        console.log("Start unit " + this.unit + " at " + this.time);

        // Add supply, completed action and remove resources

        if(u.cost.supply !== undefined && u.cost.supply !== 0) {
            if(u.cost.supply > 0) {
                base.supply.current += u.cost.supply;
            }
        }

        base.addAction(new UnitCompleted(this.time + u.cost.time, this.unit));

        if(u.cost.mineral !== undefined) {
            base.resources.mineral -= u.cost.mineral;
        }
        if(u.cost.gas !== undefined) {
            base.resources.gas -= u.cost.gas;
        }
    }
}

class UnitCompleted extends Action {
    constructor(time, unit) {
        super(time);
        this.unit = unit;
    }

    trigger(base) {
        const u = GetUnit(this.unit);

        console.log("Start unit " + this.unit + " completed at " + this.time);

        // Add to maximum supply if supply building

        if(u.cost.supply !== undefined && u.cost.supply !== 0) {
            if(u.cost.supply < 0) {
                base.supply.max += -u.cost.supply;
            }
        }

        base.addActor(new Actor(this.unit));

        // Action specific to units if not generic one
        
        switch(u.type || "generic") {

            case "worker":
                base.workers.mineral++;
                break;
            
            case "gas":
                // The unit is a building and gas building one
                // Remove not three workers...
                // Remove three workers, the building finished is not a worker one
                // Suppositly, when a refinery finished, give it immediately 3 gas workers
                // For most build order it's how it is done
                // For specifics you can cut the gas... For not generic build orders and tricky especially in terran or aggressive ones into transition.

                base.workers.mineral -= 3;
                base.workers.gas += 3;
                break;
            
            default:
                break;
        }
    }
}