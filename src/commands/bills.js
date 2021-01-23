const config = require("config");
const pick = require("lodash/pick");
const client = require("../client")(config.get("openstates.apiKey"));
const query = require("../query")(client);
const queryBills = require("../queries/bills")(query);
const subscribers = require("../subscribers");

exports.command = "bills [options]";

exports.describe = "Get bills";

exports.builder = {
  since: {
    type: "string",
    alias: "d",
    description: "Only bills updated after a date (YYYY-MM-DD)"
  },
  webhook: {
    boolean: true,
    description: "Send to Webhook"
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

  const bill$ = queryBills(variables).share();

  if (argv.csv) {
    bill$.subscribe(subscribers.csvWriter());
  } else if (argv.xml) {
    bill$.subscribe(subscribers.xmlWriter());
  } else if (argv.json) {
    bill$.subscribe(subscribers.jsonWriter());
  } else if (argv.webhook) {
    bill$.bufferCount(100).subscribe(
      subscribers.post({
        url: config.get('webhook.url'),
        onSuccess: () => process.stdout.write(".".green),
        onError: () => process.stdout.write(".".red),
        onFinished: () => process.stdout.write("\n")
      })
    );
  } else {
    bill$.count().subscribe(subscribers.log());
  }
};
