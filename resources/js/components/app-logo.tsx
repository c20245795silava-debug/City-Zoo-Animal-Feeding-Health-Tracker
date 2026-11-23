import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate leading-none font-semibold">City Zoo</span>
                <span className="text-muted-foreground mt-1 truncate text-xs">Feeding &amp; health tracker</span>
            </div>
        </>
    );
}
