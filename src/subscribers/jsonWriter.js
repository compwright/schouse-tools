const {Subscriber} = require('rxjs');

module.exports = () => {
  var first = true;
  return new Subscriber({
    next: bill => {
      first && console.log("[");
      first || console.log(",");
      console.log(JSON.stringify(bill));
      first = false;
    },
    complete: () => {
      first && console.log("[");
      console.log("]");
    }
  });
};
