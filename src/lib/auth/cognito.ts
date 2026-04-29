import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  GlobalSignOutCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  type AdminInitiateAuthCommandOutput,
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
const CLIENT_SECRET = process.env.AWS_COGNITO_CLIENT_SECRET; // optional — only set if your App Client has a secret

// Cognito requires a SecretHash when the App Client has a secret.
// HMAC-SHA256(username + clientId) keyed by clientSecret, base64-encoded.
function secretHash(username: string): string | undefined {
  if (!CLIENT_SECRET) return undefined;
  return createHmac("sha256", CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest("base64");
}

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
  const hash = secretHash(email);
  const result: AdminInitiateAuthCommandOutput = await cognito.send(
    new AdminInitiateAuthCommand({
      UserPoolId:     POOL_ID,
      ClientId:       CLIENT_ID,
      AuthFlow:       "ADMIN_NO_SRP_AUTH",
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

// ─── Self-service signup (with email verification) ────────────────────────────

/**
 * Self-service signup. Creates an UNCONFIRMED user and triggers Cognito
 * to email a 6-digit verification code. Returns the new userSub.
 */
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

/**
 * Confirm a self-service signup with the 6-digit code emailed to the user.
 */
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

/**
 * Resend the 6-digit verification code for an unconfirmed user.
 */
export async function cognitoResendCode(email: string): Promise<{ codeDeliveredTo?: string }> {
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
