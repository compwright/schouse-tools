const config = require("config");
const gql = require("graphql-tag");
const pick = require("lodash").pick;
const client = require("../client")(config.get("openstates.apiKey"));
const query = require("../query")(client);
const subscribers = require("../subscribers");

const BILLS_QUERY = gql`
  query Bills(
    $cursor: String
    $since: String
    $jurisdiction: String
    $session: String
  ) {
    results: bills(
      first: 100
      after: $cursor
      updatedSince: $since
      jurisdiction: $jurisdiction
      session: $session
    ) {
      pageInfo {
        hasNextPage
        cursor: endCursor
      }
      edges {
        node {
          bill: identifier
          type: classification
          title
          session: legislativeSession {
            identifier
          }
          sponsors: sponsorships {
            name
          }
          sources {
            url
          }
        }
      }
    }
  }
`;

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

  const bill$ = query(BILLS_QUERY, variables).map(edge => ({
    bill: edge.node.bill,
    type: edge.node.type[0],
    title: edge.node.title,
    session: edge.node.session.identifier,
    sponsors: edge.node.sponsors.map(sponsor => sponsor.name).join(", "),
    url: edge.node.sources[0].url
  })).share();

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
