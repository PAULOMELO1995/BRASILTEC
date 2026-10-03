import { useEffect, useRef, useState } from "react";

type GoogleCredentialResponse = { credential?: string };
type GoogleButtonText = "signin_with" | "signup_with" | "continue_with";

type GoogleAuthButtonProps = {
  onCredential: (credential: string) => Promise<void> | void;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
  text?: string;
  buttonText?: GoogleButtonText;
};

type GoogleAccounts = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode: "popup";
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          theme: "outline";
          size: "large";
          text: GoogleButtonText;
          shape: "rectangular";
          width: number;
        },
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

let scriptPromise: Promise<void> | null = null;

function ensureGoogleScript(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("google-identity-services");
    const script =
      existing instanceof HTMLScriptElement
        ? existing
        : document.createElement("script");
    const timeout = window.setTimeout(
      () =>
        finish(
          new Error(
            "O Google demorou para responder. Atualize a página e tente novamente.",
          ),
        ),
      15000,
    );
    function finish(error?: Error) {
      window.clearTimeout(timeout);
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      if (error) {
        script.remove();
        reject(error);
      } else {
        resolve();
      }
    }
    function onLoad() {
      finish(
        window.google?.accounts.id
          ? undefined
          : new Error("Não foi possível iniciar o acesso com Google."),
      );
    }
    function onError() {
      finish(
        new Error(
          "Não foi possível carregar o Google. Atualize a página e tente novamente.",
        ),
      );
    }
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    if (!existing) {
      script.id = "google-identity-services";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      document.head.appendChild(script);
    }
  }).catch((error: unknown) => {
    scriptPromise = null;
    throw error;
  });
  return scriptPromise;
}

export function GoogleAuthButton({
  onCredential,
  onBusyChange,
  disabled = false,
  text = "Conectando com Google...",
  buttonText = "continue_with",
}: GoogleAuthButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const busyCallbackRef = useRef(onBusyChange);
  const disabledRef = useRef(disabled);
  const processingRef = useRef(false);
  callbackRef.current = onCredential;
  busyCallbackRef.current = onBusyChange;
  disabledRef.current = disabled;
  const clientId = (import.meta.env["VITE_GOOGLE_CLIENT_ID"] ?? "").trim();

  useEffect(() => {
    let active = true;
    setReady(false);
    setError(null);
    async function mountButton() {
      if (!clientId || !containerRef.current) return;
      try {
        await ensureGoogleScript();
        if (!active || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: "popup",
          callback: async (response) => {
            if (!active || disabledRef.current || processingRef.current) return;
            const credential = response.credential?.trim();
            if (!credential) {
              setError(
                "Não foi possível receber a credencial do Google. Tente novamente.",
              );
              return;
            }
            processingRef.current = true;
            setBusy(true);
            setError(null);
            busyCallbackRef.current?.(true);
            try {
              await callbackRef.current(credential);
            } catch (err) {
              if (active)
                setError(
                  err instanceof Error
                    ? err.message
                    : "Não foi possível continuar com Google.",
                );
            } finally {
              processingRef.current = false;
              if (active) {
                setBusy(false);
                busyCallbackRef.current?.(false);
              }
            }
          },
        });
        const container = containerRef.current;
        container.replaceChildren();
        window.google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          text: buttonText,
          shape: "rectangular",
          width: Math.min(320, container.clientWidth || 320),
        });
        setReady(true);
      } catch (err) {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível iniciar o acesso com Google.",
          );
      }
    }
    void mountButton();
    return () => {
      active = false;
    };
  }, [clientId, buttonText]);

  if (!clientId) {
    return (
      <p role="status" className="mt-3 text-xs text-muted-foreground">
        O acesso com Google ainda não está disponível. Continue com email e
        senha.
      </p>
    );
  }

  return (
    <div className="mt-4" aria-busy={busy}>
      <div
        inert={disabled || busy}
        className={disabled || busy ? "opacity-70" : ""}
      >
        <div
          ref={containerRef}
          className="flex min-h-11 w-full justify-center"
        />
      </div>
      {!ready && !error ? (
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          Carregando Google...
        </p>
      ) : null}
      {busy ? (
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          {text}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
