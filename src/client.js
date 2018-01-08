const fetch = require("node-fetch");
const ApolloClient = require("apollo-client").ApolloClient;
const HttpLink = require("apollo-link-http").HttpLink;
const InMemoryCache = require("apollo-cache-inmemory").InMemoryCache;

module.exports = apiKey =>
  new ApolloClient({
    link: new HttpLink({
      fetch: fetch,
      uri: "http://alpha.openstates.org/graphql",
      headers: {
        "X-API-KEY": apiKey
      }
    }),
    cache: new InMemoryCache()
  });
