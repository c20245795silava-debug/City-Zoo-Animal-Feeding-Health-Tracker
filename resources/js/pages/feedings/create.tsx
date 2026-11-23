import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardPlus, Clock3, Leaf, PawPrint, ShieldCheck } from 'lucide-react';

interface AnimalOption {
    id: number;
    animal_tag_id: string;
    species: string;
    enclosure_id: number;
    enclosure: { id: number; zone_name: string };
}

interface NamedOption {
    id: number;
    name: string;
}

interface FeedingCreateProps {
    animals: AnimalOption[];
    zookeepers: NamedOption[];
    feed_types: NamedOption[];
    dailyTotals: Record<number, number>;
    dailyFeedLimits: Record<string, number>;
    today: string;
    currentTime: string;
}

interface FeedingForm {
    [key: string]: string | boolean;
    animal_id: string;
    zookeeper_id: string;
    feed_type_id: string;
    feed_quantity_kg: string;
    feeding_date: string;
    feeding_time: string;
    health_condition: string;
    vet_check_required: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Feeding records', href: '/feeding-logs/create' },
    { title: 'Log feeding', href: '/feeding-logs/create' },
];

function getDailyLimit(species: string | undefined, limits: Record<string, number>): number | undefined {
    if (!species) return undefined;
    const entry = Object.entries(limits).find(([name, limit]) => name.trim().toLowerCase() === species.trim().toLowerCase() && Number(limit) > 0);

    return entry ? Number(entry[1]) : undefined;
}

