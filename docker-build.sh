#!/bin/bash
git rev-parse HEAD > gitCommit
docker build -t docker.scinorandex.xyz/scinorandex/scinbot .
docker push docker.scinorandex.xyz/scinorandex/scinbot