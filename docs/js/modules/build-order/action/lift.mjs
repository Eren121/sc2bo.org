export { Lift };

class Lift extends Action {
    constructor(time) {
        super(time);
    }

    getDescription() {
        return "Lift";
    }
}