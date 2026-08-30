import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/components/site/StatusNotice.tsx
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/components/site/StatusNotice.tsx";
var variantClass = {
	loading: "border-border/60 bg-background/70 text-muted-foreground",
	success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
	error: "border-destructive/20 bg-destructive/10 text-destructive",
	empty: "border-border/60 bg-background/70 text-muted-foreground",
	info: "border-amber-500/30 bg-amber-500/10 text-amber-700"
};
function StatusNotice({ variant, message, title, className, actions }) {
	return /* @__PURE__ */ jsxDEV("article", {
		className: `rounded-2xl border px-4 py-3 text-sm ${variantClass[variant]} ${className ?? ""}`.trim(),
		children: [
			title ? /* @__PURE__ */ jsxDEV("p", {
				className: "font-medium",
				children: title
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 28,
				columnNumber: 16
			}, this) : null,
			/* @__PURE__ */ jsxDEV("p", {
				className: title ? "mt-1" : void 0,
				children: message
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 29,
				columnNumber: 7
			}, this),
			actions ? /* @__PURE__ */ jsxDEV("div", {
				className: "mt-3",
				children: actions
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 30,
				columnNumber: 18
			}, this) : null
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 27,
		columnNumber: 5
	}, this);
}
//#endregion
export { StatusNotice as t };
