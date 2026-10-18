# Iddo the Seer

This is my first AI agent project called Iddo the seer. Iddo is a work-in-progress AI assistant for finding Bible verses you half remember. Describe a verse in your own words, for example *"In John, where does Jesus call himself the vine?"*, and Iddo searches the King James text and returns the reference, the full verse, and a one-sentence reason it fits.

Iddo only finds references. It does not interpret scripture, write talks or lessons, or answer from the model's own knowledge. Every verse it returns is copied from the source text and checked against it.

## How it works

A question goes through three AI steps on the server. All three use one local model (`gpt-oss:20b` through [Ollama](https://ollama.com)), each with its own system prompt and tools.

```
"In John, where does Jesus call himself the vine?"
        │
        ▼
1. Book title agent    → "John"  → abbreviation "JHN"
        │
        ▼
2. Match finder agent  → searches the book for words like "vine",
        │                 saves every verse that matches
        ▼
3. Match comparer agent → picks the best saved match and explains why
        │
        ▼
John 15:5 - "I am the vine, ye are the branches: ..."
He says it directly to his disciples.
```

### 1. Find the book

`BookTitleAgent` reads the question and returns only the name of the book it mentions, such as `Luke` or `1 John`. It may also return `Psalms`, `Old Testament`, `New Testament`, or `Bible`. It is told not to guess which book a story comes from. `getAbbreviation` in `server/models/books.js` maps the name to an eBible.org file code (`LUK`, `1JN`, `nt`, `all`, ...). If the name can't be mapped, the server asks the user to name a book.

### 2. Search for matching verses

`createMatchTools` in `server/tools.js` builds a fresh set of tools for each request. The match finder agent gets two of them:

- **`get_matching_pages(keyword)`** downloads the KJV PDF for the book from `https://ebible.org/pdf/eng-kjv2006/` once, parses it with `pdf-parse`, and returns every page that contains the keyword as a whole word (a case-insensitive regex). It holds back results the agent can't use: pages already shown, and searches that hit more than 4 pages, where it asks for a narrower phrase.
- **`save_match(pageNumber, reference, quote, reason)`** saves a candidate verse. The quote must come from a page the agent has actually been shown, must not be shortened with `...`, and must appear on that page (compared on letters only, so verse numbers and line breaks don't matter). If any check fails, the tool explains why so the agent can try again.

The agent picks words likely to appear in the verse itself, and tries other wordings or older KJV forms if a search finds nothing.

### 3. Choose the best match

The match comparer agent gets the other two tools:

- **`load_matches()`** lists every saved candidate.
- **`choose_match(matchNumber, explanation)`** records the best one with a one-sentence explanation.

If the comparer doesn't choose, the first saved match is used. If nothing was saved, the server replies that the scripture could not be found.

### The reply

`POST /api/reference` returns `{ AIResponse }` as plain text in the form:

```
<reference> - "<verse>"
<explanation>
```

On the client, `SeerReply` parses that format and renders the reference, verse, and explanation as a card. Replies that don't match the format, such as "Please include the book...", show as plain notes with a hint about what to try next.

## Project structure

```
client/                     React 19 + Vite frontend
  src/pages/Home.jsx          Chat thread: messages, retry, auto-scroll
  src/hooks/useSendPrompt.js  POSTs a question to /api/reference
  src/components/             Composer, EmptyState (example questions), SeerReply, Navbar, ScrollMark
server/
  server.js                 Express app, Ollama model, agent definitions and system prompts
  controllers/reference.js  The three-step search pipeline
  tools.js                  Per-request LangChain tools for the agents
  models/ai.js              Calls that invoke each agent
  models/books.js           Book abbreviations and PDF page loading
  migrations/               SQL migrations
  views/index.handlebars    HTML shell that loads the React app
spd.md                      Original project goals and design notes
```

The app is built on a React + Express + PostgreSQL starter. There are no user accounts; anyone who can reach the server can search.

## Running it locally

### Prerequisites

- Node.js and npm
- PostgreSQL (only used by the migration runner; the app itself stores nothing)
- [Ollama](https://ollama.com) with the model pulled:
  ```bash
  ollama pull gpt-oss:20b
  ```
  The model runs with a 16k context window. Expect searches to take a while on modest hardware; the request timeout is 10 minutes.
- Internet access, since the Bible PDFs are fetched from ebible.org at request time.

### Setup

```bash
./setup.sh
```

The script installs npm packages, creates a Postgres user and database, writes `.env`, and runs the migrations. To do it by hand instead, copy `.env.example` to `.env`, set `DATABASE_URL`, then run `npm install` and `npm run migrate`.

### Development

Run both servers in separate terminals and keep Ollama running:

```bash
npm run server-dev   # Express API + HTML shell on http://localhost:3000
npm run client-dev   # Vite dev server on http://localhost:5173 (HMR)
```

Open http://localhost:3000. The server logs each step (`[System] ...`) as the agents search, which is the easiest way to see what the AI is doing.

### Production

```bash
npx vite build client
NODE_ENV=production node server/server.js
```

Express then serves the built files from `client/dist`.

## Current limitations

- Only the King James Bible is searched. The Book of Mormon and Pearl of Great Price from the original plan in `spd.md` aren't wired up yet.
- The question has to name a book (or a testament) for the search to be focused. With no book named, it falls back to searching the whole Bible.
- The PDF for a book is downloaded and parsed on every request; nothing is cached between requests.
- Each question is answered on its own; there is no conversation memory.
