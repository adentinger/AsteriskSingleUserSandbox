#!/bin/bash

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_ROOT_DIR="${THIS_SCRIPT_DIR}"
ASTERISK_DIR="${GIT_ROOT_DIR}/asterisk"
INSTALL_ASTERISK_DIR="/etc/asterisk"
DATA_DIR="${GIT_ROOT_DIR}/data"
MOH_DIR="${DATA_DIR}/music-on-hold"
INSTALL_MOH_DIR="/usr/share/asterisk/moh"

if [ "$(whoami)" != root ]; then
    echo Must be root >&2
    exit 1
fi

rsync -Pruz --delete-after "${ASTERISK_DIR}/" "${INSTALL_ASTERISK_DIR}"
rsync -Pruz --delete-after "${MOH_DIR}/" "${INSTALL_MOH_DIR}"
chown -R asterisk "${INSTALL_ASTERISK_DIR}"
chgrp -R asterisk "${INSTALL_ASTERISK_DIR}"
chmod -R 640 "${INSTALL_ASTERISK_DIR}"

asterisk -rx 'core reload'
