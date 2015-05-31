var fs = require("fs");
var os = require("os");
var _ = require("lodash");
var async = require("async");
var dns = require("native-dns");
var child_process = require("child_process");

async.parallel({
    AEROSPIKE_IPADDRESS: function(fn){
        if(_.has(process.env, "AEROSPIKE_IPADDRESS"))
            return fn(null, process.env.AEROSPIKE_IPADDRESS);

        var question = dns.Question({
          name: [os.hostname(), process.env.CS_CLUSTER_ID, "containership"].join("."),
          type: "A"
        });

        var req = dns.Request({
            question: question,
            server: { address: "127.0.0.1", port: 53, type: "udp" },
            timeout: 2000
        });

        req.on("timeout", function(){
            return fn();
        });

        req.on("message", function (err, answer) {
            var address;
            answer.answer.forEach(function(a){
                address = a.address;
            });

            return fn(null, address);
        });

        req.send();
    },

    AEROSPIKE_MESH_ADDRESSES: function(fn){
        if(_.has(process.env, "AEROSPIKE_MESH_ADDRESSES"))
            return fn(null, process.env.AEROSPIKE_MESH_ADDRESSES.split(","));

        var question = dns.Question({
          name: ["followers", process.env.CS_CLUSTER_ID, "containership"].join("."),
          type: "A"
        });

        var req = dns.Request({
            question: question,
            server: { address: "127.0.0.1", port: 53, type: "udp" },
            timeout: 2000
        });

        req.on("timeout", function(){
            return fn();
        });

        req.on("message", function (err, answer) {
            var addresses = [];
            answer.answer.forEach(function(a){
                addresses.push(a.address);
            });

            return fn(null, addresses);
        });

        req.send();
    }
}, function(err, aerospike){
    _.merge(aerospike, process.env);

    _.defaults(aerospike, {
        AEROSPIKE_FABRIC_PORT: 3001,
        AEROSPIKE_FD_MAX: 15000,
        AEROSPIKE_FILESIZE: "4G",
        AEROSPIKE_HEARTBEAT_INTERVAL: 150,
        AEROSPIKE_HEARTBEAT_PORT: 3002,
        AEROSPIKE_HEARTBEAT_TIMEOUT: 10,
        AEROSPIKE_INFO_PORT: 3003,
        AEROSPIKE_IPADDRESS: "127.0.0.1",
        AEROSPIKE_MEMORY_SIZE: "1G",
        AEROSPIKE_MESH_ADDRESSES: [],
        AEROSPIKE_NAMESPACE: "ContainerShip",
        AEROSPIKE_REPLICATION_FACTOR: 2,
        AEROSPIKE_SINGLE_REPLICA_LIMIT: 1,
        AEROSPIKE_SERVICE_PORT: 3000,
        AEROSPIKE_SERVICE_THREADS: 4,
        AEROSPIKE_TRANSACTION_QUEUES: 4,
        AEROSPIKE_TRANSACTION_THREADS_PER_QUEUE: 4,
        AEROSPIKE_TTL: "5d"
    });

    if(_.isEmpty(aerospike.AEROSPIKE_MESH_ADDRESSES))
        aerospike.AEROSPIKE_MESH_ADDRESSES = [ aerospike.AEROSPIKE_IPADDRESS ];

    aerospike.AEROSPIKE_MESH_ADDRESSES = _.map(aerospike.AEROSPIKE_MESH_ADDRESSES, function(address){
        return [ "        mesh-seed-address-port", address, aerospike.AEROSPIKE_HEARTBEAT_PORT ].join(" ");
    }).join("\n");

    fs.readFile([__dirname, "aerospike.template"].join("/"), function(err, config){
        config = config.toString();
        _.each(aerospike, function(value, key){
            if(key.indexOf("AEROSPIKE") == 0){
                var regex = new RegExp(key, "g");
                config = config.replace(regex, value);
            }
        });

        fs.writeFile(process.env.AEROSPIKE_CONFIG, config, function(err){
            if(err)
                process.exit(1);

            child_process.spawn("/usr/bin/asd", [ "--foreground" ], {
                stdio: "inherit"
            }).on("error", function(err){
                process.stderr.write(err);
            });
        });
    });
});
