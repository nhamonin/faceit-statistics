export default function calculateFaceitDataAPILoad(Faceit) {
  Faceit.prototype.counter = 0;
  Faceit.prototype.hour = null;

  Object.getOwnPropertyNames(Faceit.prototype).forEach((name) => {
    Faceit.prototype['_' + name] = Faceit.prototype[name];
    Faceit.prototype[name] = function () {
      const result = this['_' + name](...arguments);
      ++Faceit.prototype._counter;
      return result;
    };
  });

  setInterval(() => {
    const date = new Date();
    const hour = date.getHours();
    if (!Faceit.prototype._hour) {
      Faceit.prototype._hour = hour;
    }
    if (Faceit.prototype._hour && Faceit.prototype._hour !== hour) {
      console.log(Faceit.prototype._counter / 2);
      Faceit.prototype._counter = 0;
      Faceit.prototype._hour = hour;
    }
  }, 3000);
}
