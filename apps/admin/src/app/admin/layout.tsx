import { AdminShell } from "@/components/admin-shell";
import { ToastProvider } from "@/components/toast";
import { AuthProvider } from "@/lib/auth-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminShell>{children}</AdminShell>
      </AuthProvider>
    </ToastProvider>
  );
}
