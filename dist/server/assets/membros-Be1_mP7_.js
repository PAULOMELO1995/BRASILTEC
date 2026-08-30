import { O as getSessionData, S as getMyLearningTrack, V as setLessonProgress, n as PageShell, x as getMyEnrollments } from "./PageShell-BwxNyzYO.js";
import { t as StatusNotice } from "./StatusNotice-BJzn6QC4.js";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsxDEV } from "react/jsx-dev-runtime";
//#region src/routes/membros.tsx?tsr-split=component
var _jsxFileName = "C:/Users/pfime/OneDrive/Desktop/BRASILTEC/src/routes/membros.tsx?tsr-split=component";
function MembrosPage() {
	const [items, setItems] = useState([]);
	const [tracksByProduct, setTracksByProduct] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);
	const [updatingLessonId, setUpdatingLessonId] = useState(null);
	useEffect(() => {
		let cancelled = false;
		async function loadData() {
			setLoading(true);
			setError(null);
			setSuccess(null);
			try {
				await getSessionData();
				const enrollments = await getMyEnrollments();
				if (cancelled) return;
				setItems(enrollments);
				const tracks = await Promise.all(enrollments.map(async (enrollment) => {
					const modules = await getMyLearningTrack({ data: { productId: enrollment.productId } });
					return {
						productId: enrollment.productId,
						modules
					};
				}));
				if (cancelled) return;
				const nextTracks = {};
				for (const track of tracks) nextTracks[track.productId] = track.modules;
				setTracksByProduct(nextTracks);
			} catch {
				if (cancelled) return;
				setError("Não foi possível carregar sua trilha de membros.");
				window.location.assign("/login");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		loadData();
		return () => {
			cancelled = true;
		};
	}, []);
	async function handleToggleLesson(productId, lessonId, currentCompleted) {
		if (updatingLessonId) return;
		setUpdatingLessonId(lessonId);
		setSuccess(null);
		getSessionData().then(() => setLessonProgress({ data: {
			lessonId,
			completed: !currentCompleted
		} })).then(async () => {
			const [enrollments, modules] = await Promise.all([getMyEnrollments(), getMyLearningTrack({ data: { productId } })]);
			setItems(enrollments);
			setTracksByProduct((prev) => ({
				...prev,
				[productId]: modules
			}));
			setError(null);
			setSuccess(!currentCompleted ? "Aula marcada como concluída com sucesso." : "Aula desmarcada com sucesso.");
		}).catch(() => {
			setError("Não foi possível atualizar o progresso da aula.");
		}).finally(() => setUpdatingLessonId(null));
	}
	return /* @__PURE__ */ jsxDEV(PageShell, { children: /* @__PURE__ */ jsxDEV("section", {
		className: "container-page py-14",
		children: /* @__PURE__ */ jsxDEV("div", {
			className: "panel-elevated p-7 md:p-9",
			children: [
				/* @__PURE__ */ jsxDEV("span", {
					className: "eyebrow",
					children: "Área de Membros"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 109,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("h1", {
					className: "mt-2 text-3xl",
					children: "Meus conteúdos"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 110,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Produtos liberados automaticamente após compra aprovada."
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 111,
					columnNumber: 11
				}, this),
				loading ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "loading",
					message: "Carregando conteúdos...",
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 113,
					columnNumber: 22
				}, this) : null,
				error ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "error",
					message: error,
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 114,
					columnNumber: 20
				}, this) : null,
				success ? /* @__PURE__ */ jsxDEV(StatusNotice, {
					variant: "success",
					message: success,
					className: "mt-6"
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 115,
					columnNumber: 22
				}, this) : null,
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 grid gap-4",
					children: [!loading && items.length === 0 ? /* @__PURE__ */ jsxDEV(StatusNotice, {
						variant: "empty",
						message: "Você ainda não possui matrículas. Vá ao marketplace e finalize uma compra para liberar o acesso.",
						className: "p-5"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 118,
						columnNumber: 47
					}, this) : null, items.map((item) => /* @__PURE__ */ jsxDEV("article", {
						className: "rounded-2xl border border-border/60 bg-background/70 p-5",
						children: [
							/* @__PURE__ */ jsxDEV("h2", {
								className: "text-lg font-semibold",
								children: item.productName
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 121,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: item.productDescription
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 122,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("p", {
								className: "mt-3 text-xs uppercase tracking-wide text-primary",
								children: [
									"Progresso: ",
									item.progressPercent,
									"%"
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 123,
								columnNumber: 17
							}, this),
							/* @__PURE__ */ jsxDEV("div", {
								className: "mt-4 grid gap-3",
								children: (tracksByProduct[item.productId] ?? []).map((module) => /* @__PURE__ */ jsxDEV("section", {
									className: "rounded-xl border border-border/60 bg-background/80 p-4",
									children: [/* @__PURE__ */ jsxDEV("h3", {
										className: "text-sm font-semibold",
										children: module.title
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 127,
										columnNumber: 23
									}, this), /* @__PURE__ */ jsxDEV("ul", {
										className: "mt-3 grid gap-2",
										children: module.lessons.map((lesson) => /* @__PURE__ */ jsxDEV("li", {
											className: "rounded-lg border border-border/50 bg-background/90 p-3",
											children: /* @__PURE__ */ jsxDEV("div", {
												className: "flex flex-wrap items-start justify-between gap-3",
												children: [/* @__PURE__ */ jsxDEV("div", { children: [/* @__PURE__ */ jsxDEV("p", {
													className: "text-sm font-medium text-foreground",
													children: lesson.title
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 132,
													columnNumber: 33
												}, this), /* @__PURE__ */ jsxDEV("p", {
													className: "mt-1 text-xs text-muted-foreground",
													children: lesson.content
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 133,
													columnNumber: 33
												}, this)] }, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 131,
													columnNumber: 31
												}, this), /* @__PURE__ */ jsxDEV("button", {
													type: "button",
													className: lesson.completed ? "btn-base btn-ghost" : "btn-base btn-primary",
													disabled: Boolean(updatingLessonId),
													onClick: () => void handleToggleLesson(item.productId, lesson.id, lesson.completed),
													children: updatingLessonId === lesson.id ? "Atualizando..." : lesson.completed ? "Concluída" : "Marcar como concluída"
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 136,
													columnNumber: 31
												}, this)]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 130,
												columnNumber: 29
											}, this)
										}, lesson.id, false, {
											fileName: _jsxFileName,
											lineNumber: 129,
											columnNumber: 55
										}, this))
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 128,
										columnNumber: 23
									}, this)]
								}, module.id, true, {
									fileName: _jsxFileName,
									lineNumber: 126,
									columnNumber: 74
								}, this))
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 125,
								columnNumber: 17
							}, this)
						]
					}, item.id, true, {
						fileName: _jsxFileName,
						lineNumber: 120,
						columnNumber: 32
					}, this))]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 117,
					columnNumber: 11
				}, this),
				/* @__PURE__ */ jsxDEV("div", {
					className: "mt-6 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ jsxDEV(Link, {
						to: "/marketplace",
						className: "btn-base btn-primary",
						children: "Ir ao marketplace"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 148,
						columnNumber: 13
					}, this), /* @__PURE__ */ jsxDEV(Link, {
						to: "/painel",
						className: "btn-base btn-ghost",
						children: "Voltar ao painel"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 151,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 147,
					columnNumber: 11
				}, this)
			]
		}, void 0, true, {
			fileName: _jsxFileName,
			lineNumber: 108,
			columnNumber: 9
		}, this)
	}, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 107,
		columnNumber: 7
	}, this) }, void 0, false, {
		fileName: _jsxFileName,
		lineNumber: 106,
		columnNumber: 10
	}, this);
}
//#endregion
export { MembrosPage as component };
