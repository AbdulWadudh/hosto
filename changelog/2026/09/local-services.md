# Postgres and object storage start with the dev server

`bun run dev` brings Docker up and waits for health before Next starts.

## Why

A dev server that boots against a database which is not listening fails later, further from
the cause, and usually looks like an application bug.

## How

`docker compose up -d --wait` then `docker compose run --rm rustfs-bucket`, then `next dev`,
chained on success. PostgreSQL 18 and RustFS, an S3-compatible store, both carry
healthchecks.

Host ports are 5432 for Postgres and **9010 / 9011** for the RustFS API and console. 9000
and 9001 were already taken on the development machine by an unrelated container.

## What was measured

An S3 round trip — put, list, get, delete — against the `hosto-assets` bucket. The bucket is
created by a one-shot job that is idempotent and runs on every start.

## What was rejected

**Leaving the bucket bootstrap in the default Compose profile.** `docker compose up --wait`
exits non-zero when any service it started has exited, even with status 0, so a one-shot job
cannot live beside `--wait`. It now sits behind a `bootstrap` profile and is invoked with
`docker compose run --rm`.

**`minio/mc` for the bucket bootstrap.** No longer pullable from Docker Hub, and the quay.io
mirror returns 401 without credentials. `amazon/aws-cli` is larger but reliably available.

**A `postgres:17` image** to avoid the PGDATA move. 18 is current; the volume mounts at
`/var/lib/postgresql` rather than `/var/lib/postgresql/data`, which is the only adjustment
needed.
