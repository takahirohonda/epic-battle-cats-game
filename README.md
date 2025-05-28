# Epic Battle Cats Game 🙀😾😼🐈

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
