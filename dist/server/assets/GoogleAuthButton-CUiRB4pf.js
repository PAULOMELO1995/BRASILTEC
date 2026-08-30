import { useEffect, useMemo, useRef, useState } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/components/site/GoogleAuthButton.tsx
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/components/site/GoogleAuthButton.tsx";
function ensureGoogleScript() {
	const scriptId = "google-identity-services";
	const existing = document.getElementById(scriptId);
	if (existing) {
		if (existing.dataset.loaded === "true") return Promise.resolve();
		return new Promise((resolve, reject) => {
			existing.addEventListener("load", () => resolve(), { once: true });
			existing.addEventListener("error", () => reject(/* @__PURE__ */ new Error("Falha ao carregar Google Identity.")), { once: true });
		});
	}
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.id = scriptId;
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.onload = () => {
			script.dataset.loaded = "true";
			resolve();
		};
		script.onerror = () => reject(/* @__PURE__ */ new Error("Falha ao carregar Google Identity."));
		document.head.appendChild(script);
	});
}
function GoogleAuthButton({ onCredential, disabled = false, text = "Continuar com Google" }) {
	const [error, setError] = useState(null);
	const [busy, setBusy] = useState(false);
	const containerRef = useRef(null);
	const clientId = useMemo(() => {
		return ({
			"BASE_URL": "/",
			"DEV": true,
			"MODE": "production",
			"PROD": false,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/",
			"VITE_USER_NODE_ENV": "development"
		}.VITE_GOOGLE_CLIENT_ID ?? "").trim();
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
					callback: async (response) => {
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
					}
				});
				containerRef.current.innerHTML = "";
				window.google.accounts.id.renderButton(containerRef.current, {
					theme: "outline",
					size: "large",
					text: "continue_with",
					shape: "rectangular",
					width: 320
				});
			} catch (err) {
				if (!cancelled) setError(err instanceof Error ? err.message : "Falha ao iniciar Google Login.");
			}
		}
		mountButton();
		return () => {
			cancelled = true;
		};
	}, [clientId, onCredential]);
	if (!clientId) return /* @__PURE__ */ jsxDEV("p", {
		className: "mt-3 text-xs text-muted-foreground",
		children: "Google Login indisponivel: defina VITE_GOOGLE_CLIENT_ID no ambiente."
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 130,
		columnNumber: 7
	}, this);
	return /* @__PURE__ */ jsxDEV("div", {
		className: "mt-4",
		children: [
			/* @__PURE__ */ jsxDEV("div", {
				className: disabled || busy ? "pointer-events-none opacity-70" : "",
				children: /* @__PURE__ */ jsxDEV("div", { ref: containerRef }, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 139,
					columnNumber: 9
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 138,
				columnNumber: 7
			}, this),
			disabled || busy ? /* @__PURE__ */ jsxDEV("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: text
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 142,
				columnNumber: 9
			}, this) : null,
			error ? /* @__PURE__ */ jsxDEV("p", {
				className: "mt-2 text-xs text-destructive",
				children: error
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 145,
				columnNumber: 9
			}, this) : null
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 137,
		columnNumber: 5
	}, this);
}
//#endregion
export { GoogleAuthButton as t };
