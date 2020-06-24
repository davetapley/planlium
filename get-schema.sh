#!/bin/bash
get-graphql-schema -h "x-hasura-admin-secret=$HASURA_ADMIN_SECRET" https://electric-man-71.hasura.app/v1/graphql > schema.graphql