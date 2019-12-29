export { formatTime, parseTime };

/**
 * Format input integer seconds to mm:ss format.
 */
function formatTime(seconds) {
    as(seconds, Number);

    let mins = Math.floor(seconds / 60);
    let secs = seconds % 60;

    if(mins < 10) mins = '0' + mins;
    if(secs < 10) secs = '0' + secs;

    return mins + ':' + secs;
}

/**
 * Reversed function
 */
function parseTime(mmSS) {
    as(mmSS, String);

    const array = mmSS.split(':');

    if(array.length === 1) {
        return parseInt(array[0]);
    } else if(array.length === 2) {
        return parseInt(array[0]) * 60 + parseInt(array[1]);
    } else {
        throw new TypeError("'"
            + mmSS
            + "' is not a valid 'mm:ss' time representation");
    }
}
