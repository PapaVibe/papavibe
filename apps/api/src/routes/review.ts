import type { FastifyInstance } from "fastify";
import type { ReviewRequest, ReviewResponse } from "../../../../packages/schemas/src/review";
import { runReview } from "../review-engine";

export async function reviewRoutes(app: FastifyInstance) {
  app.options("/review", async (_request, reply) => {
    reply.code(204).send();
  });

  app.post<{ Body: ReviewRequest; Reply: ReviewResponse }>("/review", async (request) => {
    return runReview(request.body);
  });
}
