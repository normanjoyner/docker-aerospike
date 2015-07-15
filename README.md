docker-aerospike
==============

##About

###Description
Docker image designed to run an Aerospike cluster on ContainerShip

###Author
ContainerShip Developers - developers@containership.io

##Usage
This image is designed to run Aerospike on a ContainerShip cluster. Running this image elsewhere is not recommended as the container may be unable to start.

###Configuration
This image will run as-is, with no additional environment variables set. For clustering to work properly, start the application in host networking mode. There are various optionally configurable environment variables:

* `AEROSPIKE_SINGLE_REPLICA_LIMIT` - If the cluster size is less than or equal to this value, only one copy of the data (no replicas) will be kept in the cluster.
* `AEROSPIKE_SERVICE_THREADS` - Number of threads receiving client requests on the network interface.
* `AEROSPIKE_TRANSACTION_QUEUES` - Number of transaction queues managing client requests. Service threads will dispatch transactions into those queues (round robin).
* `AEROSPIKE_TRANSACTION_THREADS_PER_QUEUE` - Number of threads per transaction queue. Those threads will consume the requests from the transaction queues.
* `AEROSPIKE_SERVICE_PORT` - Maximum number of open file descriptors opened on behalf of client connections.
* `AEROSPIKE_IPADDRESS` - Address that will be published for clients to connect. ContainerShip sets this automatically.
* `AEROSPIKE_SERVICE_PORT` - The port at which the server listens for client connections.
* `AEROSPIKE_HEARTBEAT_PORT` - Multicast Port for cluster-state communication. Applies only when mode is multicast.
* `AEROSPIKE_MESH_ADDRESSES` - These are other addresses from the cluster that Aerospike will bootstrap from. ContainerShip sets these automatically.
* `AEROSPIKE_HEARTBEAT_INTERVAL` - Interval in milliseconds in which heartbeats are sent.
* `AEROSPIKE_HEARTBEAT_TIMEOUT` - Number of missing heartbeats after which the remote node will be declared dead.
* `AEROSPIKE_FABRIC_PORT` - Port for inter-node communication within a cluster.
* `AEROSPIKE_INFO_PORT` - Port used for info management. Responds to ASCII commands.
* `AEROSPIKE_NAMESPACE` - Default namespace. Set to ContainerShip by default.
* `AEROSPIKE_REPLICATION_FACTOR` - Number of copies of a record (including the master copy) maintained in the entire cluster.
* `AEROSPIKE_MEMORY_SIZE` - Maximum amount of memory for the namespace. Defaults to 1G.
* `AEROSPIKE_TTL` - Default time-to-live (in seconds) for a record from the time of creation or last update. The record will expire in the system beyond this time. Defaults to 5d.
* `AEROSPIKE_FILESIZE` - Maximum size for each file storage defined in this namespace. Defaults to 4G.

See the [official Aerospike Docs](http://www.aerospike.com/docs/reference/configuration/) for more information about these parameters!

### Recommendations
* On your ContainerShip cluster, run this application using the `constraints.per_node=1` tag. Each node in your cluster will run an instance of Aerospike, creating a cluster of `n` hosts, where `n` is the number of follower hosts in your ContainerShip cluster.
* Start the application with `container_volume=/opt/aerospike/data` and `host_volume=/mnt/aerospike` so data is persisted to the host system in case your container crashes. Additionally, by bind-mounting the volume, your data will be available for backup from ContainerShip Cloud.

##Contributing
Pull requests and issues are encouraged!
