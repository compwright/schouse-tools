const fetch = require("node-fetch");
const {ApolloClient} = require("apollo-client");
const {HttpLink} = require("apollo-link-http");
const {InMemoryCache} = require("apollo-cache-inmemory");

module.exports = apiKey =>
  new ApolloClient({
    link: new HttpLink({
      fetch: fetch,
      uri: "https://openstates.org/graphql",
      headers: {
        "X-API-KEY": apiKey
      }
    }),
    cache: new InMemoryCache()
  });
