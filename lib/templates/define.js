/**
 * Define uid:{{uid}} for {{path}}
 * @param  {function} require  The dedicated require function
 * @param  {object} module     The dedicated commonjs module object
 * @param  {object} exports    The dedicated commonjs export owner object
 * @param  {string} __dirname  Current module dirname
 * @param  {string} __filename Current module filename
 */
require.define('{{uid}}', function (require, module, exports, __dirname, __filename) {
{{body}}
});
