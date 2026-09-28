# TJ Labs – Number Generator

My solution for the TJ Labs Next.js task. It has two screens: **Sign In** and **Zahlen generieren** (the number generator).

The generator gives you a 6-digit number where every digit is different. You can let it pick one or type the digits in yourself. A number can only be used once per session.

Live version: https://tj-labs-number-generator.vercel.app/sign-in

## Running it

Needs Node.js 20.9+ and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Then go to http://localhost:3000. For a production build: `npm run build && npm start`.

Demo login:

```text
Email:    demo@tjlabs.dev
Password: tjlabs-demo
```

## Stack

Next.js 16 (App Router), React 19, TypeScript, CSS Modules and Node's `crypto`. I didn't pull in Tailwind or a component library – plain CSS was enough to match the design.

## Project Structure Choosen (Three-Tire)

```text
src/
  domain/          business rules
  application/     use cases, DTOs
  infrastructure/  crypto, wiring
  presentation/    components, hooks, i18n, styles
  app/             Next.js pages + API routes
  proxy.ts         picks the UI language before render
```

Honestly this is more layering than a two-screen app needs. I did it mostly because of the "never hand out the same number twice" rule – I wanted that logic on the server and well away from React. The UI just calls `POST /api/draws` and shows whatever comes back.

The screens share one layout, and components get things like language and flag through props, so there's no separate English/German copy of anything.

## How numbers are generated

Order matters (the UI shows six separate slots, so `380591` and `195083` are different), which gives `P(10, 6) = 151,200` possible numbers. If order didn't matter it'd only be 210.

Rather than generating random numbers and retrying until I hit an unused one, each possible sequence has an index:

1. Count how many numbers are left.
2. Pick a random unused index with `crypto.randomInt`.
3. Turn the index into its 6-digit sequence.
4. Mark it as used and return it.

Concurrent requests are handled inside the draw logic. If a draw can't be claimed after a few retries the API returns `503` instead of risking a duplicate. Once all 151,200 are gone it returns `409` and the generate button is disabled.

Manually entered numbers go through the same server-side checks (6 digits, all different, not used before) and end up in the same history, so the generator won't hand them out later.

After generating, you can copy the number, go to Sign In and paste it as the password – that's the whole flow.

## Language

English and German, saved in a cookie. Defaults follow the design: Sign In starts in English, the generator in German.
