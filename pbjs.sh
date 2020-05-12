#!/bin/bash

# Generates JS/TS objects with pbjs for the protoc descriptors which ts-proto
# uses to understand the incoming protoc codegen request objects.
#
# I.e. currently the shipped plugin uses pbjs-generated types of the protobuf DTOs
# at _build-time_ to enerate its output ts-proto types. At somepoint we could become
# self-hosted, i.e. use our own ts-proto-generated types, which would be spiffy but
# not a big deal.

mkdir -p build
npx pbjs --force-message -t static-module -o build/pbjs.js \
  protos/google/protobuf/descriptor.proto \
  protos/google/protobuf/compiler/plugin.proto
npx pbts --no-comments -o build/pbjs.d.ts build/pbjs.js


