import Fastify from "fastify";
import { reviewRoutes } from "./routes/review";
import { getStatus } from "./status";
import { getContract } from "./contract";
import { getEndpoints } from "./endpoints";

const app = Fastify({ logger: true });

app.addHook("onRequest", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    reply.code(204).send();
  }
});

app.get("/health", async () => ({ ok: true }));
app.get("/status", async () => getStatus());
app.get("/contract", async () => getContract());
app.get("/endpoints", async () => getEndpoints());
app.register(reviewRoutes);

const port = Number(process.env.PORT || 8787);

app.listen({ port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
