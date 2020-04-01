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
        tzdata &&                                                           \
    apt upgrade -y &&                                                       \
    dpkg-reconfigure --frontend noninteractive tzdata &&                    \
    npm install -g typescript
