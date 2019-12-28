"use strict";
/**
 * Representation of a Build Order:
 * The build order is represented recursively in a tree, and this class contains
 * the units created at the root
 * That are not built from any building, that is most buildings excluding
 * add-ons and main start building.
 */
class BuildOrder extends Observable {
    #name = "";
    #author = "";
    #date = new Date();
    #race = TERRAN;
    #type = "";
    #actions = []; // First level of the build, unit that need no other buildings
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
        return this.#name;
    }

    getAuthor() {
        return this.#author;
    }

    getDate() {
        return this.#date;
    }

    getRace() {
        return this.#race;
    }

    getType() {
        return this.#type;
    }

    getActions() {
        return this.#actions;
    }

    addAction(action) {
        as(action, Action);
        this.#actions.push(action);
    }

    setName(name) {
        as(name, String);
        this.#name = name;
    }

    setAuthor(author) {
        as(author, String);
        this.#author = author;
    }
    setDate(date) {
        as(date, Date);
        this.#date = date;
    }

    setRace(race) {
        if(!isRace(race)) {
            throw new TypeError("race is not an instance of Race");
        }

        this.#race = race;
    }

    setType(type) {
        as(type, String);
        this.#type = type;
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

        for(i = 0; i < this.#actions.length; i++) {
            build = this.#actions[i];
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
        for(i = 0; i < this.#actions.length; i++) {
            tmp = this.#actions[i].getCompleteTiming();
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

        for(i = 0; i < this.#actions.length; i++) {
            a = this.#actions[i];
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
