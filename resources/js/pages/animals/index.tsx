import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, MapPin, PawPrint, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';

interface Animal {
    id: number;
    animal_tag_id: string;
    species: string;
    enclosure: { id: number; zone_name: string };
    feeding_logs_count: number;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AnimalPage {
    data: Animal[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface AnimalIndexProps {
    animals: AnimalPage;
    filters: { search: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Animal directory', href: '/animals' }];

function initials(species: string): string {
    return species
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');
}

export default function AnimalIndex({ animals, filters }: AnimalIndexProps) {
    const { flash } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search);

    function searchAnimals(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        router.get(
            route('animals.index'),
            search.trim() ? { search: search.trim() } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function clearSearch() {
        setSearch('');
        router.get(route('animals.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
    }

    const pageLinks = animals.links.filter(
        (link): link is PaginationLink & { url: string } => link.url !== null && /^\d+$/.test(link.label),
    );
    const previousUrl = animals.links[0]?.url;
    const nextUrl = animals.links[animals.links.length - 1]?.url;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Animal directory" />
            <main className="mx-auto w-full max-w-7xl space-y-7 p-4 md:space-y-8 md:p-8">
                <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-6 py-8 text-white shadow-lg shadow-emerald-950/10 sm:px-9 sm:py-9">
                    <div className="pointer-events-none absolute -right-10 -top-20 -z-10 size-72 rounded-full border border-white/10" />
                    <div className="pointer-events-none absolute -bottom-24 right-1/4 -z-10 size-56 rounded-full bg-lime-300/10 blur-3xl" />
                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <Badge className="mb-4 border border-white/15 bg-white/10 text-emerald-50 hover:bg-white/10">
                                <PawPrint className="mr-1.5 size-3.5" />
                                ANIMAL CARE · DIRECTORY
                            </Badge>
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Meet the residents.</h1>
                            <p className="mt-2 text-sm leading-6 text-emerald-50/75 sm:text-base">
                                Browse animal profiles, find their habitats, and keep their care records close at hand.
                            </p>
                        </div>
                        <Button asChild className="shrink-0 bg-white text-emerald-950 hover:bg-emerald-50">
                            <Link href={route('animals.create')}>
                                <Plus />
                                Register animal
                            </Link>
                        </Button>
                    </div>
                </section>

                {flash.success && (
                    <div
                        role="status"
                        className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                    >
                        <PawPrint className="size-4 shrink-0" />
                        {flash.success}
                    </div>
                )}

                <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Animal directory</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {animals.total} {animals.total === 1 ? 'animal' : 'animals'} registered
                        </p>
                    </div>
                    <form onSubmit={searchAnimals} className="flex w-full gap-2 sm:max-w-md">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                aria-label="Search animals"
                                placeholder="Search tag, species, or enclosure"
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
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>
                </section>

                {animals.data.length > 0 ? (
                    <>
                        <section aria-label="Animals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {animals.data.map((animal, index) => (
                                <Card
                                    key={animal.id}
                                    className="group overflow-hidden border-border/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div
                                        className={`h-1.5 ${
                                            index % 3 === 0
                                                ? 'bg-gradient-to-r from-emerald-600 to-teal-400'
                                                : index % 3 === 1
                                                  ? 'bg-gradient-to-r from-sky-600 to-cyan-400'
                                                  : 'bg-gradient-to-r from-lime-600 to-emerald-400'
                                        }`}
                                    />
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 font-semibold text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100">
                                                    {initials(animal.species)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="truncate font-semibold">{animal.species}</h3>
                                                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{animal.animal_tag_id}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="shrink-0">
                                                Resident
                                            </Badge>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-3">
                                            <div className="rounded-xl bg-muted/50 p-3">
                                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <MapPin className="size-3.5" />
                                                    Enclosure
                                                </p>
                                                <p className="mt-1.5 truncate text-sm font-medium">{animal.enclosure.zone_name}</p>
                                            </div>
                                            <div className="rounded-xl bg-muted/50 p-3">
                                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <PawPrint className="size-3.5" />
                                                    Feeding logs
                                                </p>
                                                <p className="mt-1.5 text-sm font-medium">
                                                    {animal.feeding_logs_count} {animal.feeding_logs_count === 1 ? 'record' : 'records'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                                            <span>Added {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(animal.created_at))}</span>
                                            <Link
                                                href={route('feeding-logs.create')}
                                                className="inline-flex items-center gap-1 font-medium text-emerald-800 transition-colors hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-emerald-100"
                                            >
                                                Log a feeding
                                                <ArrowRight className="size-3.5" />
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </section>

                        <section className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing <span className="font-medium text-foreground">{animals.from ?? 0}</span> to{' '}
                                <span className="font-medium text-foreground">{animals.to ?? 0}</span> of{' '}
                                <span className="font-medium text-foreground">{animals.total}</span>
                            </p>
                            <nav aria-label="Animal directory pages" className="flex items-center justify-between gap-2 sm:justify-end">
                                {previousUrl ? (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={previousUrl} preserveScroll>
                                            <ArrowLeft />
                                            Previous
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" disabled>
                                        <ArrowLeft />
                                        Previous
                                    </Button>
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
                                    <Button variant="outline" size="sm" disabled>
                                        Next
                                        <ArrowRight />
                                    </Button>
                                )}
                            </nav>
                        </section>
                    </>
                ) : (
                    <Card className="border-dashed shadow-none">
                        <CardContent className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
                            <div className="mb-4 rounded-2xl bg-emerald-100 p-4 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                                {filters.search ? <Search className="size-7" /> : <PawPrint className="size-7" />}
                            </div>
                            <h3 className="text-lg font-semibold">{filters.search ? 'No matching animals' : 'Your directory is ready'}</h3>
                            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                {filters.search
                                    ? `We couldn't find an animal matching “${filters.search}”. Try a different tag, species, or enclosure.`
                                    : 'Register your first animal to start building the zoo care directory.'}
                            </p>
                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                {filters.search && (
                                    <Button variant="outline" onClick={clearSearch}>
                                        <X />
                                        Clear search
                                    </Button>
                                )}
                                <Button asChild>
                                    <Link href={route('animals.create')}>
                                        <Plus />
                                        Register animal
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
