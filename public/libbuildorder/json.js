"use strict";
/**
 * Build Order serialisation/deserialisation from and to JSON utility
 */
BuildOrder.prototype.toJSON = function() {
};

BuildOrder.fromJSON = function(json) {
    const bo = new BuildOrder;
    let i;

    if(json.name !== undefined) {
        bo.setName(json.name);
    }
    if(json.author !== undefined) {
        bo.setAuthor(json.author);
    }
    if(json.date !== undefined) {
        bo.setDate(new Date(json.date));
    }
    if(json.race !== undefined) {
        bo.setRace(json.race);
    }
    if(json.type !== undefined) {
        bo.setType(json.type);
    }

    if(json.actions !== undefined) {
        for(i = 0; i < json.actions.length; i++) {
            bo.addAction(Action.fromJSON(json.actions[i]));
        }
    }

    return bo;
};

Action.ACTIONS = {
    'lift': function(json) {
        return new Lift(parseTime(json.time));
    },
    'land': function(json) {
        return new Land(parseTime(json.time), json.unit);
    },
    'build': function(json) {
        return Build.fromJSON(json);
    },
    'main': function(json) {
        return Build.fromJSON(json, true);
    }
};

/**
 * Parse class Action
 * With derived type (factory)
 */
Action.fromJSON = function(json) {
    let action = null;
    let a = json.action || 'build';

    // By default, it's build an unit
    // Because this is the center of a build order
    // Some build orders have only this action
    // But a build order has no sense without this action

    if(Action.ACTIONS[a] !== undefined) {
        action = Action.ACTIONS[a](json);
    } else {
        throw new TypeError("Invalid action type: " + json.type);
    }

    return action;
};

/**
 * Parse Build Action specifically.
 */
Build.fromJSON = function(json, main = false) {
    const build = new Build(parseTime(json.time), json.unit, json.count || 1);
    let i;

    build.setIsMain(main);

    if(json.actions !== undefined) {
        for(i = 0; i < json.actions.length; i++) {
            build.addAction(Action.fromJSON(json.actions[i]));
        }
    }

    return build;
};
