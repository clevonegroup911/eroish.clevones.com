import { updateIdentityTagline } from "@/app/admin/actions";
import { prisma } from "@/lib/db";

export default async function AdminIdentityPage() {
  const profiles = await prisma.identityProfile.findMany();
  return (
    <>
      <h1 className="editorial text-4xl">Identity</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Optional tagline is empty by default. It is not a confirmed EJC statement. If set, the
        public site shows it with a needs-confirmation mark.
      </p>
      <ul className="mt-8 space-y-4">
        {profiles.map((profile) => (
          <li key={profile.id} className="border border-rule p-4">
            <p className="text-sm text-muted">{profile.locale} · {profile.verification}</p>
            <h2 className="mt-2 text-2xl">{profile.fullName}</h2>
            <p>{profile.publicName} · {profile.signature}</p>
            <p className="mt-2">{profile.summary}</p>
            <form action={updateIdentityTagline} className="mt-4 grid gap-2">
              <input type="hidden" name="id" value={profile.id} />
              <label className="grid gap-1 text-sm">
                Optional tagline (needs confirmation)
                <input
                  name="commandLine"
                  defaultValue={profile.commandLine}
                  className="border border-rule bg-paper p-2"
                  placeholder="Empty — not shown publicly"
                />
              </label>
              <button type="submit" className="w-fit border border-ink px-3 py-1 text-xs uppercase">
                Save tagline
              </button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
