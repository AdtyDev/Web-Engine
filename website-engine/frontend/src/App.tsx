import { HelmetProvider, Helmet } from "react-helmet-async";
import { ConfigProvider } from "./context/ConfigContext";
import { useConfig } from "./hooks/useConfig";
import { useTheme } from "./hooks/useTheme";
import { Layout } from "./components/layout/Layout";
import { Hero } from "./components/sections/Hero";
import { About } from "./components/sections/About";
import { Offerings } from "./components/sections/Offerings";
import { Gallery } from "./components/sections/Gallery";
import { Team } from "./components/sections/Team";
import { Testimonials } from "./components/sections/Testimonials";
import { Pricing } from "./components/sections/Pricing";
import { FAQ } from "./components/sections/FAQ";
import { ContactForm } from "./components/sections/ContactForm";
import { DevSwitcher } from "./components/dev/DevSwitcher";

function SiteContent() {
  const { config, loading, error } = useConfig();
  useTheme(config?.theme);

  const envMode = import.meta.env.VITE_APP_ENV ?? (import.meta.env.PROD ? "prod" : "dev");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div
            className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
          />
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-sm px-4">
          <p className="text-red-600 font-semibold mb-2">Could not load site configuration</p>
          <p className="text-gray-500 text-sm">
            Make sure the backend is running and CLIENT_ID is set correctly.
          </p>
          <pre className="mt-3 text-xs text-gray-400 bg-gray-100 rounded p-2 text-left overflow-auto">
            {String(error)}
          </pre>
        </div>
      </div>
    );
  }

  const s = config?.sections ?? {};

  return (
    <>
      <Helmet>
        <title>{config?.seo?.title || config?.meta?.business_name}</title>
        <meta name="description" content={config?.seo?.description} />
        {config?.seo?.keywords?.length > 0 && (
          <meta name="keywords" content={config.seo.keywords.join(", ")} />
        )}
        {config?.seo?.og_image && <meta property="og:image" content={config.seo.og_image} />}
        {config?.meta?.favicon_url && <link rel="icon" href={config.meta.favicon_url} />}
        <meta property="og:title" content={config?.seo?.title || config?.meta?.business_name} />
        <meta property="og:description" content={config?.seo?.description} />
      </Helmet>

      <Layout config={config}>
        <Hero section={s.hero} />
        <About section={s.about} />
        <Offerings section={s.offerings} />
        <Gallery section={s.gallery} />
        <Team section={s.team} />
        <Testimonials section={s.testimonials} />
        <Pricing section={s.pricing} />
        <FAQ section={s.faq} />
        <ContactForm section={s.contact} contactConfig={config?.contact} />
      </Layout>

      {/* Dev-only client switcher — hidden when VITE_APP_ENV=prod and compiled away in production builds */}
      {import.meta.env.DEV && envMode !== "prod" && <DevSwitcher />}
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ConfigProvider>
        <SiteContent />
      </ConfigProvider>
    </HelmetProvider>
  );
}
