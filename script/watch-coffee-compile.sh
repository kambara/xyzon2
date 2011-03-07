#!/bin/sh

COFFEE_DIR=public/coffee

./script/coffee-compile.sh
while inotifywait -q -e create,delete,modify,move $COFFEE_DIR
do
    clear
    ./script/coffee-compile.sh
done