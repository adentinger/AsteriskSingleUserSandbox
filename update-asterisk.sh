#!/bin/bash

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_ROOT_DIR="${THIS_SCRIPT_DIR}"
ASTERISK_DIR="${GIT_ROOT_DIR}/asterisk"
INSTALL_ASTERISK_DIR="/etc/asterisk"

if [ "$(whoami)" != root ]; then
    echo Must be root >&2
    exit 1
fi

rsync -Pruz "${ASTERISK_DIR}"/* "${INSTALL_ASTERISK_DIR}"
chown -R asterisk "${INSTALL_ASTERISK_DIR}"
chgrp -R asterisk "${INSTALL_ASTERISK_DIR}"

echo $'sip reload\ndialplan reload\nexit' | asterisk -vvvvvvr
