# BTC Guessr Game

BTC Guessr is a game to guess whether the Bitcoin price changes after 60 seconds up or downwards.
The player is able to guess without the need to log in. The score history is synced with local storage, which allows to close the browser and continue afterwards. The sequence diagram shows the general flow of the application.

![sequence.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1661337711543/WBOz0D5Dw.png)




## Frontend

Then initialy application used NextJS, but I faced errors with Zustands persist middleware in combination with NextJS (https://github.com/pmndrs/zustand/issues/938). There is currently no straight forward way to opt-out SSR without wrapping everying in a useEffect hook and have a decent DX, so I migrated the frontend codebase to Vite.

React 18 with the following dependencies:
- TailwindCSS
- React Query: takes over the long polling process
- Zustand: lightweight state management library which helps to sync the users history with the local storage
- Vite: bundle React with a great DX

### Local development
1. Install dependencies with
   ```
   yarn
   ```
2. Run the application with
   ```
   yarn dev
   ```
### Core Logic
The frontend uses 4 hooks to implement its business logic:
1. **useBitcoinStats**: fetch the Coingecko API and get the latest stats e.g. BTC price in USD and how it changed during the last week.
2. **useNewGame**: POST request on the backend endpoint **/new-guess** with
    ```
   {
     "guess": "up" // or "down"
   }
   ```
   This request returns a game id, which is stored in the react query cache and triggers the execution of the next hook.

3. **useNewGuess**: GET request on the backend endpoint **/check-result/{id}**. This hook starts long polling to check if the game result is available. It polls the result every 20 seconds. The result is then stored in a history, which is also synced with the local storage.

4. **useScore**: calculates the current score based on the score history

## Backend
The backend utilizes AWS and its CDK.

![architecture.png](https://cdn.hashnode.com/res/hashnode/image/upload/v1661336451442/PtTzDhMaw.png)

### API Gateway

### EventBridge
### Lambda

### StepFunctions
### DynamoDB




- Step Functions
  they offer a great way to deal with state machines. Use for wait state ...
- WebSocket vs Long-Polling
  In order to retrieve the result of the guess ...

- The usage of Event Bridge
  As I use the CDK there is no straight forward solution to integrate Step Functions directly with API Gateway. Therefore I put Event Bridge in between with a rule which triggers the Step Function execution

  https://docs.aws.amazon.com/cdk/api/v1/docs/aws-apigateway-readme.html#aws-stepfunctions-backed-APIs

## Project Improvements
- The AWS CDK has a lot of types and often VSCode has difficulties with this fact. There are newer modular CDK packages which maybe help to prevent that.
- The Frontend is deployed to Vercel, as its fast and easy. It would be better to have a dedicated CDK construct for the frontend deployment and use AWS for it as well.
- The backend endpoints do have very generous CORS rules which should not be applied for a production environment.
- The provisioned AWS services do have very generous IAM policies applied. A production environment should always aim for the principle of least privilige (POLP).
### Feature Improvements
- User Management: If the user signs up for an account, its history is stored and synced with the cloud.
- Leaderboard: Claim a username and be present in a public leaderboard
- Persisted history of guesses: See a persisted history of your previous guesses. The local history is already stored in local storage, but this can be modified and only helps to give updates to non-authenticated players.