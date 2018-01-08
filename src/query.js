const Rx = require("rxjs");
const Observable = Rx.Observable;
const Subscriber = Rx.Subscriber;

module.exports = client => (gql, variables) => {
  const query = client.watchQuery({ query: gql, variables });
  const query$ = Observable.from(query);

  const cursor$ = new Subscriber(cursor => {
    query.fetchMore({
      variables: Object.assign({}, variables, { cursor }),
      updateQuery: (prev, next) => next.fetchMoreResult // sets the value for query$.next()
    });
  });

  return query$
    .takeWhile(result => result.data.results.edges.length > 0) // trigger complete after the last page query returns no results
    .do(result => cursor$.next(result.data.results.pageInfo.cursor)) // extract cursors here so that paging stops if query$ ends
    .flatMap(result => result.data.results.edges); // unroll results array into individual items
};
