FROM ubuntu:18.04
RUN apt-get update &&                                                       \
    apt-get install -y curl                                                 \
    curl -sL https://deb.nodesource.com/setup_13.x | bash - &&              \
    ln -fs /usr/share/zoneinfo/America/Montreal /etc/localtime &&           \
    export DEBIAN_FRONTEND=noninteractive &&                                \
    apt-get install -y                                                      \
        asterisk                                                            \
        asterisk-prompt-fr-armelle                                          \
        perl                                                                \
        nodejs                                                              \
        npm                                                                 \
        rsync                                                               \
        tzdata &&                                                           \
    apt upgrade -y &&                                                       \
    dpkg-reconfigure --frontend noninteractive tzdata &&                    \
    npm install -g typescript
COPY ./ /initial
RUN chmod +x /initial/container/start
ARG CONFIG_FILE
RUN test -n "${CONFIG_FILE}" || (echo "CONFIG_FILE docker argument is required to be nonempty." >&2; false)
COPY $CONFIG_FILE /initial/config
RUN /initial/update.sh container-init --conf /initial/config
ENTRYPOINT /initial/container/start
