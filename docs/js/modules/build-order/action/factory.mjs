export default class ActionFactory {

    static get _actions() {
        if(ActionFactory._actionsMap === undefined) {
            ActionFactory._actionsMap = {};
        }

        return ActionFactory._actionsMap;
    }

    static registerAction(name, supplier) {
        ActionFactory._actions[name] = supplier;
    }

    static Build(name, json) {
        if(ActionFactory._actions[name] === undefined) {
            throw new TypeError("Invalid action type: " + name);
        }

        return ActionFactory._actions[name](json);
    }
}