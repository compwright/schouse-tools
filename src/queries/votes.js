const gql = require("graphql-tag");
const fromPairs = require("lodash/fromPairs");

const VOTES_QUERY = gql`
  query Votes(
    $cursor: String, 
    $jurisdiction: String, 
    $session: String, 
    $bill: String
  ) {
    results: bill(
      identifier: $bill, 
      jurisdiction: $jurisdiction, 
      session: $session
    ) {
      votes(
        first: 10, 
        after: $cursor
      ) {
        pageInfo {
          hasNextPage
          cursor: endCursor
        }
        edges {
          node {
            session: legislativeSession {
              identifier
            }
            chamber: organization {
              name
            }
            bill {
              identifier
            }
            date: startDate
            motion: motionText
            result
            totals: counts {
              vote: option
              total: value
            }
            detail: votes {
              legislator: voterName
              vote: option
            }
            sources {
              url
            }
          }
        }
      }
    }
  }  
`;

module.exports = (query) => (variables) => query(VOTES_QUERY, variables, 'results.votes')
.map(edge => ({
  session: edge.node.session.identifier,
  chamber: edge.node.chamber.name,
  bill: edge.node.bill.identifier,
  date: edge.node.date,
  motion: edge.node.motion,
  result: edge.node.result,
  totals: fromPairs(
    edge.node.totals.map(({ vote, total }) => ([vote, total]))
  ),
  detail: edge.node.detail.map(({ legislator, vote }) => ({ legislator, vote })),
  url: edge.node.sources[0].url
}));

module.exports.VOTES_QUERY = VOTES_QUERY;
