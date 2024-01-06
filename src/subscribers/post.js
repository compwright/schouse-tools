const {Subscriber} = require("rxjs");
const fetch = require("node-fetch");

module.exports = ({ url, onSuccess, onError, onFinished }) => new Subscriber({
  next: records => {
    fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(records)
    })
      .then(onSuccess)
      .catch(onError);
  },
  complete: () => onFinished
});
