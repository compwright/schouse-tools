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
  zap: {
    boolean: true,
    alias: "f",
    description: "Send to Zapier"
  },
  json: {
    boolean: true,
    description: "Stream to STDOUT in JSON format"
  }
};

exports.handler = function(argv) {
  const variables = pick(argv, ["since", "jurisdiction", "session"]);

  const bill$ = queryBills(variables).share();

  if (argv.json) {
    bill$.subscribe(subscribers.jsonWriter());
  }

  if (argv.zap) {
    bill$.bufferCount(100).subscribe(
      subscribers.post({
        url: "https://hooks.zapier.com/hooks/catch/148960/8rallv/",
        onSuccess: () => process.stdout.write(".".green),
        onError: () => process.stdout.write(".".red),
        onFinished: () => process.stdout.write("\n")
      })
    );
  }

  if (!argv.json && !argv.zap) {
    bill$.count().subscribe(subscribers.log());
  }
};
