#!/usr/bin/env bash
set -euo pipefail
docker build -t codebench-sandbox:latest packages/executor/sandbox
