# Stateless Connect Four

![Connect Four UI](</public/Screenshot 2024-04-30 at 1.42.36 PM.png>)

## Play Connect Four with your friends online!

Stateless Connect Four is a lightweight web application designed for quick and effortless games played over the web, hosted at [connectfour.xyz](https://connectfour.xyz)!

The user's web client connects to a simple websocket server. The backend does not store any game state, instead state is passed back and forth between players over the websocket connection. This ensures a lighting quick and highly scalable web application. In the case of a player disconnecting, game state is stored in browser cookies and players are automatically reconnected upon navigating back to the game link.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Usage

### Overview
Each player connects to a websocket that limits each unique `gameId` to two players. At the start of the game, the player who goes first is chosen at random. Every time a player makes a move, their client sends the updated game state to the websocket, which then passes the message to the other connected player. To handle disconnections, the game state is versioned and stored as a cookie on the user's client. When a user reconnects, their game state is loaded from cookies and sent to the websocket. When the receiving player receives this game state, if the version is older than their own (i.e. the receiving player has made a move while the reconnecting player was away) than the receiving player sends their up-to-date game state to the reconnecting player.  The game is played until completion with players taking alternating turns. Once the game is over, a winner is declared and the players are given the option to restart

### Playing the Game
1. Navigate to [connectfour.xyz](https://connectfour.xyz)
2. Click the "Generate Link" button to generate a unique `gameId`
3. Click "Go to game" button which will redirect you to the game page
4. Copy and paste the URL and send it to your opponent
5. Once your opponent connects, both players will be prompted to select a color. Once each player selects a color, either player can start the game!
