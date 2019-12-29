export default class UUID {
    static next() {
        if(UUID._nextUUID == undefined) {
            UUID._nextUUID = 0;
        }

        UUID._nextUUID++;
        return UUID._nextUUID;
    }
}