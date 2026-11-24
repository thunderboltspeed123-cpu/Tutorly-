# Kids AI Tutor: starter base

A small, working base for an AI tutor for children. Claude does the teaching. A tiny server keeps your API key safe. The screen can be the one in `public/` or one built in the Google app builder.

```
tutor-base/
  BUILDER_PROMPT.md    paste into the Google builder to make the screen
  server/
    server.js          the backend: receives chat, calls Claude, returns the reply
    tutor-prompt.js    the tutor's personality and safety rules (edit this first)
    package.json
    .env.example       copy to .env and add your key
  public/index.html    a simple ready-made screen to test with
```

## Run it on your computer (about 5 minutes)

1. Install Node.js (version 18 or newer) from nodejs.org.
2. Get an API key at console.anthropic.com (create an account, add credit, create a key).
3. In a terminal:
   ```
   cd tutor-base/server
   cp .env.example .env        # then open .env and paste your key
   npm install
   npm start
   ```
4. Open http://localhost:3000 and chat with the tutor.

## Put the app on a Samsung Galaxy Tab (A11+ or any Android tablet)

The screen in `public/` is an installable web app. It works on the tablet like a normal app, with its own icon and full screen. The tablet cannot run the server, so the server must be online first.

1. Put the server online (see "Put the server online" below). You get a web address starting with `https://`.
2. On the tablet, open Chrome (or Samsung Internet) and go to that address.
3. Open the browser menu (three dots) and tap **Add to Home screen** or **Install app**.
4. Open "Learning Buddy" from the home screen. It opens full screen, with larger text on the tablet's wide screen.

Notes:
- Installing needs `https://`. Hosts like Cloud Run give you that automatically.
- The tutor needs the internet to answer. The screen itself opens even when the connection is slow.
- To test on the tablet before hosting, run the server on your computer, connect both to the same Wi-Fi, and open `http://YOUR-COMPUTER-IP:3000` in the tablet's browser. Installing as an app will not be offered without `https://`, but chatting works.

## Use the Google builder for the screen

1. Put the server online (see below) so you get an address like `https://your-tutor.example.com`.
2. Open `BUILDER_PROMPT.md`, replace `YOUR_SERVER_URL` with that address, and paste the whole prompt into the builder.
3. In `server/.env`, set `ALLOWED_ORIGIN` to the address of the app the builder creates.

The builder app only ever talks to your server. The API key stays on the server.

## Put the server online

Any Node host works. Google Cloud Run is a natural fit next to the Google builder. Whichever you choose:
- Set the same values from `.env.example` in the host's environment settings (never upload your real `.env`).
- Start command: `npm start`.

## Using your own AI instead of Claude

All AI calls are in one place: the `client.messages.create(...)` call in `server/server.js`. To use another model, replace that call with your provider's call and keep the same inputs (system prompt, messages) and the same output (`{ reply }`). The screen does not need to change.

## Before real children use it

- **Rules for children's apps:** laws such as COPPA (US) and GDPR-K (EU/UK) apply when kids use an online service. Check the rules for your country and get a parent or guardian's consent. Check Anthropic's usage policy for products used by minors too.
- **No personal data:** this base stores nothing and asks for nothing. Keep it that way until you add proper privacy protections.
- **Test the safety prompt:** try off-topic questions, rude words, and "I feel sad" messages, and tune `tutor-prompt.js` until the replies are right. A grown-up should review it.
- **Watch the cost:** the server limits each visitor to 20 messages a minute and short replies. Set a monthly spending limit in the Anthropic console.
- **Add a parent area later:** progress reports, time limits, and a way to report a bad answer.

## Ideas for next versions

Quiz mode, a reward/streak system, reading aloud, saving progress with a parent login, and a teacher dashboard.
