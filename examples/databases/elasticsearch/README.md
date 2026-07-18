# Elasticsearch Template

This template gives you a standalone Elasticsearch environment for local development.

## Quickstart

```bash
loom init db-elasticsearch --dir my-elasticsearch
cd my-elasticsearch
loom start
loom status
```

## Service

- `db`
  - Runtime: `${ELASTICSEARCH_IMAGE:-docker.elastic.co/elasticsearch/elasticsearch:8.17.0}`
  - Ports: `9200`, `9300`

## Route

- None

## Image overrides

- `ELASTICSEARCH_IMAGE`