"use strict";

require("./src/telnyx-rtc.js");

// require all modules follwing spec pattern
// pass `true` for recursive
var context = require.context("./src", true, /\.spec\.js$/);

context.keys().forEach(context);
