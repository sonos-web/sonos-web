/**
 * Returns a string formatted like so:
 * 20 -> "0:20", 134 -> "2:14", 512 -> "6:07",
 * 1356 -> "22:36", 2000 -> "33:20", 5150 -> "1:25:50"
 * @returns {String}
 */
export default function secondsToTimeString(seconds) {
  if (seconds !== null || seconds !== undefined) {
    return new Date(1000 * seconds).toISOString().substr(11, 8).replace(/^[:0]{1,4}/, '');
  }
  return '';
}
