#!/usr/bin/env bash

SCRIPT_DIR=$(dirname $0)

(
  cd $SCRIPT_DIR
  mkdir -p dist
  rm -rf dist/**
  npm run build:release
)
