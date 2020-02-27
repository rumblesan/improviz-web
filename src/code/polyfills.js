URL.fromLocation = function() {
  return new URL(window.location.href);
};

URL.prototype.copy = function() {
  return new URL(this.href);
};

URL.setHash = function(hash) {
  window.location.hash = hash;
};

URL.getHash = function() {
  return window.location.hash.substring(1);
};
