import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarDays, ClipboardList, Clock3, Leaf, Plus, Search, Utensils, X } from 'lucide-react';
import { useState } from 'react';

interface FeedingLog {
    id: number;
    animal: { id: number; animal_tag_id: string; species: string; enclosure: { id: number; zone_name: string } };
    zookeeper: { id: number; name: string };
    feed_type: { id: number; name: string };
    feed_quantity_kg: string;
    feeding_date: string;
    feeding_time: string;
    health_condition: string | null;
    vet_check_required: boolean;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface FeedingLogPage {
    data: FeedingLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface FeedingIndexProps {
    logs: FeedingLogPage;
    filters: { search: string; review: string };
    summary: { total: number; needsReview: number; totalQuantity: number };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Feeding records', href: '/feeding-logs' }];

function formatDate(date: string): string {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(2000, 0, 1, hours, minutes));
}

export default function FeedingIndex({ logs, filters, summary }: FeedingIndexProps) {
    const [search, setSearch] = useState(filters.search);

    function updateFilters(nextSearch: string, review: string) {
        const params: Record<string, string> = {};
        if (nextSearch.trim()) params.search = nextSearch.trim();
        if (review !== 'all') params.review = review;
        router.get(route('feeding-logs.index'), params, { preserveState: true, preserveScroll: true, replace: true });
    }

    function submitSearch(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        updateFilters(search, filters.review);
    }

    function clearSearch() {
        setSearch('');
        updateFilters('', filters.review);
    }

    const pageLinks = logs.links.filter(
        (link): link is PaginationLink & { url: string } => link.url !== null && /^\d+$/.test(link.label),
    );
    const previousUrl = logs.links[0]?.url;
    const nextUrl = logs.links[logs.links.length - 1]?.url;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feeding records" />
            <main className="mx-auto w-full max-w-7xl space-y-7 p-4 md:space-y-8 md:p-8">
                <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-sky-950 via-teal-900 to-emerald-800 px-6 py-8 text-white shadow-lg shadow-sky-950/10 sm:px-9 sm:py-9">
                    <div className="pointer-events-none absolute -right-10 -top-20 -z-10 size-72 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute -bottom-24 right-1/4 -z-10 size-56 rounded-full bg-cyan-300/10 blur-3xl" />
                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <Badge className="mb-4 border border-white/15 bg-white/10 text-sky-50 hover:bg-white/10">
                                <Leaf className="mr-1.5 size-3.5" />
                                DAILY CARE · FEEDING LOG
                            </Badge>
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Every meal, accounted for.</h1>
                            <p className="mt-2 text-sm leading-6 text-sky-50/75 sm:text-base">
                                Review feeding activity, track nutrition, and follow up on animal health observations.
                            </p>
                        </div>
                        <Button asChild className="shrink-0 bg-white text-sky-950 hover:bg-sky-50">
                            <Link href={route('feeding-logs.create')}>
                                <Plus />
                                Log a feeding
                            </Link>
                        </Button>
                    </div>
                </section>

                <section aria-label="Feeding record summary" className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-border/70 shadow-sm">
                        <CardContent className="flex items-start justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Feeding records</p>
                                <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.total}</p>
                                <p className="mt-1 text-xs text-muted-foreground">All recorded meals</p>
                            </div>
                            <div className="rounded-xl bg-sky-100 p-2.5 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300">
                                <ClipboardList className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/70 shadow-sm">
                        <CardContent className="flex items-start justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Marked for vet review</p>
                                <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.needsReview}</p>
                                <p className="mt-1 text-xs text-muted-foreground">Feeding records requiring follow-up</p>
                            </div>
                            <div
                                className={`rounded-xl p-2.5 ${
                                    summary.needsReview
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                <AlertTriangle className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/70 shadow-sm">
                        <CardContent className="flex items-start justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total feed recorded</p>
                                <p className="mt-2 text-3xl font-semibold tracking-tight">
                                    {summary.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    <span className="ml-1 text-base font-medium text-muted-foreground">kg</span>
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">Across all feeding records</p>
                            </div>
                            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                <Utensils className="size-5" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Feeding activity</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {logs.total} {logs.total === 1 ? 'record' : 'records'}
                            {filters.review === 'needs-review' ? ' needing vet review' : ''}
                        </p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <form onSubmit={submitSearch} className="flex w-full gap-2 sm:max-w-md">
                            <div className="relative flex-1 sm:w-72">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    aria-label="Search feeding records"
                                    placeholder="Animal, feed, keeper, or condition"
                                    className="pl-9 pr-9"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                                {search && (
                                    <button
                                        type="button"
                                        aria-label="Clear search"
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                            <Button type="submit" variant="secondary">Search</Button>
                        </form>
                        <Select value={filters.review} onValueChange={(value) => updateFilters(search, value)}>
                            <SelectTrigger aria-label="Filter by veterinary review" className="w-full sm:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All records</SelectItem>
                                <SelectItem value="needs-review">Needs vet review</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </section>

                {logs.data.length > 0 ? (
                    <>
                        <section aria-label="Feeding records" className="grid gap-4 xl:grid-cols-2">
                            {logs.data.map((log) => (
                                <Card key={log.id} className="overflow-hidden border-border/70 shadow-sm transition-shadow hover:shadow-md">
                                    <div className={`h-1 ${log.vet_check_required ? 'bg-rose-500' : 'bg-gradient-to-r from-sky-600 to-emerald-400'}`} />
                                    <CardContent className="p-5">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                            <div
                                                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                                                    log.vet_check_required
                                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                                                        : 'bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-200'
                                                }`}
                                            >
                                                {log.vet_check_required ? <AlertTriangle className="size-5" /> : <Utensils className="size-5" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold">{log.animal.animal_tag_id}</h3>
                                                    {log.vet_check_required && (
                                                        <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
                                                            <AlertTriangle className="mr-1 size-3" />
                                                            Vet follow-up
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {log.animal.species} <span className="px-1">·</span> {log.animal.enclosure.zone_name}
                                                </p>

                                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    <div className="rounded-xl bg-muted/50 p-3">
                                                        <p className="text-xs text-muted-foreground">Meal</p>
                                                        <p className="mt-1 truncate text-sm font-medium">{log.feed_type.name}</p>
                                                    </div>
                                                    <div className="rounded-xl bg-muted/50 p-3">
                                                        <p className="text-xs text-muted-foreground">Quantity</p>
                                                        <p className="mt-1 text-sm font-medium">{Number(log.feed_quantity_kg).toLocaleString()} kg</p>
                                                    </div>
                                                    <div className="col-span-2 rounded-xl bg-muted/50 p-3 sm:col-span-1">
                                                        <p className="text-xs text-muted-foreground">Health</p>
                                                        <p className="mt-1 truncate text-sm font-medium">{log.health_condition || 'Not recorded'}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CalendarDays className="size-3.5" />
                                                        {formatDate(log.feeding_date)}
                                                        <span className="px-0.5">·</span>
                                                        <Clock3 className="size-3.5" />
                                                        {formatTime(log.feeding_time)}
                                                    </span>
                                                    <span>Keeper: <span className="font-medium text-foreground">{log.zookeeper.name}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </section>

                        <section className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-medium text-foreground">{logs.from ?? 0}</span> to{' '}
                                <span className="font-medium text-foreground">{logs.to ?? 0}</span> of{' '}
                                <span className="font-medium text-foreground">{logs.total}</span>
                            </p>
                            <nav aria-label="Feeding record pages" className="flex items-center justify-between gap-2 sm:justify-end">
                                {previousUrl ? (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={previousUrl} preserveScroll>
                                            <ArrowLeft />
                                            Previous
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" disabled><ArrowLeft />Previous</Button>
                                )}
                                <div className="flex items-center gap-1">
                                    {pageLinks.map((link) => (
                                        <Button
                                            key={link.label}
                                            asChild
                                            variant={link.active ? 'default' : 'ghost'}
                                            size="sm"
                                            className="min-w-9 px-2"
                                        >
                                            <Link href={link.url} preserveScroll aria-current={link.active ? 'page' : undefined}>
                                                {link.label}
                                            </Link>
                                        </Button>
                                    ))}
                                </div>
                                {nextUrl ? (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={nextUrl} preserveScroll>
                                            Next
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" disabled>Next<ArrowRight /></Button>
                                )}
                            </nav>
                        </section>
                    </>
                ) : (
                    <Card className="border-dashed shadow-none">
                        <CardContent className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
                            <div className="mb-4 rounded-2xl bg-sky-100 p-4 text-sky-900 dark:bg-sky-900/50 dark:text-sky-200">
                                {filters.review === 'needs-review' ? <AlertTriangle className="size-7" /> : <ClipboardList className="size-7" />}
                            </div>
                            <h3 className="text-lg font-semibold">
                                {filters.search ? 'No matching feeding records' : filters.review === 'needs-review' ? 'No vet follow-ups' : 'No feeding records yet'}
                            </h3>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                {filters.search
                                    ? `We couldn't find a feeding record matching “${filters.search}”. Try a different search.`
                                    : filters.review === 'needs-review'
                                      ? 'There are no feeding records marked for veterinary review.'
                                      : 'Record the first meal to start tracking daily care activity.'}
                            </p>
                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                {(filters.search || filters.review !== 'all') && (
                                    <Button variant="outline" onClick={() => { setSearch(''); updateFilters('', 'all'); }}>
                                        <X />
                                        Clear filters
                                    </Button>
                                )}
                                <Button asChild>
                                    <Link href={route('feeding-logs.create')}>
                                        <Plus />
                                        Log a feeding
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
        </AppLayout>
    );
}
