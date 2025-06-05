#!/bin/bash

set -eu

# go to project root
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd $DIR/../addon

# packaging
zip ../firefox-addon.xpi \
	manifest.json \
	addon.js \
	background.js \
	options.css \
	options.html \
	options.js \
	images/icon-48.png \
	images/icon-96.png \
	images/save.svg \
	images/save.png
