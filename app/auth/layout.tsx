import AuthHeader from "@/app/auth/components/AuthHeader";
import Footer from "@/global/components/Footer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="layout-wrapper auth-layout">
      <div className="content-wrapper">
        <AuthHeader />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}