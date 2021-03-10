#!/bin/bash

PROJECTDIR=$(realpath `dirname $0`)
PROJECTDIR=$(dirname $PROJECTDIR)

pushd $PROJECTDIR

VERSION=$(cat $PROJECTDIR/package.json | jq -M .version | sed -e 's/"//g')
FILENAME="$PROJECTDIR/dist/ray-proxy-standalone-$VERSION.tgz"

BUILD_STANDALONE=1 node $PROJECTDIR/scripts/build.js prod

pushd "$PROJECTDIR/dist"

tar czf "$FILENAME" ray-proxy.standalone.js ray-proxy.config.js

popd

popd
