#!/bin/sh

http-server &
jsx -w -x jsx src/program/ui src/program/ui_compiled
