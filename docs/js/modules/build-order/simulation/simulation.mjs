import BuildOrder from '../build-order.mjs';
import { as } from '../../type-checker.mjs';
import StartActionEvent from './event-started.mjs';
import CompletedActionEvent from './event-completed.mjs';
import Unit from '../unit.mjs';

/**
 * A build order is static, it's data that don' change
 * The simulation will follow a Build Order
 * To know if the build order is possible, trying to be as close to in-game as possible
 */

export default class Simulation {
    constructor(bo) {
        as(bo, BuildOrder);

        this.bo = bo;
        this.time = 0;                          // Current second count
        this.mineral = 0;                       // Current minerals count
        this.gas = 0;                           // Current gas count
        this.supply = 0;                        // Current supply count
        this.max_supply = 0;                    // Current maximum supply
        this.mineral_harvesters = 0;            // Current harvesters at minerals
        this.gas_harvesters = 0;                // Current harvesters at gas
        this.mineral_income = 0;                // Mineral per minut
        this.units = [];                        // All units at this time of the build order, like: ["SCV", "Barracks", "Reaper", "Marine", ...] array of string
    }

    /** 
     * Return true, if is it possible to build an unit at this point of time
     * Regarding the supply count and the resources
     * Don't regard if there is an avalaible building if it's produced from a building
     * 
     * AND check if the build order is not broken after adding this production:
     * for example, we can have enough resources but another building should have been built just after this one.
     * But the resources are no more avalaible: so we need to see at each time, until the end of the build order, if the build order is still consistent.
     */
    hasEnoughResourcesForUnit(unit, time) {
        let ok = true;

        // Run simulation until desired time and check if it is possible                        
        this.goToSecond(time);

        if(!this.hasCurrentlyEnoughFor(unit)) {
            return false;
        }

        // Test with removing resources and then checking if build order is o.k.
        this.removeResourcesFor(unit);

        while(ok && !this.isCompleted()) {
            this.advanceToNextSecond();

            if(!this.isCurrentlyConsistent()) {
                ok = false;
            }
        }

        this.goToSecond(time); // Reset to time requested
        
        return ok;
    }

    /* Check has enough resource at the current time */
    hasCurrentlyEnoughFor(unit) {
        const cost = unit.getCost();
        let ok = false;

        if(this.mineral >= cost.mineral && this.gas >= cost.gas) {
            // Enough resources, check if enough supply

            if(cost.supply <= 0 || this.supply + cost.supply <= this.max_supply) {
                ok = true;
            }
        }

        return ok;
    }

    removeResourcesFor(unit) {
        const cost = unit.getCost();

        this.mineral -= cost.mineral;
        this.gas -= cost.gas;
        
        if(cost.supply >= 0) {
            this.supply += cost.supply;
        } else {
            this.max_supply += -cost.supply;
        }
    }

    /* Check if the build order is possible in game at this point of time */
    isCurrentlyConsistent() {
        return this.mineral >= 0
            && this.gas >= 0
            && this.supply <= this.max_supply;  
    }

    /**
     * Reset simulation until second is reached
     */
    goToSecond(s) {
        as(s, Number);
        let i;
        let e;
        
        this.start();
    
        for(i = 0; i < s; i++) {
            this.advanceToNextSecond();
        }

        if(s === 0) {
            // If second is zero, the event are not removed from the queue
            // Cause problem with isCompleted() when the build order is empty
            // isCompleted() should return true but returns false because the main building is considered in construction

            while((e = this._pollEvent()) !== null) {
                e.trigger(this);
            }
        }
    }

    // Update current supply from all units
    updateSupply() {
        let max = 0, total = 0;
        let i, s;
        let unit;

        for(i = 0; i < this.units.length; i++) {
            unit = Unit.fromName(this.units[i]);
            s = unit.getCost().supply;

            if(s < 0) {
                max += -s;
            } else {
                total += s;
            }
        }

        this.supply = total;
        this.max_supply = max;
    }

