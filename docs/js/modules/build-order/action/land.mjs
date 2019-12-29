export { Land };

class Land extends Action {
    #unit;

    constructor(time, unit) {
        super(time);
        this.setUnit(unit);
    }

    getUnit() { return this.#unit; }

    setUnit(unit) {
        as(unit, String);
        this.#unit = unit;
    }

    getDescription() {
        return "Land";
    }
}