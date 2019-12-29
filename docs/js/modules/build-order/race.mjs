export { TERRAN, PROTOSS, ZERG, isRace };

/**
 * enum-like (javascript...) Race
 */

const TERRAN = 'Terran';
const PROTOSS = 'Protoss';
const ZERG = 'Zerg';

function isRace(r) {
    return r === TERRAN || r === PROTOSS || r === ZERG;
}
