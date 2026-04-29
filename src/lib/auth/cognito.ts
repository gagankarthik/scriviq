import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  GlobalSignOutCommand,
  type AdminInitiateAuthCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? "us-east-2",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID!;
const POOL_ID   = process.env.AWS_COGNITO_USER_POOL_ID!;

export type CognitoTokens = {
  accessToken:  string;
  idToken:      string;
  refreshToken: string;
  expiresIn:    number;
};

export async function cognitoLogin(
  email: string,
  password: string
): Promise<CognitoTokens> {
  const result: AdminInitiateAuthCommandOutput = await cognito.send(
    new AdminInitiateAuthCommand({
      UserPoolId:     POOL_ID,
      ClientId:       CLIENT_ID,
      AuthFlow:       "ADMIN_NO_SRP_AUTH",
      AuthParameters: { USERNAME: email, PASSWORD: password },
    })
  );

  const auth = result.AuthenticationResult;
  if (!auth?.AccessToken || !auth.IdToken || !auth.RefreshToken) {
    throw new Error("Cognito returned incomplete tokens");
  }

  return {
    accessToken:  auth.AccessToken,
    idToken:      auth.IdToken,
    refreshToken: auth.RefreshToken,
    expiresIn:    auth.ExpiresIn ?? 3600,
  };
}

export async function cognitoSignUp(
  email: string,
  password: string,
  name: string
): Promise<void> {
  // AdminCreateUser creates the user and sends a temp password
  await cognito.send(
    new AdminCreateUserCommand({
      UserPoolId:        POOL_ID,
      Username:          email,
      TemporaryPassword: `Temp1!${Math.random().toString(36).slice(2, 8)}`,
      UserAttributes: [
        { Name: "email",          Value: email },
        { Name: "email_verified", Value: "true" },
        { Name: "name",           Value: name },
      ],
      MessageAction: "SUPPRESS", // don't send welcome email
    })
  );

  // Immediately set the permanent password
  await cognito.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: POOL_ID,
      Username:   email,
      Password:   password,
      Permanent:  true,
    })
  );
}

export async function cognitoGetUser(email: string) {
  const result = await cognito.send(
    new AdminGetUserCommand({ UserPoolId: POOL_ID, Username: email })
  );
  const attrs = Object.fromEntries(
    (result.UserAttributes ?? []).map((a) => [a.Name, a.Value])
  );
  return {
    userId: result.Username!,
    email:  attrs["email"] ?? email,
    name:   attrs["name"]  ?? email,
    sub:    attrs["sub"]   ?? result.Username!,
  };
}

export async function cognitoSignOut(accessToken: string): Promise<void> {
  await cognito.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
}
