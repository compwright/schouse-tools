const fetch = require("node-fetch");
const ApolloClient = require("apollo-client").ApolloClient;
const HttpLink = require("apollo-link-http").HttpLink;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;
const gql = require("graphql-tag");
const Rx = require("rxjs");
const colors = require("colors");
const Observable = Rx.Observable;
const Subscriber = Rx.Subscriber;

const client = new ApolloClient({
  link: new HttpLink({
    fetch: fetch,
    uri: "http://alpha.openstates.org/graphql",
    headers: {
      "X-API-KEY": "6fbda182-6f0c-4440-8df3-052d7e985937"
    }
  }),
  cache: new InMemoryCache()
});

const BILLS_QUERY = gql`
  query Bills($cursor: String) {
    bills(
      first: 100
      after: $cursor
      jurisdiction: "South Carolina"
      session: "2017-2018"
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

function paginatedQuery(gql, key, variables) {
  const query = client.watchQuery({ query: gql, variables });
  const query$ = Observable.from(query);

  const cursor$ = new Subscriber(cursor => {
    query.fetchMore({
      variables: Object.assign({}, variables, { cursor }),
      updateQuery: (prev, next) => next.fetchMoreResult // sets the value for query$.next()
    });
  });

  return query$
    .takeWhile(result => result.data[key].edges.length > 0) // trigger complete after the last page query returns no results
    .do(result => cursor$.next(result.data[key].pageInfo.cursor)) // extract cursors here so that paging stops if query$ ends
    .flatMap(result => result.data[key].edges) // unroll results array into individual items
    .map(edge => edge.node)
    .share();
}

function jsonWriter() {
  var first = true;
  return new Subscriber({
    next: bill => {
      first && console.log("[");
      first || console.log(",");
      console.log(JSON.stringify(bill));
      first = false;
    },
    complete: () => {
      console.log("]");
    }
  });
}

paginatedQuery(BILLS_QUERY, "bills")
  .map(bill => ({
    bill: bill.bill,
    type: bill.type[0],
    title: bill.title,
    session: bill.session.identifier,
    sponsors: bill.sponsors.map(sponsor => sponsor.name).join(", "),
    url: bill.sources[0].url
  }))
  .bufferCount(100)
  .subscribe({
    next: bills => {
      fetch("https://hooks.zapier.com/hooks/catch/148960/8rallv/", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(bills)
      })
        .then(() => process.stdout.write(".".green))
        .catch(() => process.stdout.write(".".red));
    },
    complete: () => {
      process.stdout.write("\n");
    }
  });
