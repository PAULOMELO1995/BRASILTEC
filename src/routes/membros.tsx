import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { StatusNotice } from "@/components/site/StatusNotice";
import { getMyEnrollments, getMyLearningTrack, getSessionData, setLessonProgress } from "@/lib/auth-server";

export const Route = createFileRoute("/membros")({
  component: MembrosPage,
});

type Enrollment = {
  id: string;
  productId: string;
  productName: string;
  productDescription: string;
  progressPercent: number;
  createdAt: string;
};

type LearningLesson = {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  sortOrder: number;
  completed: boolean;
  completedAt: string | null;
};

type LearningModule = {
  id: string;
  productId: string;
  title: string;
  sortOrder: number;
  lessons: LearningLesson[];
};

function MembrosPage() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const [tracksByProduct, setTracksByProduct] = useState<Record<string, LearningModule[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingLessonId, setUpdatingLessonId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        await getSessionData();
        const enrollments = (await getMyEnrollments()) as Enrollment[];
        if (cancelled) return;

        setItems(enrollments);

        const tracks = await Promise.all(
          enrollments.map(async (enrollment) => {
            const modules = (await getMyLearningTrack({ data: { productId: enrollment.productId } })) as LearningModule[];
            return { productId: enrollment.productId, modules };
          }),
        );

        if (cancelled) return;

        const nextTracks: Record<string, LearningModule[]> = {};
        for (const track of tracks) {
          nextTracks[track.productId] = track.modules;
        }
        setTracksByProduct(nextTracks);
      } catch {
        if (cancelled) return;
        setError("Não foi possível carregar sua trilha de membros.");
        window.location.assign("/login");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggleLesson(productId: string, lessonId: string, currentCompleted: boolean) {
    if (updatingLessonId) return;

    setUpdatingLessonId(lessonId);
    setSuccess(null);
    getSessionData()
      .then(() => setLessonProgress({ data: { lessonId, completed: !currentCompleted } }))
      .then(async () => {
        const [enrollments, modules] = await Promise.all([
          getMyEnrollments(),
          getMyLearningTrack({ data: { productId } }),
        ]);

        setItems(enrollments as Enrollment[]);
        setTracksByProduct((prev) => ({
          ...prev,
          [productId]: modules as LearningModule[],
        }));
        setError(null);
        setSuccess(!currentCompleted ? "Aula marcada como concluída com sucesso." : "Aula desmarcada com sucesso.");
      })
      .catch(() => {
        setError("Não foi possível atualizar o progresso da aula.");
      })
      .finally(() => setUpdatingLessonId(null));
  }

  return (
    <PageShell>
      <section className="container-page py-14">
        <div className="panel-elevated p-7 md:p-9">
          <span className="eyebrow">Área de Membros</span>
          <h1 className="mt-2 text-3xl">Meus conteúdos</h1>
          <p className="mt-2 text-sm text-muted-foreground">Produtos liberados automaticamente após compra aprovada.</p>

          {loading ? <StatusNotice variant="loading" message="Carregando conteúdos..." className="mt-6" /> : null}
          {error ? <StatusNotice variant="error" message={error} className="mt-6" /> : null}
          {success ? <StatusNotice variant="success" message={success} className="mt-6" /> : null}

          <div className="mt-6 grid gap-4">
            {!loading && items.length === 0 ? (
              <StatusNotice
                variant="empty"
                message="Você ainda não possui matrículas. Vá ao marketplace e finalize uma compra para liberar o acesso."
                className="p-5"
              />
            ) : null}

            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border/60 bg-background/70 p-5">
                <h2 className="text-lg font-semibold">{item.productName}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.productDescription}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-primary">Progresso: {item.progressPercent}%</p>

                <div className="mt-4 grid gap-3">
                  {(tracksByProduct[item.productId] ?? []).map((module) => (
                    <section key={module.id} className="rounded-xl border border-border/60 bg-background/80 p-4">
                      <h3 className="text-sm font-semibold">{module.title}</h3>
                      <ul className="mt-3 grid gap-2">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="rounded-lg border border-border/50 bg-background/90 p-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{lesson.content}</p>
                              </div>

                              <button
                                type="button"
                                className={lesson.completed ? "btn-base btn-ghost" : "btn-base btn-primary"}
                                disabled={Boolean(updatingLessonId)}
                                onClick={() => void handleToggleLesson(item.productId, lesson.id, lesson.completed)}
                              >
                                {updatingLessonId === lesson.id
                                  ? "Atualizando..."
                                  : lesson.completed
                                    ? "Concluída"
                                    : "Marcar como concluída"}
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/marketplace" className="btn-base btn-primary">
              Ir ao marketplace
            </Link>
            <Link to="/painel" className="btn-base btn-ghost">
              Voltar ao painel
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
