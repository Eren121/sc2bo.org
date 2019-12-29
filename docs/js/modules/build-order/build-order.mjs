export { BuildOrder, Unit };
import { Observable } from '../observer.mjs';
import { Unit } from './unit.mjs';

/**
 * Representation of a Build Order:
 * The build order is represented recursively in a tree, and this class contains
 * the units created at the root
 * That are not built from any building, that is most buildings excluding
 * add-ons and main start building.
 */
class BuildOrder extends Observable {
    _name = "";
    _author = "";
    _date = new Date();
    _race = TERRAN;
    _type = "";
    _actions = []; // First level of the build, unit that need no other buildings
                   // to be created
                   // (or actions)

    constructor(name = "", author = "", date = new Date(),
                race = TERRAN, type = "") {
        super();
        this.setName(name);
        this.setAuthor(author);
        this.setDate(date);
        this.setRace(race);
        this.setType(type);
    }

    getName() {
        return this._name;
    }

    getAuthor() {
        return this._author;
    }

    getDate() {
        return this._date;
    }

    getRace() {
        return this._race;
    }

    getType() {
        return this._type;
    }

    getActions() {
        return this._actions;
    }

    /* Clear to a blank build order */
    clear() {
        this._actions = [];

        // Main production building
        this._actions.push(new Build(0, "Command Center").setIsMain());

        this.notify('change');
    }

    addAction(action) {
        as(action, Action);
        this._actions.push(action);
    }

    removeAction(action) {
        
    }

    setName(name) {
        as(name, String);
        this._name = name;
    }

    setAuthor(author) {
        as(author, String);
        this._author = author;
    }
    setDate(date) {
        as(date, Date);
        this._date = date;
    }

    setRace(race) {
        if(!isRace(race)) {
            throw new TypeError("race is not an instance of Race");
        }

        this._race = race;
    }

    setType(type) {
        as(type, String);
        this._type = type;
    }

    /**
     * Reduce the Build Order:
     * Try to Reduce at maximum the number of rows
     * Concat rows which have only one element.
     * Concat rows when they have only one element (gas, supply depot...)
     * and which are not overlapped
     */
    reduce() {
        let i, j;
        let build;
        let actions;
        let action;

        for(i = 0; i < this._actions.length; i++) {
            build = this._actions[i];
            actions = build.getActions();

            if(actions.length === 1) {
                action = actions[0];

                if(action instanceof Build
                    && actions.getUnit().getType() === 'supply') {

                    
                }
            }
        }
    }

    /**
     * Get the duration, or the length of the build order:
     * The length of the build order is defined by:
     * the time of the lastest action + the duration of the lastest action.
     * If the lastest action is to build an unit, it's also obviously when
     * the unit is finished.
     */
    duration() {
        let i, d = 0, tmp;
        for(i = 0; i < this._actions.length; i++) {
            tmp = this._actions[i].getCompleteTiming();
            if(tmp > d) {
                d = tmp;
            }
        }

        return d;
    }

    /**
     * Visit recursively all action
     * Normally, there must be at maximum two levels, but the structure can support building in buildings etc...
     * Tow levels: one for the building and one for the unit normally.
     * The visit order is unspecified: the json can be written not in order of the timing of the timings.
     *
     * @param callback function(action: Action): void
     */
    visitActions(callback) {
        let i;
        let a;

        for(i = 0; i < this._actions.length; i++) {
            a = this._actions[i];
            this._visitAction(a, callback);
        }
    }

    _visitAction(action, callback) {

        callback(action);

        if(action instanceof Build) {
            this._visitBuild(action, callback);
        } 
    }

    _visitBuild(build, callback) {
        const actions = build.getActions();
        let i;
        let a;

        for(i = 0; i < actions.length; i++) {
            a = actions[i];
            this._visitAction(a, callback);
        }
    }
}
