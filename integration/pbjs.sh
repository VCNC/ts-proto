#!/bin/bash

# We generate pbjs files of our test files as known-good behavior for our test suite to use.
#
# Only a handful of integration tests use these so we hand-code it one-off.
#

# simple/
npx pbjs --force-message --force-number -t static-module -o integration/simple/pbjs.js integration/simple/simple.proto
npx pbts --no-comments -o integration/simple/pbjs.d.ts integration/simple/pbjs.js

# simple-long
npx pbjs --force-message --force-long -t static-module -o integration/simple-long/pbjs.js integration/simple-long/simple.proto
npx pbts --no-comments -o integration/simple-long/pbjs.d.ts integration/simple-long/pbjs.js

# vector-tile/
npx pbjs --force-message --force-number -t static-module -o integration/vector-tile/pbjs.js integration/vector-tile/vector_tile.proto
npx pbts --no-comments -o integration/vector-tile/pbjs.d.ts integration/vector-tile/pbjs.js

