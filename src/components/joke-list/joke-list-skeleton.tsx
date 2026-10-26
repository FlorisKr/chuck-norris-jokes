import { JOKE_COUNT } from "../../queries/jokes";
import { JokeCardSkeleton } from "./joke-card-skeleton";

export function JokeListSkeleton() {
  return (
    <>
      <output className="sr-only">Loading jokes</output>
      <ul aria-hidden="true" className="flex flex-col gap-3">
        {Array.from({ length: JOKE_COUNT }, (_, index) => (
          <li key={index}>
            <JokeCardSkeleton />
          </li>
        ))}
      </ul>
    </>
  );
}
