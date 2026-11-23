import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Animal {
    id: number;
    animal_tag_id: string;
    species: string;
    enclosure_id: number;
}

interface Enclosure {
    id: number;
    zone_name: string;
}

interface EditAnimalProps {
    animal: Animal;
    enclosures: Enclosure[];
    species: string[];
}

export default function EditAnimal({ animal, enclosures, species }: EditAnimalProps) {
    const form = useForm({
        animal_tag_id: animal.animal_tag_id,
        species: animal.species,
        enclosure_id: String(animal.enclosure_id),
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.put(route('animals.update', animal.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Animal directory', href: '/animals' },
        { title: `Edit ${animal.animal_tag_id}`, href: `/animals/${animal.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${animal.animal_tag_id}`} />
            <main className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-3">
                    <Link href={route('animals.index')}>
                        <ArrowLeft />
                        Back to animal directory
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit animal</CardTitle>
                        <CardDescription>Correct the animal’s tag, species spelling, or current enclosure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="animal_tag_id">Animal tag ID</Label>
                                <Input
                                    id="animal_tag_id"
                                    value={form.data.animal_tag_id}
                                    onChange={(event) => form.setData('animal_tag_id', event.target.value.toUpperCase())}
                                    aria-invalid={Boolean(form.errors.animal_tag_id)}
                                    required
                                />
                                {form.errors.animal_tag_id && <p className="text-destructive text-sm">{form.errors.animal_tag_id}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="species">Species</Label>
                                <Input
                                    id="species"
                                    list="species-options"
                                    value={form.data.species}
                                    onChange={(event) => form.setData('species', event.target.value)}
                                    aria-invalid={Boolean(form.errors.species)}
                                    required
                                />
                                <datalist id="species-options">
                                    {species.map((name) => (
                                        <option key={name} value={name} />
                                    ))}
                                </datalist>
                                {form.errors.species && <p className="text-destructive text-sm">{form.errors.species}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="enclosure_id">Enclosure</Label>
                                <Select
                                    value={form.data.enclosure_id}
                                    onValueChange={(value) => form.setData('enclosure_id', value)}
                                    disabled={enclosures.length === 0 || form.processing}
                                >
                                    <SelectTrigger id="enclosure_id" aria-invalid={Boolean(form.errors.enclosure_id)}>
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
                                {form.errors.enclosure_id && <p className="text-destructive text-sm">{form.errors.enclosure_id}</p>}
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-5">
                                <Button type="button" variant="outline" asChild disabled={form.processing}>
                                    <Link href={route('animals.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={form.processing || enclosures.length === 0}>
                                    <Save />
                                    {form.processing ? 'Saving…' : 'Save changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </AppLayout>
    );
}
