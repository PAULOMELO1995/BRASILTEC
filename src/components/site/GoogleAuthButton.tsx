import { useEffect, useMemo, useRef, useState } from "react";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAuthButtonProps = {
  onCredential: (credential: string) => Promise<void> | void;
  disabled?: boolean;
  text?: string;
};

type GoogleAccounts = {
  accounts: any;
  id: {
    initialize: (options: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      ux_mode?: "popup" | "redirect";
    }) => void;
    renderButton: (
      parent: HTMLElement,
      options: {
        theme?: "outline" | "filled_blue" | "filled_black";
        size?: "large" | "medium" | "small";
        text?: "signin_with" | "signup_with" | "continue_with";
        shape?: "rectangular" | "pill" | "circle" | "square";
        width?: number;
      },
    ) => void;
  };
};

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

function ensureGoogleScript(): Promise<void> {
  const scriptId = "google-identity-services";
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset["loaded"] === "true") return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar Google Identity.")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset["loaded"] = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Falha ao carregar Google Identity."));
    document.head.appendChild(script);
  });
}

export function GoogleAuthButton({ onCredential, disabled = false, text = "Continuar com Google" }: GoogleAuthButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const clientId = useMemo(() => {
    const env = import.meta.env as ImportMetaEnv & { VITE_GOOGLE_CLIENT_ID?: string };
    return (env.VITE_GOOGLE_CLIENT_ID ?? "").trim();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function mountButton() {
      if (!clientId || !containerRef.current) return;

      try {
        await ensureGoogleScript();
        if (cancelled || !window.google || !containerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: "popup",
          callback: async (response: { credential: string; }) => {
            const credential = response.credential?.trim();
            if (!credential) {
              setError("Falha ao receber credencial do Google.");
              return;
            }

            try {
              setBusy(true);
              setError(null);
              await onCredential(credential);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Falha no login com Google.");
            } finally {
              setBusy(false);
            }
          },
        });

        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 320,
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao iniciar Google Login.");
        }
      }
    }

    void mountButton();
    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential]);

  if (!clientId) {
    return (
      <p className="mt-3 text-xs text-muted-foreground">
        Google Login indisponivel: defina VITE_GOOGLE_CLIENT_ID no ambiente.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <div className={disabled || busy ? "pointer-events-none opacity-70" : ""}>
        <div ref={containerRef} />
      </div>
      {(disabled || busy) ? (
        <p className="mt-2 text-xs text-muted-foreground">{text}</p>
      ) : null}
      {error ? (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
