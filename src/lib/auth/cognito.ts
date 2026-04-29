import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  AdminGetUserCommand,
  GlobalSignOutCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  type InitiateAuthCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { createHmac } from "crypto";

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? "us-east-2",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const CLIENT_ID     = process.env.AWS_COGNITO_CLIENT_ID!;
const POOL_ID       = process.env.AWS_COGNITO_USER_POOL_ID!;
const CLIENT_SECRET = process.env.AWS_COGNITO_CLIENT_SECRET;

// Required only when the App Client has a client secret configured.
// HMAC-SHA256(username + clientId) keyed by the secret, base64-encoded.
function secretHash(username: string): string | undefined {
  if (!CLIENT_SECRET) return undefined;
  return createHmac("sha256", CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest("base64");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type CognitoTokens = {
  accessToken:  string;
  idToken:      string;
  refreshToken: string;
  expiresIn:    number;
};

export type CognitoUser = {
  sub:    string;
  userId: string;
  email:  string;
  name:   string;
};

// ─── Login ────────────────────────────────────────────────────────────────────

export async function cognitoLogin(
  email: string,
  password: string
): Promise<CognitoTokens> {
  const hash = secretHash(email);
  const result: InitiateAuthCommandOutput = await cognito.send(
    new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        ...(hash ? { SECRET_HASH: hash } : {}),
      },
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

// ─── Get user attributes ──────────────────────────────────────────────────────

export async function cognitoGetUser(email: string): Promise<CognitoUser> {
  const result = await cognito.send(
    new AdminGetUserCommand({ UserPoolId: POOL_ID, Username: email })
  );
  const attrs = Object.fromEntries(
    (result.UserAttributes ?? []).map((a) => [a.Name, a.Value])
  );
  const sub = attrs["sub"] ?? result.Username!;
  return {
    sub,
    userId: sub,
    email:  attrs["email"] ?? email,
    name:   attrs["name"]  ?? attrs["email"] ?? email,
  };
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function cognitoSignOut(accessToken: string): Promise<void> {
  await cognito.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
}

// ─── Self-service signup with email verification ──────────────────────────────

export async function cognitoSignUpSelf(
  email: string,
  password: string,
  name: string
): Promise<{ userSub: string; codeDeliveredTo?: string }> {
  const hash = secretHash(email);
  const result = await cognito.send(
    new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name",  Value: name  },
      ],
      ...(hash ? { SecretHash: hash } : {}),
    })
  );
  return {
    userSub:         result.UserSub!,
    codeDeliveredTo: result.CodeDeliveryDetails?.Destination,
  };
}

export async function cognitoConfirmSignUp(email: string, code: string): Promise<void> {
  const hash = secretHash(email);
  await cognito.send(
    new ConfirmSignUpCommand({
      ClientId:         CLIENT_ID,
      Username:         email,
      ConfirmationCode: code,
      ...(hash ? { SecretHash: hash } : {}),
    })
  );
}

export async function cognitoResendCode(
  email: string
): Promise<{ codeDeliveredTo?: string }> {
  const hash = secretHash(email);
  const result = await cognito.send(
    new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ...(hash ? { SecretHash: hash } : {}),
    })
  );
  return { codeDeliveredTo: result.CodeDeliveryDetails?.Destination };
}
