#!/bin/bash
git submodule update --init --recursive
git checkout master && git submodule foreach --recursive "git checkout master"
npm install
cd readium-js && npm install && cd readium-shared-js && npm install
