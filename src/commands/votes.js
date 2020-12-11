const config = require("config");
const pick = require("lodash/pick");
const client = require("../client")(config.get("openstates.apiKey"));
const query = require("../query")(client);
const queryVotes = require("../queries/votes")(query);
const subscribers = require("../subscribers");

exports.command = "votes [options]";

exports.describe = "Get votes";

exports.builder = {
  bill: {
    type: "string",
    alias: "b",
    description: "Bill number"
  },
  unroll: {
    boolean: true,
    description: "Unroll votes by legislator"
  },
  json: {
    boolean: true,
    description: "Stream to STDOUT in JSON format"
  },
  csv: {
    boolean: true,
    description: "Stream to STDOUT in CSV format"
  }
};

exports.handler = function(argv) {
  const variables = pick(argv, ["jurisdiction", "session", "bill"]);

  let vote$ = queryVotes(variables);

  if (argv.unroll) {
    vote$ = vote$.flatMap(
      ({ detail, totals, ...edge }) => detail.map(
        (vote) => ({ ...vote, ...edge })
      )
    );
  }
  
  vote$ = vote$.share();

  if (argv.csv) {
    vote$.subscribe(subscribers.csvWriter());
  } else if (argv.json) {
    vote$.subscribe(subscribers.jsonWriter());
  } else {
    vote$.count().subscribe(subscribers.log());
  }
};
