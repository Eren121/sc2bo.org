class UUID {
    static _nextUUID = 0;

    static next() {
        UUID._nextUUID++;
        return UUID._nextUUID;
    }
}