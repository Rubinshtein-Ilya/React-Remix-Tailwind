import { Outlet } from "react-router";
import "~/styles/theme.css";
import { Header } from "~/components/Header";
import type { Route } from "../+types/root";
import Footer from "~/components/Footer";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Fan's Dream" },
    { description: "Живи мечтой - аутентичные футболки и сувениры" },
  ];
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
