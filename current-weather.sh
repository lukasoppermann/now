#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Local Weather
# @raycast.mode inline
# @raycast.refreshTime 15m

# Optional parameters:
# @raycast.icon ☀️
# @raycast.packageName Current Weather

# Documentation:
# @raycast.description Shows the current local weather, favorite to have a constant weather update
# @raycast.author lukasoppermann
# @raycast.authorURL https:#twitter.com/lukasoppermann

# get your ip
IP=$(dig -4 TXT +short o-o.myaddr.l.google.com @ns1.google.com | sed -r 's/^"|"$//g')

# configure
UNIT="m" # celsius
# UNIT="u" # fahrenheit

# Automatic location
LOCATION=$(curl --silent "https://ipapi.co/${IP}/postal/") # automatic location
CITY=$(curl --silent "https://ipapi.co/${IP}/city/") # for output
# Manual location
# LOCATION="Berlin" # use this if you want to manually set your location
# CITY="${LOCATION}" 

curl --silent "https://wttr.in/${LOCATION}?format=${CITY}:+%c+%f+%w&${UNIT}"