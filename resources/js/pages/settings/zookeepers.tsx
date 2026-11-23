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

interface Zookeeper {
    id: number;
    name: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Zookeepers', href: '/settings/zookeepers' }];

export default function Zookeepers({ zookeepers }: { zookeepers: Zookeeper[] }) {
    const { data, setData, post, reset, errors, processing, recentlySuccessful } = useForm({ name: '' });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('settings.zookeepers.store'), { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Zookeeper settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Zookeepers" description="Add and view zoo keepers." />
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Zookeeper name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                required
                                maxLength={255}
                                placeholder="e.g. Alex Morgan"
                            />
                            <InputError message={errors.name} />
                        </div>
                        <Button disabled={processing}>Add zookeeper</Button>
                        {recentlySuccessful && <p className="text-sm text-green-700">Zookeeper added.</p>}
                    </form>

                    <section className="space-y-3">
                        <h4 className="text-sm font-medium">Registered zookeepers</h4>
                        {zookeepers.length ? (
                            <ul className="divide-y rounded-md border">
                                {zookeepers.map((zookeeper) => (
                                    <li key={zookeeper.id} className="px-3 py-2 text-sm">
                                        {zookeeper.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm">No zookeepers have been added.</p>
                        )}
                    </section>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
