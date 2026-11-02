import { Amplify } from "aws-amplify";
import {
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  confirmResetPassword,
  resetPassword,
  resendSignUpCode,
  signIn,
  signOut,
  signUp,
} from "aws-amplify/auth";

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID;

export const isCognitoConfigured = Boolean(userPoolId && userPoolClientId);

if (isCognitoConfigured) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
      },
    },
  });
}

export async function getSignedInUser() {
  try {
    const [user, session] = await Promise.all([
      getCurrentUser(),
      fetchAuthSession(),
    ]);
    const email = session.tokens?.idToken?.payload.email;
    const nickname = session.tokens?.idToken?.payload.preferred_username;

    return {
      username: user.username,
      email: typeof email === "string" ? email : user.username,
      nickname:
        typeof nickname === "string" && nickname.trim()
          ? nickname
          : typeof email === "string"
            ? email
            : user.username,
    };
  } catch (error) {
    if (error.name === "UserUnAuthenticatedException") return null;
    throw error;
  }
}

export async function getApiToken() {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString() ?? null;
}

export function registerWithEmail(email, password, nickname) {
  return signUp({
    username: email,
    password,
    options: {
      userAttributes: { email, preferred_username: nickname },
    },
  });
}

export function confirmEmailRegistration(email, confirmationCode) {
  return confirmSignUp({
    username: email,
    confirmationCode,
  });
}

export function resendEmailConfirmation(email) {
  return resendSignUpCode({ username: email });
}

export function requestPasswordReset(email) {
  return resetPassword({ username: email });
}

export function completePasswordReset(email, confirmationCode, newPassword) {
  return confirmResetPassword({
    username: email,
    confirmationCode,
    newPassword,
  });
}

export function signInWithEmail(email, password) {
  return signIn({ username: email, password });
}

export { signOut };
