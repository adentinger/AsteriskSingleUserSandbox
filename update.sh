#!/bin/bash -e

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMON_SCRIPT="${THIS_SCRIPT_DIR}/scripts/common"
THIS_SCRIPT_BASENAME="$(basename "${BASH_SOURCE[0]}")"

# Run common script.
source "${COMMON_SCRIPT}"

# Parse other scripts.
source "${SCRIPTS_DIR}/ami-client"
source "${SCRIPTS_DIR}/asterisk"
source "${SCRIPTS_DIR}/container"
source "${SCRIPTS_DIR}/moh"
source "${SCRIPTS_DIR}/systemd"
source "${SCRIPTS_DIR}/templates"
source "${SCRIPTS_DIR}/datadir"
source "${SCRIPTS_DIR}/voicemail"

usage() {
    echo "USAGE" >&2
    echo "${THIS_SCRIPT_BASENAME} (-h | --help)" >&2
    echo "" >&2
    echo "${THIS_SCRIPT_BASENAME} container (-c | --conf) <file>" >&2
    echo "" >&2
    echo "${THIS_SCRIPT_BASENAME} container-init (-c | --conf) <file>" >&2
    echo "" >&2
    echo "${THIS_SCRIPT_BASENAME} install (-c | --conf) <file>" >&2
    echo "" >&2
    echo "" >&2
    echo "OPTIONS" >&2
    echo "" >&2
    echo "  -h | --help Prints this help message and exit." >&2
    echo "" >&2
    echo "container:" >&2
    echo "  Create and start a docker container, rather than installing on system." >&2
    echo "  -c | --conf <file> Specifies the configuration file." >&2
    echo "" >&2
    echo "container-init:" >&2
    echo "  To be ran inside a container." >&2
    echo "  -c | --conf <file> Specifies the configuration file." >&2
    echo "" >&2
    echo "install:" >&2
    echo "  Install on local system." >&2
    echo "  -c | --conf <file> Specifies the configuration file." >&2
    echo "  -d | --docker Create and start a docker container, rather than installing" >&2
    echo "    installing on system." >&2
    echo "" >&2
    echo "" >&2
    echo "NOTES" >&2
    echo "" >&2
    echo "The configuration file should be a file where each non-empty" >&2
    echo "line looks like var=value." >&2
    echo "Required template variables:" >&2
    echo >&2
    for templateVar in "${TEMPLATE_VARS[@]}"; do
        echo "${templateVar}: ${TEMPLATE_VARS_AND_DESC[${templateVar}]}" >&2
        echo >&2
    done
}

parseArgs() {
    if [ $# -lt 1 ]; then
        usage
        exit 1
    fi

    local arg="${1}"
    case "${arg}" in
    --help | -h)
        usage
        exit 0
        ;;
    container)
        shift
        parseContainerArgs "$@"
        ;;
    container-init)
        shift
        parseContainerInitArgs "$@"
        ;;
    install)
        shift
        parseInstallArgs "$@"
        ;;
    *)
        messageError "Unknown argument \"${arg}\"."
        usage
        exit 1
        ;;
    esac
}

parseContainerArgs() {
    MODE=container
    while [ $# -gt 0 ]; do
        local arg="${1}"
        case "${arg}" in
        --conf | -c)
            if [ $# -lt 2 ]; then
                messageError "Missing argument after \"${arg}\"."
                usage
                exit 1
            fi
            VAR_CONFIG_FILE="${2}"
            shift 2
            ;;
        *)
            messageError "Unknown argument \"${arg}\"."
            ;;
        esac
    done

    if [ "${VAR_CONFIG_FILE}" == "" ]; then
        messageError "--conf argument missing."
        usage
        exit 1
    fi
}

parseContainerInitArgs() {
    MODE=container-init
    while [ $# -gt 0 ]; do
        local arg="${1}"
        case "${arg}" in
        --conf | -c)
            if [ $# -lt 2 ]; then
                messageError "Missing argument after \"${arg}\"."
                usage
                exit 1
            fi
            VAR_CONFIG_FILE="${2}"
            shift 2
            ;;
        *)
            messageError "Unknown argument \"${arg}\"."
            ;;
        esac
    done

    if [ "${VAR_CONFIG_FILE}" == "" ]; then
        messageError "--conf argument missing."
        usage
        exit 1
    fi
}

parseInstallArgs() {
    MODE=install
    while [ $# -gt 0 ]; do
        local arg="${1}"
        case "${arg}" in
        --conf | -c)
            if [ $# -lt 2 ]; then
                messageError "Missing argument after \"${arg}\"."
                usage
                exit 1
            fi
            VAR_CONFIG_FILE="${2}"
            shift 2
            ;;
        *)
            messageError "Unknown argument \"${arg}\"."
            ;;
        esac
    done

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

install() {
    setupCleanupTrap
    parseVariableConfigFile
    updateAsteriskConfig
    updateMusicOnHold
    updateVoicemail
    updateDatadir
    updateAmiClient
}

runContainerMode() {
    setupCleanupTrap
    parseVariableConfigFile
    buildContainer
    startContainer
}

runContainerInitMode() {
    install
}

runInstallMode() {
    install
    updateSystemd
    restartAsterisk
}

main() {
    parseArgs "$@"

    case "${MODE}" in
    container)
        runContainerMode
        ;;
    container-init)
        runContainerInitMode
        ;;
    install)
        runInstallMode
        ;;
    *)
        echo "Bug in script: Unknown mode ${MODE}"
        ;;
    esac
}

main "$@"
