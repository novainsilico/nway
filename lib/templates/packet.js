/**
 * Packet declaration
 *
 * For name optimization consideration, all the main globals variables
 * are scoped in a function
 */
(function({{globals}}) {
var global = global ? global : window;
{{body}}
})({{globals}});