import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
      <p className="editorial text-4xl">EJC</p>
      <h1 className="mt-4 text-[0.7rem] uppercase tracking-[0.18em] text-muted">Admin sign in</h1>
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
