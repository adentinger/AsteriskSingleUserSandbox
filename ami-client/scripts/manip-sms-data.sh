#!/bin/bash

usage() {
    local programName=$(basename "${0}")
    echo "Usage:"
    echo "${programName} <sms_file> <fields_to_get>" >&2
    echo "${programName} <sms_file> (-s | --set) <field> <value>"
    echo "" >&2
    echo "<sms_file>: Absolute path." >&2
    echo "<filds_to_get>: One or more <field>." >&2
    echo "<field>: One of:"
    echo "  -t | --number-to" >&2
    echo "  -n | --callerid-name" >&2
    echo "  -u | --callerid-num" >&2
    echo "  -r | --received-by" >&2
    echo "  -d | --date" >&2
    echo "  -b | --body" >&2
}

parseNextHeaderArg() {
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

    -d | --date)
        DATE=yes
        ;;

    *)
        usage
        exit 1
        ;;

    esac
}

parseArgvGetting() {
    while [ "$#" -gt 0 ]; do
        parseNextHeaderArg "${1}"
        shift
    done
}

parseArgvSetting() {
    shift # Remove the "-s" argument.

    if [ ! $# -eq 2 ]; then
        usage
        exit 1
    fi

    parseNextHeaderArg "${1}"
    shift
    VALUE="${1}"
}

parseArgv() {
    if [ "$#" -lt 2 ]; then
        usage
        exit 1
    fi

    SMS_FILE="${1}"
    shift

    case "${1}" in
        -s | --set)
            IS_SETTING=yes
            ;;
    esac

    if [ "${IS_SETTING}" != "" ]; then
        parseArgvSetting "${@}"
    else
        parseArgvGetting "${@}"
    fi
}

runGet() {
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
    if [ "${DATE}" != "" ]; then
        head -n5 "${SMS_FILE}" | tail -n1
    fi
    if [ "${BODY}" != "" ]; then
        # Read rest of file, starting at line N.
        tail -n +6 "${SMS_FILE}"
    fi
}

runSet() {
    if [ "${NUMBER_TO}" != "" ]; then
        sed -i -e '1s|.*|'"${VALUE}"'|' "${SMS_FILE}"
    fi
    if [ "${CALLERID_NAME}" != "" ]; then
        sed -i -e '2s|.*|'"${VALUE}"'|' "${SMS_FILE}"
    fi
    if [ "${CALLERID_NUM}" != "" ]; then
        sed -i -e '3s|.*|'"${VALUE}"'|' "${SMS_FILE}"
    fi
    if [ "${RECEIVED_BY}" != "" ]; then
        sed -i -e '4s|.*|'"${VALUE}"'|' "${SMS_FILE}"
    fi
    if [ "${DATE}" != "" ]; then
        sed -i -e '5s|.*|'"${VALUE}"'|' "${SMS_FILE}"
    fi
    if [ "${BODY}" != "" ]; then
        # Write headers back, erasing the body.
        # Must be done in two steps (read first, then
        # write) since we change the file we're reading.
        local headers=$(head -n4 "${SMS_FILE}")
        echo "${headers}" > "${SMS_FILE}"
        # Write new body.
        echo -n "${VALUE}" >> "${SMS_FILE}"
    fi
}

run() {
    (
        if [ "${IS_SETTING}" != "" ]; then
            runSet
        else
            runGet
        fi
    ) | perl -pe 'chomp if eof' # Remove final line break.
}

parseArgv "${@}"
run
