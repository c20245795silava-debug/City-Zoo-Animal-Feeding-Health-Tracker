import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Enclosure {
    id: number;
    zone_name: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Enclosures', href: '/settings/enclosures' }];

export default function Enclosures({ enclosures }: { enclosures: Enclosure[] }) {
    const { data, setData, post, reset, errors, processing, recentlySuccessful } = useForm({ zone_name: '' });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('settings.enclosures.store'), { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Enclosure settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Enclosures" description="Add and view zoo enclosures." />
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="zone_name">Enclosure name</Label>
                            <Input
                                id="zone_name"
                                value={data.zone_name}
                                onChange={(event) => setData('zone_name', event.target.value)}
                                required
                                maxLength={255}
                                placeholder="e.g. Savannah"
                            />
                            <InputError message={errors.zone_name} />
                        </div>
                        <Button disabled={processing}>Add enclosure</Button>
                        {recentlySuccessful && <p className="text-sm text-green-700">Enclosure added.</p>}
                    </form>

                    <section className="space-y-3">
                        <h4 className="text-sm font-medium">Registered enclosures</h4>
                        {enclosures.length ? (
                            <ul className="divide-y rounded-md border">
                                {enclosures.map((enclosure) => (
                                    <li key={enclosure.id} className="px-3 py-2 text-sm">
                                        {enclosure.zone_name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm">No enclosures have been added.</p>
                        )}
                    </section>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
