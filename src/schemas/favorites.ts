import * as z from "zod";

import { JokeSchema } from "./joke";

export const FavoritesSchema = z.array(JokeSchema);

export type Favorites = z.infer<typeof FavoritesSchema>;
