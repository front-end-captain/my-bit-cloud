#!/usr/bin/env bash

set -e

rm -rf libs/**/tsconfig.tsbuildinfo
rm -rf libs/**/*.log
rm -rf libs/**/.rush
rm -rf libs/**/dist


rm -rf aspects/**/tsconfig.tsbuildinfo
rm -rf aspects/**/*.log
rm -rf aspects/**/.rush
rm -rf aspects/**/dist


rm -rf apps/**/tsconfig.tsbuildinfo
rm -rf apps/**/*.log
rm -rf apps/**/.rush
rm -rf apps/**/dist

node common/scripts/install-run-rush.js -d update

