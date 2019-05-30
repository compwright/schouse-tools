const gql = require("graphql-tag");
const fromPairs = require("lodash/fromPairs");

const ALL_VOTES_QUERY = gql`
  query AllVotes(
    $cursor: String,
    $since: String,
    $jurisdiction: String,
    $session: String
  ) {
    results: bills(
      first: 100,
      after: $cursor,
      updatedSince: $since,
      jurisdiction: $jurisdiction,
      session: $session
    ) {
      pageInfo {
        hasNextPage
        cursor: endCursor
      }
      edges {
        node {
          bill: identifier
          session: legislativeSession {
            identifier
          }
          votes {
            edges {
              node {
                chamber: organization {
                  name
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
    }
  }
`;

module.exports = (query) => (variables) => query(ALL_VOTES_QUERY, variables)
.flatMap(edge => edge.node.votes.edges.map(vote => ({
  session: edge.node.session.identifier,
  chamber: vote.node.chamber.name,
  bill: edge.node.bill,
  date: vote.node.date,
  motion: vote.node.motion,
  result: vote.node.result,
  totals: fromPairs(
    vote.node.totals.map(({ vote, total }) => ([vote, total]))
  ),
  detail: vote.node.detail.map(({ legislator, vote }) => ({ legislator, vote })),
  url: vote.node.sources[0].url
})));

module.exports.ALL_VOTES_QUERY = ALL_VOTES_QUERY;
