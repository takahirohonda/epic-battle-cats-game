# Epic Battle Cats Game 🙀😾😼🐈

# REFERENCE

## (1) Project creation

Created projects with Nx with the commands below.

```bash
yarn init -y
npx nx@latest init --preset=apps
yarn add -D @nx/react
nx g @nx/react:app apps/react-app

yarn add -D @nx/node
yarn nx g @nx/node:app apps/node-app

yarn add -D @nx/next
yarn nx g @nx/next:app apps/next-app

yarn nx g @nx/react:lib libs/react-components
yarn nx g @nx/next:lib libs/common-utils
yarn nx g @nx/node:lib libs/node-app
```

### Adding Drizzle to use Turso

```bash
yarn add drizzle-orm @libsql/client
yarn add -D drizzle-kit
```

### Troubleshooting with Drizzle

When we run drizzle commands with Nx like this, `nx run next-app:drizzle-kit -- generate --config=apps/next-app/drizzle.config.ts`, the terminal is not interactive.

This is likely to be: `Running commands via nx run or nx exec can cause these issues because the terminal may not be fully "attached" or interactive.`.

The solution is to run the direct commands.

```bash
yarn drizzle-kit generate --config=apps/next-app/drizzle.config.ts
```

TS_NODE_PROJECT=tsconfig.ts-node.json node --loader ts-node/esm --experimental-specifier-resolution=node apps/next-app/src/drizzle/mockData/insertMocks.ts

"type": "module"
