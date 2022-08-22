# BTC Guessr Game

## Frontend

## Backend
The backend utilizes AWS and its CDK.

### Project Improvements
- The AWS CDK has a lot of types and often VSCode has difficulties with this fact. There are newer modular CDK packages which maybe help to prevent that.
- The frontend is deployed to Vercel, as its fast and easy. It would be better to have a dedicated CDK construct for the frontend deployment and use AWS for it as well.

### Feature Improvements
If there is a user management it would be straight forward to implement the following features:
- Leaderboard: Claim a username and be present in a public leaderboard
- History of guesses: See a history of your previous guesses