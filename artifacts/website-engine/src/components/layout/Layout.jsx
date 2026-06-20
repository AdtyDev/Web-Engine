import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout({ config, children }) {
  return (
    <>
      <Navbar config={config} />
      <main className="pt-16">{children}</main>
      <Footer config={config} />
    </>
  );
}
