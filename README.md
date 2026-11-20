# Commerce and community platform — frontend

A Next.js and TypeScript application for product discovery, accounts, orders and community content, with administration screens for managing the platform. Apollo Client connects the interface to a GraphQL backend.

**Companion service:** [NestJS backend](https://github.com/Firdavs001100/Shop-Corner)

## Highlights

- Product browsing, filters, account and order flows.
- Community articles and member interactions.
- Administration screens for products, members, orders and content.
- Apollo queries, uploads and real-time integrations.

## Local development

Install dependencies with `yarn install`, configure the backend endpoints, then run:

```bash
yarn dev
```

The frontend reads `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_API_GRAPHQL_URL`. It also references `NEXT_APP_API_WS` for its WebSocket connection. The companion backend and MongoDB must be configured separately. The application scripts include `yarn build` and `yarn lint`.

Setup and builds were not rerun as part of this documentation update.
