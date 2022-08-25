# BTC Guessr Game

BTC Guessr is a game about guessing whether the Bitcoin price will be higher or lower after a 60 seconds time frame. Any user can play the game without the need to log in. Additionally, the score history is synced with local storage, which allows to close the browser and continue at a later point in time. Below sequence diagram shows the general flow of the application.

![sequence.png](/diagrams/sequence.png)




## Frontend
The initial application used NextJS, but I faced [errors]((https://github.com/pmndrs/zustand/issues/938)) with Zustands persist middleware in combination with NextJS. There is currently no straight forward way to opt-out SSR in NextJS, so I migrated the frontend codebase to Vite.

The frontend application is built on React 18 with the following dependencies:
- TailwindCSS
- React Query: takes over the long polling process
- Zustand: lightweight state management library, which helps to sync the users history with the local storage
- Vite: bundles React and offers a great DX

### Local development
1. Install dependencies with
   ```
   yarn
   ```

2. Create a `.env` or `.env.local` file with the API Gateway endpoint:
      ```
      VITE_BACKEND_API_URL=https://...
    ```
1. Run the application with
   ```
   yarn dev
   ```

### Deployment
The web application is deployed to Vercel, as it was the fastest way to get things up and running.
1. Production build
   ```
   yarn build
   ```
2. Run the production build
   ```
   yarn preview
   ```
### Core Logic
The frontend uses 4 hooks to implement its business logic:
1. **useBitcoinStats**: fetch the [Coingecko API](https://www.coingecko.com/en/api/documentation) and get the latest stats e.g. BTC price in USD and how it changed during the last week.
2. **useNewGame**: HTTP POST request to the backend endpoint **/new-guess** with the payload:
    ```
   {
     "guess": "up" // or "down"
   }
   ```
   This request returns a game ID, which is stored in the React query cache. This allows the user to close/reload the browers and continue with the started processing guess. If the ID is set, the following hook is triggered.

3. **useNewGuess**: HTTP GET request on the backend endpoint **/check-result/{id}**. This hook starts long polling to check if the game result is available. It polls the result every 20 seconds. The result is then stored in a history, which is also synced with the local storage.

4. **useScore**: calculates the current score based on the score history.

## Backend
The backend utilizes AWS and its CDK.

### Deployment

Have your [AWS config files](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) set to use profiles
```
export AWS_PROFILE=xyz
```

Bootstrap your CDK
```
yarn cdk bootstrap
```

Deploy to AWS
```
yarn cdk deploy
```

### Architecture

When the user starts the game through the click of a button (either "up" or "down") a POST request is sent to the API Gateway route /new-guess. This endpoint returns a new game ID to the client. The request also triggers an EventBridge rule "putEvent", which starts the async execution of a Step Function State Machine. This state machine first stores the initial game date to DDB, and then waits 60 seconds before checking if the price changed and the user guessed correctly or not. In case of the price not changing, it waits another additional 20 seconds before repeating the previous check. This final result is stored with the previous DynamoDB entry. During the whole process the client has the option to get status updates, by executing a GET request on /check-result/{id}. In addition to above mentioned information, a game status of "processing" or "finished" is returned by this endpoint.


![architecture.png](/diagrams/architecture.png)

### API Gateway
API Gateway is the entry point to the application. It offers two REST based endpoints

#### Start a new game

**URL** : `/new-guess`

**Method** : `POST`

**Auth required** : NO

**Permissions required** : None

**Data constraints**

The request body has one property **guess**, which only allows either "down" or "up"
```json
{
    "guess": "up" // or "down"
}
```
##### Success Response

**Code** : `201 OK`

```json
{
    "id": "23423423-24234234-45523544-4234234",
}
```
#### Check if the game is finished or still processing

**URL** : `/check-result/{id}`

**Method** : `GET`

**Auth required** : NO

**Permissions required** : None

##### Success Response

**Code** : `200 OK`

```json
{
    "id": "23423423-24234234-45523544-4234234",
    "guess": "up",
    "oldPrice": 21123.23, // the initial price
    "timestamp": "2022-08-24T17:17:17.979Z",
    "isCorrectGuess": true, // optional and only set when game is finished
    "gameStatus": "finished", // either "finished" or "processing"
    "latestPrice": 21739.37 // the final price after 60(+-) seconds only set when gameStatus is "finished"
}
```

##### Error Response
**Code** : `404 NOT FOUND`

The input validation is done through the API Gateway itself.

### EventBridge
As there is no way to integrate Step Functions in an async workflow with
API Gateway and the CDK, I use Event Bridge as a layer between API Gateway and Step Functions. There is only one rule, which triggers the execution of the Step Function workflow
and returns the event ID, which is used as the game ID.
```json
{
  "detail-type": ["putEvent"]
}
```

### Lambda
There are 3 lambda functions:

1. new-guess: stores the initial game data to DynamoDB
2. handle-result: checks if the initial price differs from the current price and updates the DynamoDB entry when the game is finished
3. check-result: allows the user to get status updates about the given game ID

### Step Functions
There are 3 tasks:
1. newGuessTasks: is triggered through EventBridge and starts the above mentioned lambda function, it returns the game data and a property "waitSeconds" with 60 seconds as its value.
2. waitTask: gets a variable "waitSeconds" and waits for this amount of time
3. handleResultTask triggers the above mentioned handle-result lambda and returns whether the price did change or not with a property "didPriceChange" and "waitSeconds" with 20 seconds. That means that as long as the price did not change it will wait 20 seconds again and again until it changed and is then resolved by updating the DynamoDB items gameStatus to "finished".

![stepfunctionsgraph.png](/diagrams/stepfunctions.png)
### DynamoDB
Storage service used to keep track of the game status.

Example:
```json
{
    "id": "23423423-24234234-45523544-4234234",
    "guess": "up",
    "oldPrice": 21123.23, // the initial price
    "timestamp": "2022-08-24T17:17:17.979Z",
    "isCorrectGuess": true,
    "gameStatus": "finished", // either "finished" or "processing"
    "latestPrice": 21739.37
}
```

## Project Improvements
- The AWS CDK has a lot of types, which VSCode often has difficulties with There are newer modular CDK packages which maybe help to prevent that.
- The Frontend is deployed to Vercel, as its fast and easy. It would be better to have a dedicated CDK construct for the frontend deployment and use AWS for it as well.
- The backend endpoints do have very generous CORS rules which should not be used in a production environment.
- The provisioned AWS services do have very generous IAM policies applied. A production environment should always aim for the principle of least privilige (POLP).
 often changes every minute, another API tier or inteligent caching mechanismn should be introduced.
 - Adding a Time-To-Live (TTL) to DynamoDB entries which are not connected to a potential userID. We can not query such data and therefore should free up that space after 48h through a TTL key.

## Feature Improvements
- User Management: If the user signs up for an account, its userID could be attached to the already existing game history. Adding a global secondary index (GSI) "byUser" helps to retrieve data for a specific user and allows to implement the following improvements as well:
- Leaderboard: Claim a username and be present in a public leaderboard
- Persisted history of guesses: See a persisted history of your previous guesses. The local history is already stored in local storage, but this can be modified and only helps to give updates to non-authenticated players.