import { useState } from "react";
import { ArrowLeft, LogIn, Sparkles } from "lucide-react";
import {
  confirmEmailRegistration,
  completePasswordReset,
  getSignedInUser,
  registerWithEmail,
  requestPasswordReset,
  resendEmailConfirmation,
  signInWithEmail,
} from "../auth.js";

function authErrorMessage(error) {
  const messages = {
    CodeMismatchException: "Kod weryfikacyjny jest nieprawidłowy.",
    ExpiredCodeException: "Kod weryfikacyjny wygasł. Wyślij nowy kod.",
    InvalidPasswordException: "Hasło nie spełnia wymagań Cognito.",
    LimitExceededException: "Przekroczono limit prób. Spróbuj ponownie później.",
    NotAuthorizedException: "Nieprawidłowy adres e-mail lub hasło.",
    UsernameExistsException: "Konto z tym adresem e-mail już istnieje.",
    UserNotConfirmedException: "Potwierdź adres e-mail, zanim się zalogujesz.",
  };

  return messages[error.name] ?? error.message ?? "Nie udało się wykonać operacji.";
}

export default function AuthView({
  configured = true,
  initialError = "",
  onAuthenticated,
}) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

  async function submitSignIn(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const result = await signInWithEmail(email.trim(), password);
      if (!result.isSignedIn) {
        if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
          setMode("confirm");
          setNotice("Potwierdź adres e-mail kodem, który został do Ciebie wysłany.");
          return;
        }
        throw new Error("Konto wymaga dodatkowego kroku logowania, który nie jest jeszcze obsługiwany.");
      }
      onAuthenticated(await getSignedInUser());
    } catch (cause) {
      if (cause.name === "UserNotConfirmedException") {
        setMode("confirm");
        setError(authErrorMessage(cause));
      } else {
        setError(authErrorMessage(cause));
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitSignUp(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const result = await registerWithEmail(email.trim(), password);
      if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setMode("confirm");
        setNotice("Wysłaliśmy kod weryfikacyjny na podany adres e-mail.");
      } else {
        setMode("signin");
        setNotice("Konto zostało utworzone. Możesz się teraz zalogować.");
      }
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function submitConfirmation(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      await confirmEmailRegistration(email.trim(), confirmationCode.trim());
      setMode("signin");
      setPassword("");
      setConfirmationCode("");
      setNotice("Adres e-mail potwierdzony. Zaloguj się, aby kontynuować.");
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    setError("");
    setNotice("");
    setBusy(true);

    try {
      await resendEmailConfirmation(email.trim());
      setNotice("Wysłaliśmy nowy kod weryfikacyjny.");
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function submitPasswordResetRequest(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      const result = await requestPasswordReset(email.trim());
      if (result.nextStep.resetPasswordStep !== "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        throw new Error("Cognito nie zwrócił kodu resetowania hasła.");
      }
      setMode("reset");
      const destination = result.nextStep.codeDeliveryDetails?.destination;
      setNotice(
        destination
          ? `Wysłaliśmy kod resetowania na ${destination}.`
          : "Wysłaliśmy kod resetowania na Twój zweryfikowany adres e-mail.",
      );
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function submitPasswordReset(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      await completePasswordReset(email.trim(), confirmationCode.trim(), newPassword);
      setMode("signin");
      setPassword("");
      setNewPassword("");
      setConfirmationCode("");
      setNotice("Hasło zostało zmienione. Zaloguj się nowym hasłem.");
    } catch (cause) {
      setError(authErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <main className="auth-screen">
        <section className="auth-card" aria-labelledby="auth-title">
          <Brand />
          <h1 id="auth-title">Skonfiguruj Cognito</h1>
          <p className="auth-description">
            Frontend nie ma jeszcze identyfikatorów puli Cognito. Ustaw
            VITE_COGNITO_USER_POOL_ID i VITE_COGNITO_USER_POOL_CLIENT_ID
            na podstawie outputów Terraform, a następnie uruchom aplikację ponownie.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <section className="auth-card" aria-labelledby="auth-title">
        <Brand />
        {mode === "confirm" ? (
          <>
            <h1 id="auth-title">Potwierdź adres e-mail</h1>
            <p className="auth-description">
              Wpisz kod wysłany na <strong>{email}</strong>.
            </p>
            <form className="auth-form" onSubmit={submitConfirmation}>
              <label>
                Kod weryfikacyjny
                <input
                  autoComplete="one-time-code"
                  autoFocus
                  inputMode="numeric"
                  required
                  value={confirmationCode}
                  onChange={(event) => setConfirmationCode(event.target.value)}
                />
              </label>
              <AuthFeedback error={error} notice={notice} />
              <button className="auth-submit" disabled={busy} type="submit">
                {busy ? "Weryfikowanie…" : "Potwierdź e-mail"}
              </button>
            </form>
            <button className="auth-text-button" disabled={busy} onClick={resendCode} type="button">
              Wyślij kod ponownie
            </button>
            <button className="auth-back" onClick={() => changeMode("signin")} type="button">
              <ArrowLeft size={15} /> Wróć do logowania
            </button>
          </>
        ) : mode === "forgot" ? (
          <>
            <h1 id="auth-title">Odzyskaj hasło</h1>
            <p className="auth-description">
              Podaj adres e-mail powiązany z kontem. Wyślemy na niego kod do ustawienia nowego hasła.
            </p>
            <form className="auth-form" onSubmit={submitPasswordResetRequest}>
              <label>
                Adres e-mail
                <input
                  autoComplete="email"
                  autoFocus
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <AuthFeedback error={error} notice={notice} />
              <button className="auth-submit" disabled={busy} type="submit">
                {busy ? "Wysyłanie…" : "Wyślij kod resetowania"}
              </button>
            </form>
            <button className="auth-back" disabled={busy} onClick={() => changeMode("signin")} type="button">
              <ArrowLeft size={15} /> Wróć do logowania
            </button>
          </>
        ) : mode === "reset" ? (
          <>
            <h1 id="auth-title">Ustaw nowe hasło</h1>
            <p className="auth-description">
              Wpisz kod wysłany na <strong>{email}</strong> i wybierz nowe hasło.
            </p>
            <form className="auth-form" onSubmit={submitPasswordReset}>
              <label>
                Kod resetowania
                <input
                  autoComplete="one-time-code"
                  autoFocus
                  inputMode="numeric"
                  required
                  value={confirmationCode}
                  onChange={(event) => setConfirmationCode(event.target.value)}
                />
              </label>
              <label>
                Nowe hasło
                <input
                  autoComplete="new-password"
                  minLength={12}
                  required
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
                <span className="auth-hint">
                  Minimum 12 znaków, mała i duża litera, cyfra oraz symbol.
                </span>
              </label>
              <AuthFeedback error={error} notice={notice} />
              <button className="auth-submit" disabled={busy} type="submit">
                {busy ? "Zapisywanie…" : "Zmień hasło"}
              </button>
            </form>
            <button className="auth-back" disabled={busy} onClick={() => changeMode("forgot")} type="button">
              <ArrowLeft size={15} /> Wyślij nowy kod
            </button>
          </>
        ) : (
          <>
            <h1 id="auth-title">
              {mode === "signup" ? "Dołącz do Gather" : "Witaj ponownie"}
            </h1>
            <p className="auth-description">
              {mode === "signup"
                ? "Utwórz konto, aby dołączyć do rozmów."
                : "Zaloguj się, aby wrócić do swoich rozmów."}
            </p>
            <form
              className="auth-form"
              onSubmit={mode === "signup" ? submitSignUp : submitSignIn}
            >
              <label>
                Adres e-mail
                <input
                  autoComplete="email"
                  autoFocus
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label>
                Hasło
                <input
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={mode === "signup" ? 12 : undefined}
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {mode === "signup" && (
                  <span className="auth-hint">
                    Minimum 12 znaków, mała i duża litera, cyfra oraz symbol.
                  </span>
                )}
              </label>
              <AuthFeedback error={error} notice={notice} />
              <button className="auth-submit" disabled={busy} type="submit">
                <LogIn size={16} />
                {busy
                  ? "Proszę czekać…"
                  : mode === "signup"
                    ? "Utwórz konto"
                    : "Zaloguj się"}
              </button>
            </form>
            {mode === "signin" && (
              <button
                className="auth-text-button auth-forgot"
                onClick={() => changeMode("forgot")}
                type="button"
              >
                Nie pamiętasz hasła?
              </button>
            )}
            <p className="auth-switch">
              {mode === "signup" ? "Masz już konto?" : "Nie masz jeszcze konta?"}
              <button
                className="auth-text-button"
                onClick={() => changeMode(mode === "signup" ? "signin" : "signup")}
                type="button"
              >
                {mode === "signup" ? "Zaloguj się" : "Zarejestruj się"}
              </button>
            </p>
          </>
        )}
      </section>
    </main>
  );
}

function AuthFeedback({ error, notice }) {
  if (error) return <p className="auth-feedback auth-feedback-error" role="alert">{error}</p>;
  if (notice) return <p className="auth-feedback auth-feedback-notice" role="status">{notice}</p>;
  return null;
}

function Brand() {
  return (
    <div className="auth-brand">
      <span className="auth-brand-mark"><Sparkles size={19} /></span>
      <span>gather<span className="brand-period">.</span></span>
    </div>
  );
}