    _buildEvents(priority_queue) {
        
        this.bo.visitActions(function(a) {
            priority_queue.push(new StartActionEvent(a));

            // Add completed action event only if the duration is not zero, that is if the action is not instant
            // If the action is instant it doesn't need a finished event
            if(a.getDuration() > 0) {
                priority_queue.push(new CompletedActionEvent(a));
            }
        });
    }

    start() {
        let i;

        this.time = 0;
        this.mineral = 50;
        this.gas = 0;
        this.mineral_harvesters = 12;
        this.gas_harvesters = 0;
        this.mineral_income = 0;
        this.units = [];
        
        // Priority queue of all actions
        // All actions have events that are prebuild into the priority_queue
        // The events are not dynamically added: we know, when we build an unit, when it will be finished
        // Because the production time is constant
        // Also, we can add all events at the begining
        // All events have not a finish event: we consider that, if the event has a duration of zero, that the finish event will not be called
        // Because the event is instant.

        this.priority_queue = new SortedArray([], function(a, b) {
            return a.time - b.time;
        });
        this._buildEvents(this.priority_queue);

        this.units.push("Command Center");

        for(i = 0; i < 12; i++) {
            this.units.push("SCV");
        }

        this.updateSupply();
    }

    // Poll an event if next event is now
    // Returns null if there is no event to be done now
    _pollEvent() {
        const queue = this.priority_queue;
        let e = null;

        if(queue.length > 0 && queue.peek().time === this.time) {
            e = queue.pop();
        }

        return e;
    }

    advanceToNextSecond() {
        let e;

        // Update resources

        /**
         * Gas mining cannot be optimised: 3 workers per gas
         * Mineral can be optimised: there is near and far mineral patches.
         * With a high number of workers, the collection resource rate can be approximed.
         * But in very early game, when the number of workers is very low,
         * the optmisation is possible and has a big impact of the mining resource collection rate:
         * we usually see pro players trying to optimise the builds.
         * We considers, in this build order, that the optmisation is perfect, even if there is approximiation:
         * Under 12 scv, we consider that the optimisation is perfect with an approximat. count of short mineral patches.
         * The optimisation, without taking others factors into consideration like spamming for that the workers don't move
         * to another patch that can be further, is that we consider that all mineral patch that are clostest are mining
         * in priority.
         * 
         * If the factor 40.0 / 60.0 was used, some build order were considered impossible by the simulation.
         * A build order is considered impossible when, at a given point of time, one of the following condition is not matched:
         *  - mineral >= 0
         *  - gas >= 0
         *  - supply <= supplyCap
         */
        let rate;
        
        // Updates actions: check if another action is available
        // And if current next action is at this point of time
        // Consider all actions are down when second start
        // And income is added at the end of the second

        while((e = this._pollEvent()) !== null) {
            e.trigger(this);
        }

        if(this.mineral_harvesters <= 16) {
            rate = 45.0 / 60.0;
            //rate = 0.85;
        } else {
            rate = 40.0 / 60.0;
        }

        // https://liquipedia.net/starcraft2/Resources
        // https://tl.net/forum/starcraft-2/501306-comprehensive-lotv-production-spreadsheet
        const gasRate = 0.89;
        const mineral = this.mineral;

        this.mineral += this.mineral_harvesters * rate; // A mineral worker 40. min. per minute
        this.gas += this.gas_harvesters * gasRate; // A gas worker 38. gaz per minute

        // Mules = count of Orbital Commands
        const countOfOrbitals = this.units.filter(u => u === "Orbital Command").length;
        this.mineral += countOfOrbitals * rate * 3.75;

        this.mineral_income = (this.mineral - mineral) * 60.0; // mineral per minut

        // Update time

        this.time++;
    }

    isCompleted() {
        return this.priority_queue.length === 0;
    }
}