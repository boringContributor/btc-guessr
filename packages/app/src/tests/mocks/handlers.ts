import { rest } from "msw";

export const handlers = [
  rest.post("/new-guess", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: "123456",
      })
    );
  }),

  rest.get("/check-result/:id", (req, res, ctx) => {
    const { id } = req.params;

    return res(
      ctx.status(200),
      ctx.json({
        id,
        timestamp: new Date().toISOString(),
        guess: "up",
      })
    );
  }),
];
