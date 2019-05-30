const stringify = require('csv-stringify/lib/sync');
const Subscriber = require('rxjs').Subscriber;

module.exports = () => {
  var first = true;
  return new Subscriber({
    next: data => {
      if (first) {
        console.log(stringify([Object.keys(data)]).trim());
      }
      console.log(stringify([Object.values(data)]).trim());
      first = false;
    },
    complete: () => {}
  });
};
