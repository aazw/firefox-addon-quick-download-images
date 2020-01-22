#!/bin/bash

set -eu

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $DIR/../addon

zip ../firefox-addon.xpi \
    manifest.json \
    addon.js \
    background.js \
    images/icon-48.png \
    images/icon-96.png \
    images/save.png
