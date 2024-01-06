const { toXML } = require('jstoxml');
const {Subscriber} = require('rxjs');

module.exports = () => {
  var first = true;
  return new Subscriber({
    next: data => {
      if (first) {
        console.log('<?xml version="1.0" encoding="utf-8"?>');
        console.log('<results>');
        first = false;
      }
      console.log('<result>' + toXML(data) + '</result>');
    },
    complete: () => {
      console.log('</results>');
    }
  });
};
