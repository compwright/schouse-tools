#!/usr/bin/env node

const yargs = require("yargs");
const colors = require("colors");
const config = require("config");

yargs
  .usage("$0 <cmd> [args]")
  .demandCommand(1, "No command specified")
  .commandDir("./commands")
  .options({
    jurisdiction: {
      default: config.get("openstates.jurisdiction"),
      description: "State legislature"
    },
    session: {
      default: config.get("openstates.session"),
      description: "State legislative session year"
    }
  })
  .help().argv;