export default function CreateFeeding({ animals, zookeepers, feed_types, dailyTotals, dailyFeedLimits, today, currentTime }: FeedingCreateProps) {
    const { flash } = usePage<SharedData>().props;
    const form = useForm<FeedingForm>({
        animal_id: '',
        zookeeper_id: '',
        feed_type_id: '',
        feed_quantity_kg: '',
        feeding_date: today,
        feeding_time: currentTime,
        health_condition: 'Good',
        vet_check_required: false,
    });

    const selectedAnimal = animals.find((animal) => String(animal.id) === form.data.animal_id);
    const dailyLimit = getDailyLimit(selectedAnimal?.species, dailyFeedLimits);
    const consumedToday = selectedAnimal ? Number(dailyTotals[selectedAnimal.id] ?? 0) : 0;
    const remainingToday = dailyLimit === undefined ? undefined : Math.max(dailyLimit - consumedToday, 0);
    const enteredQuantity = Number(form.data.feed_quantity_kg);
    const overDailyLimit =
        remainingToday !== undefined && Number.isFinite(enteredQuantity) && enteredQuantity > 0 && enteredQuantity > remainingToday;
    const hasDependencies = animals.length > 0 && zookeepers.length > 0 && feed_types.length > 0;

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post(route('feeding-logs.store'));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Log feeding" />
            <main className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-3">
                        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-3">
                            <Link href="/dashboard">
                                <ArrowLeft />
                                Back to dashboard
                            </Link>
                        </Button>
                        <div>
                            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-sky-400">
                                <Leaf className="size-4" />
                                DAILY CARE · FEEDING
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Record a feeding</h1>
                            <p className="text-muted-foreground mt-2 max-w-xl">
                                Log a meal, note the animal’s condition, and keep daily nutrition within its species standard.
                            </p>
                        </div>
                    </div>
                    <div className="bg-background text-muted-foreground hidden items-center gap-2 rounded-full border px-4 py-2 text-sm sm:flex">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        Dietary limits are checked on save
                    </div>
                </div>

                {flash.success && (
                    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                        <CheckCircle2 className="size-4" />
                        <AlertTitle>Feeding saved</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {!hasDependencies && (
                    <Alert className="border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                        <AlertTriangle className="size-4" />
                        <AlertTitle>Setup needed before logging</AlertTitle>
                        <AlertDescription>Add an animal, a zookeeper, and a feed type before recording feeding activity.</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/20 border-b px-6 py-5">
                            <CardTitle className="text-xl">Feeding details</CardTitle>
                            <CardDescription>Choose who was fed, what they received, and when.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={submit} className="space-y-7">
                                <section className="space-y-4">
                                    <h2 className="text-sm font-semibold">Animal and meal</h2>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="animal_id">Animal</Label>
                                            <Select
                                                value={form.data.animal_id}
                                                onValueChange={(value) => form.setData('animal_id', value)}
                                                disabled={!animals.length || form.processing}
                                            >
                                                <SelectTrigger id="animal_id" aria-invalid={Boolean(form.errors.animal_id)}>
                                                    <SelectValue placeholder="Choose an animal" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {animals.map((animal) => (
                                                        <SelectItem key={animal.id} value={String(animal.id)}>
                                                            {animal.animal_tag_id} · {animal.species} · {animal.enclosure.zone_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.animal_id && <p className="text-destructive text-sm">{form.errors.animal_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="feed_type_id">Feed type</Label>
                                            <Select
                                                value={form.data.feed_type_id}
                                                onValueChange={(value) => form.setData('feed_type_id', value)}
                                                disabled={!feed_types.length || form.processing}
                                            >
                                                <SelectTrigger id="feed_type_id" aria-invalid={Boolean(form.errors.feed_type_id)}>
                                                    <SelectValue placeholder="Choose a feed type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {feed_types.map((feed) => (
                                                        <SelectItem key={feed.id} value={String(feed.id)}>
                                                            {feed.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.feed_type_id && <p className="text-destructive text-sm">{form.errors.feed_type_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="feed_quantity_kg">Quantity (kg)</Label>
                                            <div className="relative">
                                                <Input
                                                    id="feed_quantity_kg"
                                                    type="number"
                                                    min="0.001"
                                                    step="0.001"
                                                    inputMode="decimal"
                                                    placeholder="0.000"
                                                    className="pr-12"
                                                    value={form.data.feed_quantity_kg}
                                                    onChange={(event) => form.setData('feed_quantity_kg', event.target.value)}
                                                    aria-invalid={Boolean(form.errors.feed_quantity_kg)}
                                                    required
                                                />
                                                <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">
                                                    kg
                                                </span>
                                            </div>
                                            {form.errors.feed_quantity_kg ? (
                                                <p className="text-destructive text-sm">{form.errors.feed_quantity_kg}</p>
                                            ) : (
                                                <p className="text-muted-foreground text-xs">Up to three decimal places.</p>
                                            )}
                                        </div>
                                    </div>

                                    {selectedAnimal &&
                                        (dailyLimit !== undefined ? (
                                            <div className="bg-muted/30 rounded-xl border p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium">Today’s dietary allowance</p>
                                                        <p className="text-muted-foreground mt-1 text-xs">
                                                            {consumedToday.toLocaleString(undefined, { maximumFractionDigits: 3 })} kg logged of{' '}
                                                            {dailyLimit} kg for {selectedAnimal.species}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200">
                                                        {remainingToday?.toLocaleString(undefined, { maximumFractionDigits: 3 })} kg left
                                                    </span>
                                                </div>
                                                <div
                                                    className="bg-muted mt-3 h-2 overflow-hidden rounded-full"
                                                    role="progressbar"
                                                    aria-label={`${selectedAnimal.species} daily feed allowance used`}
                                                    aria-valuenow={Math.min(consumedToday, dailyLimit)}
                                                    aria-valuemin={0}
                                                    aria-valuemax={dailyLimit}
                                                >
                                                    <div
                                                        className={`h-full rounded-full transition-all ${overDailyLimit ? 'bg-rose-500' : 'bg-emerald-600'}`}
                                                        style={{ width: `${Math.min((consumedToday / dailyLimit) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                {overDailyLimit && (
                                                    <p className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300">
                                                        This quantity exceeds today’s remaining allowance. The record cannot be saved.
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <Alert className="border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                                                <AlertTriangle className="size-4" />
                                                <AlertTitle>Dietary limit not configured</AlertTitle>
                                                <AlertDescription>
                                                    There is no daily feed standard for {selectedAnimal.species}. Ask an administrator to configure
                                                    its approved limit before saving.
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                </section>

                                <section className="space-y-4 border-t pt-6">
                                    <h2 className="text-sm font-semibold">Keeper and schedule</h2>
                                    <div className="grid gap-5 sm:grid-cols-3">
                                        <div className="space-y-2 sm:col-span-3">
                                            <Label htmlFor="zookeeper_id">Zookeeper</Label>
                                            <Select
                                                value={form.data.zookeeper_id}
                                                onValueChange={(value) => form.setData('zookeeper_id', value)}
                                                disabled={!zookeepers.length || form.processing}
                                            >
                                                <SelectTrigger id="zookeeper_id" aria-invalid={Boolean(form.errors.zookeeper_id)}>
                                                    <SelectValue placeholder="Choose a keeper" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {zookeepers.map((keeper) => (
                                                        <SelectItem key={keeper.id} value={String(keeper.id)}>
                                                            {keeper.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {form.errors.zookeeper_id && <p className="text-destructive text-sm">{form.errors.zookeeper_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="feeding_date">Date</Label>
                                            <Input
                                                id="feeding_date"
                                                type="date"
                                                value={form.data.feeding_date}
                                                onChange={(event) => form.setData('feeding_date', event.target.value)}
                                                aria-invalid={Boolean(form.errors.feeding_date)}
                                                required
                                            />
                                            {form.errors.feeding_date && <p className="text-destructive text-sm">{form.errors.feeding_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="feeding_time">Time</Label>
                                            <div className="relative">
                                                <Input
                                                    id="feeding_time"
                                                    type="time"
                                                    className="pr-10"
                                                    value={form.data.feeding_time}
                                                    onChange={(event) => form.setData('feeding_time', event.target.value)}
                                                    aria-invalid={Boolean(form.errors.feeding_time)}
                                                    required
                                                />
                                                <Clock3 className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
                                            </div>
                                            {form.errors.feeding_time && <p className="text-destructive text-sm">{form.errors.feeding_time}</p>}
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-4 border-t pt-6">
                                    <div>
                                        <h2 className="text-sm font-semibold">Health observation</h2>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            A “Poor” condition automatically requires a veterinary check.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="health_condition">Condition</Label>
                                        <Select
                                            value={form.data.health_condition}
                                            onValueChange={(value) => {
                                                form.setData((current) => ({
                                                    ...current,
                                                    health_condition: value,
                                                    vet_check_required: value.toLowerCase() === 'poor' ? true : current.vet_check_required,
                                                }));
                                            }}
                                            disabled={form.processing}
                                        >
                                            <SelectTrigger id="health_condition" aria-invalid={Boolean(form.errors.health_condition)}>
                                                <SelectValue placeholder="Select observed condition" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Good">Good</SelectItem>
                                                <SelectItem value="Fair">Fair</SelectItem>
                                                <SelectItem value="Poor">Poor</SelectItem>
                                                <SelectItem value="Under observation">Under observation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.errors.health_condition && <p className="text-destructive text-sm">{form.errors.health_condition}</p>}
                                    </div>
                                    <div className="flex items-start gap-3 rounded-xl border p-4">
                                        <Checkbox
                                            id="vet_check_required"
                                            checked={form.data.vet_check_required}
                                            onCheckedChange={(checked) => form.setData('vet_check_required', checked === true)}
                                            disabled={form.data.health_condition.toLowerCase() === 'poor' || form.processing}
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor="vet_check_required" className="cursor-pointer">
                                                Flag for veterinary follow-up
                                            </Label>
                                            <p className="text-muted-foreground text-xs">
                                                Select this if the animal needs a vet check, regardless of its condition selection.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                                    <Button type="button" variant="outline" asChild disabled={form.processing}>
                                        <Link href="/dashboard">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={form.processing || !hasDependencies}>
                                        <ClipboardPlus />
                                        {form.processing ? 'Saving feeding…' : 'Save feeding record'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <aside className="space-y-4">
                        <Card className="overflow-hidden border-sky-950 bg-gradient-to-br from-sky-950 to-teal-900 text-sky-50 shadow-sm">
                            <CardContent className="relative space-y-5 p-6">
                                <div className="absolute -top-8 -right-7 size-36 rounded-full bg-teal-400/20 blur-2xl" />
                                <div className="relative flex size-11 items-center justify-center rounded-xl bg-white/10">
                                    <PawPrint className="size-5 text-teal-200" />
                                </div>
                                <div className="relative space-y-2">
                                    <h2 className="font-semibold">Every meal matters</h2>
                                    <p className="text-sm leading-6 text-sky-100/80">
                                        Accurate meal records help keepers monitor nutrition and make it easier for the care team to spot changes.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Care checklist</CardTitle>
                                <CardDescription>Before submitting a feeding record</CardDescription>
                            </CardHeader>
                            <CardContent className="text-muted-foreground space-y-3 text-sm">
                                <p className="flex gap-2">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    Confirm the animal and the feed type.
                                </p>
                                <p className="flex gap-2">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    Enter the measured quantity in kilograms.
                                </p>
                                <p className="flex gap-2">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    Flag any health concerns for the care team.
                                </p>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>
        </AppLayout>
    );
}
