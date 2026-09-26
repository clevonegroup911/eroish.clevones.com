import { prisma } from "@/lib/db";

export default async function AdminIdentityPage() {
  const profiles = await prisma.identityProfile.findMany();
  return (
    <>
      <h1 className="editorial text-4xl">Identity</h1>
      <ul className="mt-8 space-y-4">
        {profiles.map((profile) => (
          <li key={profile.id} className="border border-rule p-4">
            <p className="text-sm text-muted">{profile.locale} · {profile.verification}</p>
            <h2 className="mt-2 text-2xl">{profile.fullName}</h2>
            <p>{profile.publicName} · {profile.signature}</p>
            <p className="mt-2">{profile.summary}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
