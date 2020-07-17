FROM hasura/graphql-engine:v1.3.0-beta.4
ENV HASURA_GRAPHQL_ENABLE_CONSOLE=true
CMD graphql-engine \
    --database-url $DATABASE_URL \
    serve \
    --server-port $PORT
