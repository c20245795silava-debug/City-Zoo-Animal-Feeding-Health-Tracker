import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowDownRight, ArrowRight, CalendarDays, ClipboardCheck, Clock3, Leaf, PawPrint, Plus, Salad, ShieldAlert } from 'lucide-react';

interface DashboardSummary {
    animalCount: number;
    feedingCountToday: number;
    feedQuantityToday: number;
    vetReviewCount: number;
}

interface SpeciesCount {
    species: string;
    total: number;
}

interface RecentFeeding {
    id: number;
    animal: { animal_tag_id: string; species: string };
    zookeeper: { name: string };
    feed_type: { name: string };
    feed_quantity_kg: string;
    feeding_date: string;
    feeding_time: string;
    health_condition: string | null;
    vet_check_required: boolean;
}

interface DashboardProps {
    summary: DashboardSummary;
    speciesBreakdown: SpeciesCount[];
    recentFeedings: RecentFeeding[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

function formatDate(date: string): string {
    const [year, month, day] = date.slice(0, 10).split('-').map(Number);
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(year, month - 1, day));
}

function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, hours, minutes));
}

export default function Dashboard({ summary, speciesBreakdown, recentFeedings }: DashboardProps) {
    const maxSpeciesCount = Math.max(...speciesBreakdown.map((item) => item.total), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zoo care dashboard" />
            <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:space-y-8 md:p-8">
                <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-6 py-8 text-white shadow-lg shadow-emerald-950/10 sm:px-9 sm:py-10">
                    <div className="pointer-events-none absolute -top-32 -right-16 -z-10 size-96 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute -top-20 -right-4 -z-10 size-72 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute right-1/4 -bottom-28 -z-10 size-60 rounded-full bg-lime-300/10 blur-3xl" />

                    <div className="relative flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <Badge className="mb-5 border border-white/15 bg-white/10 text-emerald-50 hover:bg-white/10">
                                <Leaf className="mr-1.5 size-3.5" />
                                CITY ZOO · CARE OPERATIONS
                            </Badge>
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">A healthier day starts with good care.</h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
                                Keep animal records, feeding activity, and health follow-ups in view—all in one place.
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-sm text-emerald-50/80 md:pb-1">
                            <CalendarDays className="size-4" />
                            <span>{new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}</span>
                        </div>
                    </div>
                </section>

                <section aria-label="Zoo summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="group border-border/70 shadow-sm transition-shadow hover:shadow-md">
                        <CardContent className="flex items-start justify-between p-5">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Animals in care</p>
                                <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.animalCount}</p>
                                <p className="text-muted-foreground mt-1 text-xs">Registered zoo residents</p>
                            </div>
                            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                <PawPrint className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group border-border/70 shadow-sm transition-shadow hover:shadow-md">
                        <CardContent className="flex items-start justify-between p-5">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Feedings today</p>
                                <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.feedingCountToday}</p>
                                <p className="text-muted-foreground mt-1 text-xs">Feeding logs recorded today</p>
                            </div>
                            <div className="rounded-xl bg-sky-100 p-2.5 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">
                                <Salad className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group border-border/70 shadow-sm transition-shadow hover:shadow-md">
                        <CardContent className="flex items-start justify-between p-5">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Feed served today</p>
                                <p className="mt-2 text-3xl font-semibold tracking-tight">
                                    {summary.feedQuantityToday.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    <span className="text-muted-foreground ml-1 text-base font-medium">kg</span>
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">Across all recorded meals</p>
                            </div>
                            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                <ClipboardCheck className="size-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group border-border/70 shadow-sm transition-shadow hover:shadow-md">
                        <CardContent className="flex items-start justify-between p-5">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Vet follow-up flags</p>
                                <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.vetReviewCount}</p>
                                <p className="text-muted-foreground mt-1 text-xs">Feeding logs marked for review</p>
                            </div>
                            <div
                                className={`rounded-xl p-2.5 ${
                                    summary.vetReviewCount > 0
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                <ShieldAlert className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
                    <Card className="border-border/70 shadow-sm">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                            <div className="space-y-1">
                                <CardTitle className="text-lg">Recent feeding activity</CardTitle>
                                <CardDescription>The latest meals recorded by your keepers.</CardDescription>
                            </div>
                            <div className="bg-muted text-muted-foreground rounded-xl p-2">
                                <Clock3 className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-6 pb-5">
                            {recentFeedings.length > 0 ? (
                                <div className="divide-y">
                                    {recentFeedings.map((feeding) => (
                                        <div key={feeding.id} className="flex items-center gap-3 py-4 first:pt-1 last:pb-0 sm:gap-4">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100">
                                                {feeding.animal.animal_tag_id.slice(0, 2)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="truncate text-sm font-semibold">{feeding.animal.animal_tag_id}</p>
                                                    {feeding.vet_check_required && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                                                        >
                                                            Vet follow-up
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground mt-1 truncate text-xs">
                                                    {feeding.animal.species} <span className="px-1">·</span> {feeding.feed_type.name}{' '}
                                                    <span className="px-1">·</span> {feeding.zookeeper.name}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-sm font-semibold">{Number(feeding.feed_quantity_kg).toLocaleString()} kg</p>
                                                <p className="text-muted-foreground mt-1 text-xs">
                                                    {formatDate(feeding.feeding_date)} · {formatTime(feeding.feeding_time)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-muted/20 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center">
                                    <div className="mb-3 rounded-full bg-emerald-100 p-3 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                        <Salad className="size-5" />
                                    </div>
                                    <p className="font-medium">No feeding activity yet</p>
                                    <p className="text-muted-foreground mt-1 max-w-xs text-sm">
                                        Feeding records will show here once your keepers log a meal.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/70 shadow-sm">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-lg">Collection snapshot</CardTitle>
                            <CardDescription>Animal counts by species.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {speciesBreakdown.length > 0 ? (
                                <div className="space-y-5">
                                    {speciesBreakdown.map((item) => (
                                        <div key={item.species} className="space-y-2">
                                            <div className="flex items-center justify-between gap-3 text-sm">
                                                <span className="truncate font-medium">{item.species}</span>
                                                <span className="text-muted-foreground shrink-0">{item.total}</span>
                                            </div>
                                            <div
                                                className="bg-muted h-2 overflow-hidden rounded-full"
                                                role="progressbar"
                                                aria-label={`${item.species} share of collection`}
                                                aria-valuenow={item.total}
                                                aria-valuemin={0}
                                                aria-valuemax={maxSpeciesCount}
                                            >
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all"
                                                    style={{ width: `${(item.total / maxSpeciesCount) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-muted/20 flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center">
                                    <PawPrint className="text-muted-foreground mb-3 size-6" />
                                    <p className="font-medium">Your collection is ready to grow</p>
                                    <p className="text-muted-foreground mt-1 text-sm">Registered species will appear in this snapshot.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section className="border-border/70 bg-card flex flex-col gap-4 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                            <PawPrint className="size-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Keep care moving</h2>
                            <p className="text-muted-foreground mt-1 text-sm">Update the animal directory or record today’s feeding activity.</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button asChild variant="outline" className="shrink-0">
                            <Link href="/animals/create">
                                <Plus />
                                Register animal
                            </Link>
                        </Button>
                        <Button asChild className="shrink-0">
                            <Link href="/feeding-logs/create">
                                <Salad />
                                Log a feeding
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </section>

                {summary.vetReviewCount > 0 && (
                    <div className="text-muted-foreground flex items-start gap-2 text-xs">
                        <ArrowDownRight className="mt-0.5 size-4 shrink-0 text-rose-600" />
                        Vet follow-up flags reflect feeding logs marked as requiring review.
                    </div>
                )}
            </main>
        </AppLayout>
    );
}
