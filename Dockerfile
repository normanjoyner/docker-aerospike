FROM debian:7

MAINTAINER ContainerShip Developers <developers@containership.io>

# set environment variables
ENV AEROSPIKE_VERSION 3.5.9
ENV AEROSPIKE_SHA256 2dacf055d49e62d8be0a2508c11334a52a95982dc8389a7a93d36019d600c32c
ENV AEROSPIKE_CONFIG /etc/aerospike/aerospike.conf

# install dependencies
RUN apt-get update \
    && apt-get install -y ca-certificates curl logrotate wget \
    && wget "https://www.aerospike.com/artifacts/aerospike-server-community/${AEROSPIKE_VERSION}/aerospike-server-community-${AEROSPIKE_VERSION}-debian7.tgz" -O aerospike.tgz \
    && echo "$AEROSPIKE_SHA256 *aerospike.tgz" | sha256sum -c -

# extract aerospike
RUN mkdir aerospike
RUN tar xzf aerospike.tgz --strip-components=1 -C aerospike
RUN dpkg -i aerospike/aerospike-server-*.deb

# install npm & node
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get install nodejs -y
RUN curl https://www.npmjs.com/install.sh | sh
RUN npm install -g n
RUN n 0.10.38

# create /app and add files
WORKDIR /app
ADD . /app

# install dependencies
RUN npm install

# clean up
RUN apt-get purge -y --auto-remove wget ca-certificates
RUN rm -rf aerospike-server.tgz aerospike /var/lib/apt/lists/*

# Execute the run script in foreground mode
CMD node aerospike.js
