# Prompt to paste into the Google app builder

Replace YOUR_SERVER_URL with the address of the tutor server (see README.md).

---

Build a mobile-friendly web app called "Learning Buddy", an AI tutor for kids aged 5 to 13.

Screen layout:
- A cheerful header with the app name.
- Two dropdowns at the top: Subject (General, Math, Science, Reading & Writing, English, Coding) and Age group (5-7, 8-10, 11-13, default 8-10).
- A large chat area. The tutor's messages sit on the left in light blue bubbles. The child's messages sit on the right in yellow bubbles. Use big, easy-to-read text (at least 18px) and rounded shapes.
- A text box and a big Send button at the bottom. Disable Send while waiting for a reply. Show "Thinking…" in a tutor bubble while waiting.
- Start the chat with a tutor message: "Hi! I'm your learning buddy. What would you like to learn today?"

How it talks to the tutor:
- Keep the whole conversation as a list of messages: { role: "user" | "assistant", content: "..." }.
- On Send, add the child's message, then call POST YOUR_SERVER_URL/api/chat with JSON:
  { "messages": [...], "subject": "<selected subject>", "ageBand": "<selected age group>" }
- The server replies with { "reply": "..." }. Show the reply as a tutor message and add it to the list.
- On an error, show the server's "error" text in a tutor bubble and remove the last child message from the list so they can try again.
- Do NOT call any AI service directly and do NOT put any API key in the app. All AI calls go through the server above.

Rules:
- Never ask the child for their name, school, address, or any personal details.
- No ads, no external links, no login for this first version.
- Add a small "Ask a grown-up for help" note in the footer.
- Keep the design simple, colorful, and calm.
