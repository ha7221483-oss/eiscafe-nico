# Privater Invite-Chat v2

## Eigenschaften
- Invite-only (standard code: 15001)
- Max. 5 Teilnehmer pro Code
- Nachrichten und Räume werden 24 Stunden nach Erstellung automatisch gelöscht (in-memory)
- Frontend wird vom Server serviert (öffne http://localhost:3000)

## Lokaler Test
1. unzip the project
2. cd into project directory
3. npm install
4. npm start
5. open http://localhost:3000

## Deployment (Render)
1. Push repo to GitHub
2. Create a Web Service on Render:
   - Build: npm install
   - Start: npm start
3. Render will provide a public URL

## Anpassungen
- Invitation codes are in server.js (INVITATION_CODES)
- MAX_PARTICIPANTS and ROOM_LIFETIME_MS can be set with env vars:
  - MAX_PARTICIPANTS
  - ROOM_LIFETIME_MS (milliseconds)
