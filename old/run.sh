#!/bin/sh

node_modules/react-tools/bin/jsx -w -x jsx src/program/ui src/program/ui_compiled &
node_modules/http-server/bin/http-server
