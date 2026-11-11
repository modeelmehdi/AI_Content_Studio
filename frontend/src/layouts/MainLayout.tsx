import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-slate-950">

      {/* Navbar */}
      <Navbar />

      {/* Main Website */}
      <main className="w-full">
        {children}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}