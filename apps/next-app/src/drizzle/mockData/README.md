# Insert mock data

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
export TURSO_DATABASE_URL=
export TURSO_AUTH_TOKEN=

# execute
TS_NODE_PROJECT=tsconfig.ts-node.json node --loader ts-node/esm --experimental-specifier-resolution=node apps/next-app/src/drizzle/mockData/insertMocks.ts
```

I had to add `"type": "module",` in `package.json`
Make sure to remove it, otherwise other apps not gonna work...
