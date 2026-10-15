import { Outlet } from 'react-router-dom';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

/**
 * Shell for the public marketing site.
 * Provides the sticky site header and site footer around page content.
 */
export function LandingLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-background)]">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
