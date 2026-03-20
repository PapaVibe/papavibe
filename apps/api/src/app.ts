import Fastify from "fastify";
import { reviewRoutes } from "./routes/review";
import { getStatus } from "./status";
import { getContract } from "./contract";
import { getEndpoints } from "./endpoints";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.addHook("onRequest", async (request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
      reply.code(204).send();
    }
  });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    if (reply.sent) {
      return;
    }

    const fastifyError = error as { statusCode?: number; message?: string };
    const statusCode = fastifyError.statusCode && fastifyError.statusCode >= 400 ? fastifyError.statusCode : 500;

    reply.code(statusCode).send({
      error: statusCode >= 500 ? "internal_error" : "request_error",
      message:
        statusCode >= 500
          ? "PapaVibe hit an unexpected server error while reviewing the request."
          : fastifyError.message ?? "Request failed.",
      details: statusCode >= 500 ? ["Check API logs for the server-side failure context."] : undefined,
    });
  });

  app.get("/health", async () => ({ ok: true }));
  app.get("/status", async () => getStatus());
  app.get("/contract", async () => getContract());
  app.get("/endpoints", async () => getEndpoints());
  app.register(reviewRoutes);

  return app;
}
