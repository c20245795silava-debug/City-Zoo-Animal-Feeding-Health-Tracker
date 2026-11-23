import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, PawPrint, ShieldCheck, Sparkles } from 'lucide-react';

interface EnclosureOption {
    id: number;
    zone_name: string;
}

interface AnimalCreateProps {
    enclosures: EnclosureOption[];
    species: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Animals', href: '/animals/create' },
    { title: 'Register animal', href: '/animals/create' },
];

export default function CreateAnimal({ enclosures, species }: AnimalCreateProps) {
    const { flash } = usePage<SharedData>().props;
    const form = useForm({
        animal_tag_id: '',
        species: '',
        enclosure_id: '',
    });

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        form.post(route('animals.store'), {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register animal" />

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
                            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                <PawPrint className="size-4" />
                                ANIMAL CARE
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Register an animal</h1>
                            <p className="text-muted-foreground mt-2 max-w-xl">
                                Add an animal to the zoo directory and assign it to its current enclosure.
                            </p>
                        </div>
                    </div>
                    <div className="bg-background text-muted-foreground hidden items-center gap-2 rounded-full border px-4 py-2 text-sm sm:flex">
                        <ShieldCheck className="size-4 text-emerald-600" />
                        Records are saved securely
                    </div>
                </div>

                {flash.success && (
                    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                        <CheckCircle2 className="size-4" />
                        <AlertTitle>Animal registered</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/20 border-b px-6 py-5">
                            <CardTitle className="text-xl">Animal details</CardTitle>
                            <CardDescription>Enter the animal’s identification and habitat information.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="animal_tag_id">Animal tag ID</Label>
                                        <Input
                                            id="animal_tag_id"
                                            name="animal_tag_id"
                                            placeholder="e.g. LION-001"
                                            value={form.data.animal_tag_id}
                                            onChange={(event) => form.setData('animal_tag_id', event.target.value.toUpperCase())}
                                            aria-invalid={Boolean(form.errors.animal_tag_id)}
                                            aria-describedby={form.errors.animal_tag_id ? 'animal_tag_id-error' : 'animal_tag_id-hint'}
                                            autoComplete="off"
                                            required
                                        />
                                        {form.errors.animal_tag_id ? (
                                            <p id="animal_tag_id-error" className="text-destructive text-sm">
                                                {form.errors.animal_tag_id}
                                            </p>
                                        ) : (
                                            <p id="animal_tag_id-hint" className="text-muted-foreground text-xs">
                                                Tags are stored in uppercase.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="species">Species</Label>
                                        <Input
                                            id="species"
                                            name="species"
                                            list="species-options"
                                            placeholder="e.g. African lion"
                                            value={form.data.species}
                                            onChange={(event) => form.setData('species', event.target.value)}
                                            aria-invalid={Boolean(form.errors.species)}
                                            aria-describedby={form.errors.species ? 'species-error' : undefined}
                                            autoComplete="off"
                                            required
                                        />
                                        <datalist id="species-options">
                                            {species.map((name) => (
                                                <option key={name} value={name} />
                                            ))}
                                        </datalist>
                                        {form.errors.species && (
                                            <p id="species-error" className="text-destructive text-sm">
                                                {form.errors.species}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="enclosure_id">Enclosure</Label>
                                    <Select
                                        value={form.data.enclosure_id}
                                        onValueChange={(value) => form.setData('enclosure_id', value)}
                                        disabled={enclosures.length === 0 || form.processing}
                                    >
                                        <SelectTrigger
                                            id="enclosure_id"
                                            aria-invalid={Boolean(form.errors.enclosure_id)}
                                            aria-describedby={form.errors.enclosure_id ? 'enclosure_id-error' : undefined}
                                        >
                                            <SelectValue placeholder="Choose an enclosure" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {enclosures.map((enclosure) => (
                                                <SelectItem key={enclosure.id} value={String(enclosure.id)}>
                                                    {enclosure.zone_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {form.errors.enclosure_id && (
                                        <p id="enclosure_id-error" className="text-destructive text-sm">
                                            {form.errors.enclosure_id}
                                        </p>
                                    )}
                                    {enclosures.length === 0 && (
                                        <p className="text-sm text-amber-700 dark:text-amber-400">
                                            No enclosures are available yet. Add an enclosure before registering an animal.
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                                    <Button type="button" variant="outline" asChild disabled={form.processing}>
                                        <Link href="/dashboard">Cancel</Link>
                                    </Button>
                                    <Button type="submit" disabled={form.processing || enclosures.length === 0}>
                                        <PawPrint />
                                        {form.processing ? 'Saving animal…' : 'Save animal'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <aside className="space-y-4">
                        <Card className="overflow-hidden border-emerald-900 bg-emerald-950 text-emerald-50 shadow-sm">
                            <CardContent className="relative space-y-5 p-6">
                                <div className="absolute -top-8 -right-7 size-36 rounded-full bg-emerald-700/40 blur-2xl" />
                                <div className="relative flex size-11 items-center justify-center rounded-xl bg-white/10">
                                    <Sparkles className="size-5 text-emerald-200" />
                                </div>
                                <div className="relative space-y-2">
                                    <h2 className="font-semibold">A better care record starts here</h2>
                                    <p className="text-sm leading-6 text-emerald-100/80">
                                        Use a unique tag and the animal’s current enclosure so keepers can find the right record quickly.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Before you save</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground space-y-3 text-sm">
                                <p className="flex gap-2">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    Confirm the animal tag matches its identification.
                                </p>
                                <p className="flex gap-2">
                                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                                    Select the enclosure where the animal currently lives.
                                </p>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>
        </AppLayout>
    );
}
