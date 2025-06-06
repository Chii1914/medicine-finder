// awsConfig.js
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";

export const REGION = process.env.REACT_APP_AWS_REGION;
export const ROUTE_INDEX = process.env.REACT_APP_AWS_ROUTE_INDEX_NAME;
export const MAP_API_KEY = process.env.REACT_APP_AWS_MAP_API_KEY;

// Aquí va el ID de tu pool de identidades
const IDENTITY_POOL_ID = "us-east-1:6155f6de-0224-4b5b-8c8b-a983158e7afc"; // <-- cámbialo

export const credentials = fromCognitoIdentityPool({
  client: new CognitoIdentityClient({ region: REGION }),
  identityPoolId: IDENTITY_POOL_ID,
});
