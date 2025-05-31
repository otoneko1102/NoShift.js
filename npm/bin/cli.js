#!/usr/bin/env node
import { create } from "../commands/create.js";

const command = process.argv[2];

if (command === "create") {
  create();
} else {
  console.log("Unknown command.");
}
