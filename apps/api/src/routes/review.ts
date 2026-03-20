import type { FastifyInstance } from "fastify";
import type { ApiErrorResponse, ReviewResponse } from "../../../../packages/schemas/src/review";
import { runReview } from "../review-engine";
import { validateReviewRequest } from "../validation";

export async function reviewRoutes(app: FastifyInstance) {
  app.options("/review", async (_request, reply) => {
    reply.code(204).send();
  });

  app.post<{ Reply: ReviewResponse | ApiErrorResponse }>("/review", async (request, reply) => {
    const validation = validateReviewRequest(request.body);

    if (!validation.ok) {
      reply.code(400);
      return {
        error: "invalid_review_request",
        message: "Review request failed validation at the API boundary.",
        details: validation.errors,
      };
    }

    return runReview(validation.value);
  });
}
