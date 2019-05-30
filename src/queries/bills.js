const gql = require("graphql-tag");

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

module.exports = (query) => (variables) => query(BILLS_QUERY, variables)
.map(edge => ({
  bill: edge.node.bill,
  type: edge.node.type[0],
  title: edge.node.title,
  session: edge.node.session.identifier,
  sponsors: edge.node.sponsors.map(sponsor => sponsor.name).join(", "),
  url: edge.node.sources[0].url
}));

module.exports.BILLS_QUERY = BILLS_QUERY;
