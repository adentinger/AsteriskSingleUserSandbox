#!/bin/bash -e

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMON_SCRIPT="${THIS_SCRIPT_DIR}/scripts/common"
THIS_SCRIPT_BASENAME="$(basename "${BASH_SOURCE[0]}")"

# Run common script.
source "${COMMON_SCRIPT}"

# Parse other scripts.
source "${SCRIPTS_DIR}/templates"
source "${SCRIPTS_DIR}/asterisk"
source "${SCRIPTS_DIR}/moh"

usage() {
    echo "Usage:" >&2
    echo "${THIS_SCRIPT_BASENAME} (-h | --help)" >&2
    echo "" >&2
    echo "${THIS_SCRIPT_BASENAME} (-c | --conf) <conf_file>" >&2
    echo "" >&2
    echo "" >&2
    echo "conf_file: A file where each non-empty line looks like var=value." >&2
}

parseArgs() {
    if [ $# -gt 0 ]; then
        local arg="${1}"
        case "${arg}" in
        --help | -h)
            usage
            exit 0
            ;;
        --conf | -c)
            if [ $# -lt 2 ]; then
                messageError "Missing argument after \"${arg}\"."
                usage
                exit 1
            fi
            VAR_CONFIG_FILE="${2}"
            ;;
        *)
            messageError "Unknown argument \"${arg}\"."
            usage
            exit 1
            ;;
        esac
    fi

    if [ "${VAR_CONFIG_FILE}" == "" ]; then
        messageError "--conf argument missing."
        usage
        exit 1
    fi
}

restartAsterisk() {
    message 'Restarting Asterisk.'
    systemctl restart asterisk.service
}

setupCleanupTrap() {
    trap cleanupTrapHandler EXIT
}

cleanupTrapHandler() {
    message "Running cleanup."
    cleanTemplateVariables
}

run() {
    parseArgs "$@"
    assertRoot
    setupCleanupTrap
    parseVariableConfigFile
    updateAsteriskConfig
    updateMusicOnHold
    restartAsterisk
}

run "$@"
