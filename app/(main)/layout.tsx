import Header from "@/global/components/Header";
import Sidebar from "@/global/components/Sidebar";
import Footer from "@/global/components/Footer";
import { SidebarProvider } from "@/global/context/SidebarContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="layout-wrapper">
        <Sidebar />
        <div className="content-wrapper">
          <Header />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}