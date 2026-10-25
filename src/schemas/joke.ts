import * as z from "zod";

export const JokeSchema = z.object({
  id: z.string(),
  value: z.string(),
});

export type Joke = z.infer<typeof JokeSchema>;
