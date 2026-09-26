import Link from "next/link";

export default function NotFound() {
  return (
    <main className="px-5 py-24 md:px-8">
      <p className="editorial text-5xl">EJC</p>
      <h1 className="mt-6 text-2xl">This page is not in the public record.</h1>
      <p className="mt-3 max-w-xl text-muted">
        Nothing is invented to fill the gap. Return to the official identity.
      </p>
      <p className="mt-6">
        <Link href="/en" className="underline">
          eroish.clevones.com
        </Link>
      </p>
    </main>
  );
}
