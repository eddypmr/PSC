# Lunch
1. Lanzar zookeeper
```
zookeeper-server-start.bat ../../config/zookeeper.properties
```

2. Lanzar kafka server
```
kafka-server-start.bat ../../config/server.properties
```

3. Crear tópico
```
kafka-topics.bat --create --topic chat-topic --bootstrap-server localhost:9092 --partitions 3 --replication-factor 3
```

4. Lanzar server node
```
ts-node server
```

5. Lanzar cliente node con ombre
```
ts-node client [name]
```
