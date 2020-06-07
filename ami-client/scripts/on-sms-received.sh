#!/bin/bash

# Removes CR and LF from string.
sanitize() {
    echo "${@}" | tr -d '\r\n'
}

EXTEN_TO=$(sanitize "${1}")
CALLERID_NAME=$(sanitize "${2}")
CALLERID_NUM=$(sanitize "${3}")
RECEIVED_BY=$(sanitize "${4}")
DATE=$(date +%s%N)
# The body is allowed to have multiple lines.
BODY="${5}"

SMS_DB_DIR=/var/spool/asterisk/sms
OUT_DIR="${SMS_DB_DIR}/${EXTEN_TO}"

if [ ! -d "${OUT_DIR}" ]; then
    mkdir -m 750 "${OUT_DIR}"
fi

SMS_FILE=$(mktemp -p "${OUT_DIR}" sms-XXXXXXXXXX.txt) || exit 1
echo "${EXTEN_TO}"      >> "${SMS_FILE}"
echo "${CALLERID_NAME}" >> "${SMS_FILE}"
echo "${CALLERID_NUM}"  >> "${SMS_FILE}"
echo "${RECEIVED_BY}"   >> "${SMS_FILE}"
echo "${DATE}"          >> "${SMS_FILE}"
echo "${BODY}"          >> "${SMS_FILE}"

echo "$(basename ${SMS_FILE})"
