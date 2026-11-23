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

interface FeedType {
    id: number;
    name: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Feed types', href: '/settings/feed-types' }];

export default function FeedTypes({ feedTypes }: { feedTypes: FeedType[] }) {
    const { data, setData, post, reset, errors, processing, recentlySuccessful } = useForm({ name: '' });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('settings.feed-types.store'), { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Feed type settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Feed types" description="Add and view available feed types." />
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Feed type name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                required
                                maxLength={255}
                                placeholder="e.g. Hay"
                            />
                            <InputError message={errors.name} />
                        </div>
                        <Button disabled={processing}>Add feed type</Button>
                        {recentlySuccessful && <p className="text-sm text-green-700">Feed type added.</p>}
                    </form>

                    <section className="space-y-3">
                        <h4 className="text-sm font-medium">Registered feed types</h4>
                        {feedTypes.length ? (
                            <ul className="divide-y rounded-md border">
                                {feedTypes.map((feedType) => (
                                    <li key={feedType.id} className="px-3 py-2 text-sm">
                                        {feedType.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground text-sm">No feed types have been added.</p>
                        )}
                    </section>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
