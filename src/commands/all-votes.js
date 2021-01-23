const config = require("config");
const pick = require("lodash/pick");
const client = require("../client")(config.get("openstates.apiKey"));
const query = require("../query")(client);
const queryVotes = require("../queries/all-votes")(query);
const subscribers = require("../subscribers");

exports.command = "all-votes [options]";

exports.describe = "Get all votes";

exports.builder = {
  since: {
    type: "string",
    alias: "d",
    description: "Only votes for bills updated after a date (YYYY-MM-DD)"
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
  },
  xml: {
    boolean: true,
    description: "Stream to STDOUT in XML format"
  }
};

exports.handler = function(argv) {
  const variables = pick(argv, ["since", "jurisdiction", "session"]);

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
  } else if (argv.xml) {
    vote$.subscribe(subscribers.xmlWriter());
  } else if (argv.json) {
    vote$.subscribe(subscribers.jsonWriter());
  } else {
    vote$.count().subscribe(subscribers.log());
  }
};
