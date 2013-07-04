var link;
var injected = exports.injected = false;
var location = exports.location = "{{location}}";

exports.inject = inject;
exports.eject  = eject;

function inject(media, done) {
  if(injected) eject();
  link        = document.createElement("link");
  link.type   = "text/css";
  link.media  = media || "all";
  link.href   = location;
  link.rel    ="stylesheet"
  var script  = document.getElementsByTagName("script")[0];

  if('function' == typeof done) {
    link.addEventListener('load',done)
  }

  injected    = true;
  script.parentNode.insertBefore(link, script);
}

function eject() {
  if(!injected) return;
  link.parentNode.removeChild(link);
  link = undefined;
  injected = false;
}
