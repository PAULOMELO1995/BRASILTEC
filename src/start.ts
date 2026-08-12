import * as ReactStart from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const createStart = ReactStart.createStart;
const createMiddleware = ReactStart.createMiddleware;
const createCsrfMiddleware = (ReactStart as { createCsrfMiddleware?: unknown }).createCsrfMiddleware;

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// createCsrfMiddleware may be undefined after edge bundling; fall back to a passthrough.
const csrfMiddleware =
  typeof createCsrfMiddleware === "function"
    ? (createCsrfMiddleware as (options: { filter: (ctx: { handlerType?: string }) => boolean }) => ReturnType<typeof createMiddleware>)({
        filter: (ctx) => ctx.handlerType === "serverFn",
      })
    : createMiddleware().server(async ({ next }) => next());

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
