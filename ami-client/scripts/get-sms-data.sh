#!/bin/bash

usage() {
    echo "Usage:"
    echo "${0} <sms_file> <fields_to_get>" >&2
    echo "" >&2
    echo "<sms_file>: Absolute path." >&2
    echo "<filds_to_get>: One or more of:" >&2
    echo "  -t | --number-to" >&2
    echo "  -n | --callerid-name" >&2
    echo "  -u | --callerid-num" >&2
    echo "  -r | --received-by" >&2
    echo "  -b | --body" >&2
}

parseArgv() {
    if [ "$#" -lt 2 ]; then
        usage
        exit 1
    fi

    SMS_FILE="${1}"
    shift

    while [ "$#" -gt 0 ]; do
        case "${1}" in

        -h | --help)
            usage
            exit 0
            ;;

        -t | --number-to)
            NUMBER_TO=yes
            ;;

        -n | --callerid-name)
            CALLERID_NAME=yes
            ;;

        -u | --callerid-num)
            CALLERID_NUM=yes
            ;;

        -r | --received-by)
            RECEIVED_BY=yes
            ;;

        -b | --body )
            BODY=yes
            ;;

        *)
            usage
            exit 1
            ;;

        esac

        shift
    done
}

run() {
    (
        if [ "${NUMBER_TO}" != "" ]; then
            head -n1 "${SMS_FILE}" | tail -n1
        fi
        if [ "${CALLERID_NAME}" != "" ]; then
            head -n2 "${SMS_FILE}" | tail -n1
        fi
        if [ "${CALLERID_NUM}" != "" ]; then
            head -n3 "${SMS_FILE}" | tail -n1
        fi
        if [ "${RECEIVED_BY}" != "" ]; then
            head -n4 "${SMS_FILE}" | tail -n1
        fi
        if [ "${BODY}" != "" ]; then
            # Read rest of file, starting at line N.
            tail -n +5 "${SMS_FILE}"
        fi
    ) | perl -pe 'chomp if eof' # Remove final line break.
}

parseArgv "${@}"
run
