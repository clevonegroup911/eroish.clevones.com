/**
 * Seed uses only confirmed biographical facts as VERIFIED + PUBLISHED.
 * Everything else is a structured placeholder labelled EXAMPLE or
 * NEEDS_CONFIRMATION and is never published as fact.
 */
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

import { CONFIRMED } from "../lib/identity";

const prisma = new PrismaClient();

const MANDATE_SOURCE = {
  label: "EJC master mandate — confirmed public facts",
  url: "/docs/CONTENT-NEEDED.md",
  note: "Facts confirmed by the site owner for this platform. Not a third-party citation.",
};

async function main() {
  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@localhost").trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "change-this-admin-password";

  const passwordHash = await argon2.hash(password);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  await prisma.identityProfile.deleteMany();
  await prisma.identityProfile.createMany({
    data: [
      {
        locale: "EN",
        fullName: CONFIRMED.fullName,
        publicName: CONFIRMED.publicName,
        signature: CONFIRMED.signature,
        nationality: CONFIRMED.nationality,
        title: CONFIRMED.title,
        associatedOrg: CONFIRMED.organization,
        birthDate: CONFIRMED.birthDate,
        birthPlace: `${CONFIRMED.birthPlaceCity}, ${CONFIRMED.birthPlaceCountryEn}`,
        rolesLine: CONFIRMED.githubDescription,
        commandLine: CONFIRMED.commandLine,
        summary:
          "Congolese entrepreneur, businessman and builder. Founder/CEO. Associated with CLEVONE SARL. The public record states only what can be verified.",
        multiculturalNote:
          "Grew up and lived across different countries, cities and provinces. Specific places beyond Kinshasa need confirmation.",
        portraitCaption: "Portrait to be supplied — honest placeholder.",
        publishState: "PUBLISHED",
        verification: "VERIFIED",
        exampleFlag: "LIVE",
      },
      {
        locale: "FR",
        fullName: CONFIRMED.fullName,
        publicName: CONFIRMED.publicName,
        signature: CONFIRMED.signature,
        nationality: "Congolais",
        title: CONFIRMED.title,
        associatedOrg: CONFIRMED.organization,
        birthDate: CONFIRMED.birthDate,
        birthPlace: `${CONFIRMED.birthPlaceCity}, ${CONFIRMED.birthPlaceCountryFr}`,
        rolesLine: "Entrepreneur, businessman, builder",
        commandLine: CONFIRMED.commandLine,
        summary:
          "Entrepreneur congolais, businessman et builder. Fondateur et CEO. Associé à CLEVONE SARL. Le registre public n’énonce que ce qui peut être vérifié.",
        multiculturalNote:
          "A grandi et vécu dans différents pays, villes et provinces. Les lieux précis hors Kinshasa restent à confirmer.",
        portraitCaption: "Portrait à fournir — placeholder honnête.",
        publishState: "PUBLISHED",
        verification: "VERIFIED",
        exampleFlag: "LIVE",
      },
    ],
  });

  await prisma.sourceLink.deleteMany();
  await prisma.place.deleteMany();

  const kinshasa = await prisma.place.create({
    data: {
      slug: "kinshasa",
      nameEn: "Kinshasa",
      nameFr: "Kinshasa",
      countryEn: CONFIRMED.birthPlaceCountryEn,
      countryFr: CONFIRMED.birthPlaceCountryFr,
      kind: "birthplace",
      lat: -4.3276,
      lng: 15.3136,
      confirmation: "CONFIRMED",
      noteEn: "Born in Kinshasa on 1 September 1994.",
      noteFr: "Né à Kinshasa le 1er septembre 1994.",
      sortOrder: 0,
      publishState: "PUBLISHED",
      verification: "VERIFIED",
      exampleFlag: "LIVE",
      sources: { create: [MANDATE_SOURCE] },
    },
  });

  await prisma.place.create({
    data: {
      slug: "place-needs-confirmation-1",
      nameEn: "Place — needs confirmation",
      nameFr: "Lieu — à confirmer",
      countryEn: null,
      countryFr: null,
      kind: "lived",
      lat: null,
      lng: null,
      confirmation: "NEEDS_CONFIRMATION",
      noteEn:
        "Grew up and lived across different countries, cities and provinces. This entry is a structured slot until a specific place is confirmed.",
      noteFr:
        "A grandi et vécu dans différents pays, villes et provinces. Emplacement structuré jusqu’à confirmation d’un lieu précis.",
      sortOrder: 1,
      publishState: "REVIEW",
      verification: "NEEDS_CONFIRMATION",
      exampleFlag: "LIVE",
    },
  });

  await prisma.venture.deleteMany();
  await prisma.venture.create({
    data: {
      slug: "clevone-sarl",
      name: CONFIRMED.organization,
      roleEn: `${CONFIRMED.title} — associated venture, not a product catalogue`,
      roleFr: `${CONFIRMED.title} — exposition d’un parcours, pas un catalogue`,
      summaryEn:
        "EJC is Founder/CEO and associated with CLEVONE SARL. This page does not list CLEVONE SARL products or services.",
      summaryFr:
        "EJC est fondateur et CEO, associé à CLEVONE SARL. Cette page ne catalogue pas les produits ou services de CLEVONE SARL.",
      exposureOnly: true,
      startDate: null,
      publishState: "PUBLISHED",
      verification: "VERIFIED",
      exampleFlag: "LIVE",
      sources: { create: [MANDATE_SOURCE] },
    },
  });

  await prisma.recordEvent.deleteMany();
  const birth = await prisma.recordEvent.create({
    data: {
      slug: "birth-kinshasa-1994",
      kind: "MILESTONE",
      year: 1994,
      occurredOn: CONFIRMED.birthDate,
      titleEn: "Born in Kinshasa",
      titleFr: "Naissance à Kinshasa",
      contextEn: "Kinshasa, Democratic Republic of the Congo.",
      contextFr: "Kinshasa, République démocratique du Congo.",
      decisionEn: "—",
      decisionFr: "—",
      actionEn: "—",
      actionFr: "—",
      resultEn: "Public identity begins with a confirmed origin.",
      resultFr: "L’identité publique commence par une origine confirmée.",
      lessonEn: "An incomplete verified record is stronger than a complete fiction.",
      lessonFr: "Un registre incomplet et vérifié vaut mieux qu’une fiction complète.",
      publishState: "PUBLISHED",
      verification: "VERIFIED",
      exampleFlag: "LIVE",
      sources: { create: [MANDATE_SOURCE] },
    },
  });

  await prisma.proofItem.deleteMany();

  const proofs = [
    {
      slug: "identity-name",
      claimEn: `${CONFIRMED.fullName} is the legal full name; public name ${CONFIRMED.publicName}; signature ${CONFIRMED.signature}.`,
      claimFr: `${CONFIRMED.fullName} est le nom complet ; nom public ${CONFIRMED.publicName} ; signature ${CONFIRMED.signature}.`,
      contextEn: "Public identity graph.",
      contextFr: "Graphe d’identité publique.",
      evidenceEn: "Confirmed by the site owner for this official identity platform.",
      evidenceFr: "Confirmé par le propriétaire du site pour cette plateforme d’identité.",
      occurredOn: null as string | null,
      relatedRecordId: null as string | null,
    },
    {
      slug: "origin-kinshasa",
      claimEn: `Born in ${CONFIRMED.birthPlaceCity} on ${CONFIRMED.birthDateDisplayEn}.`,
      claimFr: `Né à ${CONFIRMED.birthPlaceCity} le ${CONFIRMED.birthDateDisplayFr}.`,
      contextEn: "Origin.",
      contextFr: "Origine.",
      evidenceEn: "Confirmed biographical fact for the public record.",
      evidenceFr: "Fait biographique confirmé pour le registre public.",
      occurredOn: CONFIRMED.birthDate,
      relatedRecordId: birth.id,
    },
    {
      slug: "nationality-congolese",
      claimEn: "Congolese.",
      claimFr: "Congolais.",
      contextEn: "Nationality.",
      contextFr: "Nationalité.",
      evidenceEn: "Confirmed by the site owner.",
      evidenceFr: "Confirmé par le propriétaire du site.",
      occurredOn: null,
      relatedRecordId: null,
    },
    {
      slug: "role-founder-ceo",
      claimEn: `Entrepreneur, businessman, builder. ${CONFIRMED.title}. Associated with ${CONFIRMED.organization}.`,
      claimFr: `Entrepreneur, businessman, builder. ${CONFIRMED.title}. Associé à ${CONFIRMED.organization}.`,
      contextEn: "Public role. Not a catalogue of the associated company.",
      contextFr: "Rôle public. Pas un catalogue de l’entreprise associée.",
      evidenceEn: "Confirmed public role and association.",
      evidenceFr: "Rôle et association publics confirmés.",
      occurredOn: null,
      relatedRecordId: null,
    },
  ];

  for (const proof of proofs) {
    await prisma.proofItem.create({
      data: {
        ...proof,
        lastUpdateOn: CONFIRMED.birthDate,
        publishState: "PUBLISHED",
        verification: "VERIFIED",
        exampleFlag: "LIVE",
        sources: { create: [MANDATE_SOURCE] },
      },
    });
  }

  await prisma.nowItem.deleteMany();
  const nowKinds = [
    "FOCUS",
    "OBJECTIVE",
    "CHALLENGE",
    "DECISION",
    "LATEST_ACTION",
    "LATEST_RESULT",
    "LATEST_LESSON",
    "LATEST_SIGNAL",
  ] as const;

  for (const kind of nowKinds) {
    for (const locale of ["EN", "FR"] as const) {
      await prisma.nowItem.create({
        data: {
          kind,
          locale,
          title:
            locale === "EN"
              ? `${kind.replaceAll("_", " ")} — needs confirmation`
              : `${kind.replaceAll("_", " ")} — à confirmer`,
          body:
            locale === "EN"
              ? "Structured placeholder. No current focus, objective, or result is invented. Edit from admin when EJC confirms a live item and a source."
              : "Placeholder structuré. Aucun focus, objectif ou résultat actuel n’est inventé. À éditer depuis l’admin lorsque EJC confirme un élément sourcé.",
          occurredOn: null,
          publishState: "REVIEW",
          verification: "NEEDS_CONFIRMATION",
          exampleFlag: "EXAMPLE",
        },
      });
    }
  }

  await prisma.thinkingPiece.deleteMany();
  await prisma.thinkingPiece.create({
    data: {
      slug: "example-structure-not-an-essay",
      category: "THINKING",
      format: "NOTE",
      titleEn: "Example thinking slot — needs confirmation",
      titleFr: "Emplacement de pensée d’exemple — à confirmer",
      bodyEn:
        "EXAMPLE DATA. This is not an EJC essay. It exists so the Thinking system can be reviewed. It cannot be published as fact.",
      bodyFr:
        "DONNÉE D’EXEMPLE. Ceci n’est pas un essai d’EJC. Il existe pour que le système Thinking puisse être examiné. Il ne peut pas être publié comme fait.",
      publishedOn: null,
      publishState: "REVIEW",
      verification: "NEEDS_CONFIRMATION",
      exampleFlag: "EXAMPLE",
    },
  });

  await prisma.thesis.deleteMany();
  await prisma.thesis.create({
    data: {
      slug: "example-thesis-not-attributed",
      titleEn: "Example thesis — needs confirmation",
      titleFr: "Thèse d’exemple — à confirmer",
      bodyEn:
        "EXAMPLE DATA. Not an attributed EJC thesis. Challenge submissions are moderated and do not appear until approved.",
      bodyFr:
        "DONNÉE D’EXEMPLE. Pas une thèse attribuée à EJC. Les challenges sont modérés et n’apparaissent qu’après approbation.",
      version: 1,
      open: true,
      publishState: "REVIEW",
      verification: "NEEDS_CONFIRMATION",
      exampleFlag: "EXAMPLE",
      versions: {
        create: {
          version: 1,
          titleEn: "Example thesis — needs confirmation",
          titleFr: "Thèse d’exemple — à confirmer",
          bodyEn: "EXAMPLE DATA. Version 1 placeholder.",
          bodyFr: "DONNÉE D’EXEMPLE. Version 1 placeholder.",
          noteEn: "Seeded structure only.",
          noteFr: "Structure d’amorçage uniquement.",
        },
      },
    },
  });

  await prisma.ledgerCommitment.deleteMany();
  await prisma.ledgerCommitment.create({
    data: {
      slug: "example-commitment-not-live",
      titleEn: "Example commitment — needs confirmation",
      titleFr: "Engagement d’exemple — à confirmer",
      bodyEn: "EXAMPLE DATA. No real commitment is invented. History would be preserved if this became live.",
      bodyFr: "DONNÉE D’EXEMPLE. Aucun engagement réel n’est inventé.",
      state: "COMMITTED",
      committedOn: null,
      publishState: "REVIEW",
      verification: "NEEDS_CONFIRMATION",
      exampleFlag: "EXAMPLE",
    },
  });

  await prisma.signalPost.deleteMany();
  await prisma.mediaItem.deleteMany();
  await prisma.achievement.deleteMany();

  await prisma.mediaItem.create({
    data: {
      slug: "media-needs-confirmation",
      titleEn: "Media appearance — needs confirmation",
      titleFr: "Apparition média — à confirmer",
      outletEn: "Outlet — needs confirmation",
      outletFr: "Média — à confirmer",
      url: null,
      publishedOn: null,
      summaryEn: "EXAMPLE DATA. No press is fabricated.",
      summaryFr: "DONNÉE D’EXEMPLE. Aucune presse n’est fabriquée.",
      publishState: "REVIEW",
      verification: "NEEDS_CONFIRMATION",
      exampleFlag: "EXAMPLE",
    },
  });

  await prisma.askSource.deleteMany();
  await prisma.askSource.createMany({
    data: [
      {
        slug: "identity-facts",
        titleEn: "Confirmed identity",
        titleFr: "Identité confirmée",
        bodyEn: `${CONFIRMED.fullName}. Public name ${CONFIRMED.publicName}. Signature ${CONFIRMED.signature}. Congolese entrepreneur, businessman, builder. Founder/CEO. Associated with ${CONFIRMED.organization}.`,
        bodyFr: `${CONFIRMED.fullName}. Nom public ${CONFIRMED.publicName}. Signature ${CONFIRMED.signature}. Entrepreneur congolais, businessman, builder. Fondateur et CEO. Associé à ${CONFIRMED.organization}.`,
        canonicalUrl: "/en/identity",
        tags: "name identity ejc eroish clevone jeamson founder ceo congolese",
        approved: true,
        publishState: "PUBLISHED",
        verification: "VERIFIED",
        exampleFlag: "LIVE",
      },
      {
        slug: "origin-facts",
        titleEn: "Confirmed origin",
        titleFr: "Origine confirmée",
        bodyEn: `Born in Kinshasa, Democratic Republic of the Congo, on 1 September 1994. Grew up and lived across different countries, cities and provinces; those specific places are not confirmed.`,
        bodyFr: `Né à Kinshasa, République démocratique du Congo, le 1er septembre 1994. A grandi et vécu dans différents pays, villes et provinces ; ces lieux précis ne sont pas confirmés.`,
        canonicalUrl: "/en/places",
        tags: "born kinshasa 1994 origin birthplace drc congo multicultural",
        approved: true,
        publishState: "PUBLISHED",
        verification: "VERIFIED",
        exampleFlag: "LIVE",
      },
      {
        slug: "no-catalogue",
        titleEn: "This is not a CLEVONE SARL catalogue",
        titleFr: "Ceci n’est pas un catalogue CLEVONE SARL",
        bodyEn: `${CONFIRMED.organization} may appear only as part of the entrepreneurial journey. This site does not list CLEVONE SARL products or services.`,
        bodyFr: `${CONFIRMED.organization} n’apparaît que comme élément du parcours. Ce site ne liste pas les produits ou services de CLEVONE SARL.`,
        canonicalUrl: "/en/identity",
        tags: "clevone sarl venture not catalogue products services",
        approved: true,
        publishState: "PUBLISHED",
        verification: "VERIFIED",
        exampleFlag: "LIVE",
      },
    ],
  });

  await prisma.learningProposal.deleteMany();
  await prisma.learningProposal.create({
    data: {
      title: "Example learning proposal — not applied",
      rationale:
        "EXAMPLE DATA. The Learning Engine may recommend. It must not rewrite identity without approval.",
      recommendation: "Do not publish any new biographical fact until EJC confirms it and a source exists.",
      status: "PROPOSED",
      reversible: true,
    },
  });

  await prisma.contentRevision.create({
    data: {
      entity: "Place",
      entityId: kinshasa.id,
      version: 1,
      snapshot: JSON.stringify({ slug: kinshasa.slug, verification: "VERIFIED" }),
      note: "Initial confirmed birthplace.",
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "SEED",
      entity: "System",
      entityId: "seed",
      summary: "Initial seed with confirmed facts only; placeholders labelled.",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
