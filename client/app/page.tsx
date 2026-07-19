import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Database,
  Globe,
  Layers,
  ListChecks,
  Monitor,
  Server,
  Sparkles,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type CurrentUser = {
  id: string;
  username: string;
  email: string;
};

async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.COOKIE_NAME!);

  if (!token) return null;

  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      Cookie: `${process.env.COOKIE_NAME}=${token.value}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) return null;

  const json = (await response.json()) as { data: CurrentUser };
  return json.data;
}

const highlights = [
  { value: "1M+", label: "Todos streamed" },
  { value: "100", label: "Subtasks per todo" },
  { value: "NDJSON", label: "Chunked delivery" },
  { value: "60fps", label: "Virtualized scroll" },
];

const backendFeatures = [
  "Express + TypeScript API with JWT auth over httpOnly cookies",
  "PostgreSQL + Prisma with cursor-based pagination on 1M todo rows",
  "NDJSON streaming — todos arrive in batches without loading the full payload upfront",
  "Subtask model with fractional position ordering for O(1) drag-and-drop inserts",
  "Denormalized subtaskCount on todos to avoid expensive joins at list scale",
];

const frontendFeatures = [
  "Next.js App Router — Server Components for auth shell, Client Components for interactive lists",
  "Custom VirtualList with proportional scroll mapping for million-row lists",
  "Progressive stream reader with batched state updates to avoid 1M re-renders",
  "Virtualized subtask sheet with dnd-kit reorder and optimistic API updates",
  "TanStack Query for subtask server state — cache, mutations, and invalidation",
];

const scalabilityBenchmarks = [
  { dataset: "750,000 todos", status: "🌐 Live demo" },
  { dataset: "1,000,000 todos", status: "✅ Tested locally" },
  { dataset: "2,000,000 todos", status: "✅ Tested locally" },
  { dataset: "NDJSON streaming", status: "✅" },
  { dataset: "PostgreSQL Full-Text Search", status: "✅" },
  { dataset: "Client-side Virtualization", status: "✅" },
  { dataset: "O(1) Todo Lookup", status: "✅" },
];

const strengths = [
  {
    icon: Zap,
    title: "Progressive at scale",
    description:
      "The UI renders todos as they stream in. You are not blocked waiting for a million-row JSON response.",
  },
  {
    icon: Layers,
    title: "Right tool per data shape",
    description:
      "Custom streaming for the todo firehose, React Query for subtask CRUD — no one-size-fits-all data layer.",
  },
  {
    icon: Database,
    title: "Database-aware design",
    description:
      "Indexes, denormalized counters, and cursor pagination chosen for real PostgreSQL workloads, not demo-sized tables.",
  },
  {
    icon: Monitor,
    title: "DOM-bounded rendering",
    description:
      "Virtualization keeps only visible rows in the DOM, so scrolling stays smooth even with enormous datasets.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  console.log(user);

  if (user) {
    redirect("/todos");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_32rem),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.55))] px-4 py-10 font-sans sm:px-6 lg:px-8">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        {/* Hero */}
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-primary/10 via-background to-muted/50 p-8 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Full-stack performance study
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Million Todos
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
              A todo app built to stress-test what happens when your dataset is
              not small. It streams a million todos, virtualizes the list in the
              browser, and manages up to 100 subtasks per item — without
              freezing the UI or choking the database.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/login">
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/register">Create an account</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {highlights.map((item) => (
            <Card
              key={item.label}
              className="rounded-2xl py-5 text-center shadow-sm"
            >
              <CardContent className="flex flex-col gap-1 px-4">
                <span className="text-2xl font-semibold tabular-nums">
                  {item.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Backend / Frontend */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Server className="size-4" />
              </div>
              <CardTitle className="text-lg">Backend</CardTitle>
              <CardDescription className="text-sm">
                Node, Express, Prisma, PostgreSQL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                {backendFeatures.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <ListChecks className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Monitor className="size-4" />
              </div>
              <CardTitle className="text-lg">Frontend</CardTitle>
              <CardDescription className="text-sm">
                Next.js, React, TanStack Query
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                {frontendFeatures.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <ListChecks className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Strengths */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-lg font-semibold">What this demonstrates</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {strengths.map((item) => (
              <Card key={item.title} className="rounded-2xl shadow-sm">
                <CardContent className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <item.icon className="size-4 text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Live Demo */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            <h2 className="text-lg font-semibold">Live Demo</h2>
          </div>
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
              <p>
                The hosted demo runs with approximately 750,000 todos. This
                limit is intentional to remain within the storage constraints of
                free-tier hosting while still demonstrating streaming,
                virtualization, PostgreSQL indexing, and efficient rendering at
                large scale.
              </p>
              <p>
                The project is fully Dockerized. To evaluate the complete
                scalability of the application (up to 2 million todos), clone
                the repository and run:
              </p>
              <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/50 px-4 py-3 font-mono text-xs text-foreground sm:text-sm">
                {`docker compose up
npm run seed:2m`}
              </pre>
              <p>
                This reproduces the large-scale environment used during
                development and benchmarking.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Scalability Benchmarks */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <h2 className="text-lg font-semibold">Scalability Benchmarks</h2>
          </div>
          <Card className="overflow-hidden rounded-2xl shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[20rem] text-sm">
                  <thead>
                    <tr className="border-b border-border/70 bg-muted/40">
                      <th className="px-4 py-3 text-left font-medium">
                        Dataset
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scalabilityBenchmarks.map((row) => (
                      <tr
                        key={row.dataset}
                        className="border-b border-border/50 last:border-b-0"
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.dataset}
                        </td>
                        <td className="px-4 py-3">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <Card className="rounded-2xl border-dashed bg-muted/30 shadow-none">
          <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-medium">Ready to try it?</p>
              <p className="text-sm text-muted-foreground">
                Log in to stream todos, open subtask sheets, and drag to
                reorder.
              </p>
            </div>
            <Button asChild>
              <Link href="/login">
                Open the app
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
