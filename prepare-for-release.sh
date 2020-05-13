#!/usr/bin/env bash

SCRIPT_DIR=$(dirname $0)

(
  cd $SCRIPT_DIR
  npm run build
  mkdir -p dist
  rm -rf dist/**
  cp -rv build/** dist/
)
