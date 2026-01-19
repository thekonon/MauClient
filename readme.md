# Mňam Mňau client

Project related to the Cerios's backend for popular Mau Mau game

## Backend

https://github.com/pepab0t/maugame

# How to play

In order to play this sh.. very good game you have to have both frontend - that means this repo and Pepab0t's backend. Good news, the process should be managable by monkey.

### Prerequisities

- Brain
- Docker installed
- Node JS installed (hopefully its required until I start publishing this in form of image)

# Steps

1. In CMD: `docker run -p 8080:8080 --name mau-server -d ceri0s/maugame:latest`
   - this downloads backend to docker and set it up on port 8080
2. Open Docker Desktop
   - Section Containers
   - Start it
3. `git clone https://github.com/thekonon/MauClient`
4. Setup mnau.config.ts
   - set ip of network you are currently at
   - port is usually the 8080 from step 1
5. Open CMD/PS in the cloned dir and run `npm run dev`
   - now your friends (which are on the same wifi/network) should be able to connect if your firewall doesn't block that port, find yourself how to enable ports 5173 and 8080 (5173 for NODE 8080 for backend)
6. Report bugs and issues here in issues section
7. If you're here by accident and look at the source code, trust me, i have no clue what I am doing, so no need to tell me that
8. Thanks for attention enjoy
