import { JokeList } from "./components/joke-list";

export function App() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <h1 className="text-4xl font-bold text-foreground">Chuck Norris Jokes</h1>
      <JokeList />
    </main>
  );
}
