import { describe, expect, it } from "vitest";

import { journeyChapters } from "@/components/journey/journey-chapters";

describe("journey chapter badges", () => {
  it("marks only confirmed claims as verified and leaves the meta chapter unbadged", () => {
    for (const locale of ["en", "fr"] as const) {
      const chapters = Object.fromEntries(journeyChapters(locale).map((chapter) => [chapter.id, chapter]));
      expect(chapters.origin?.status).toBe("verified");
      expect(chapters.places?.status).toBe("verified");
      expect(chapters.builder?.status).toBe("needs");
      expect(chapters.responsibility?.status).toBe("verified");
      expect(chapters.record?.status).toBe("none");
      expect(chapters.places?.body).not.toMatch(/Kid fact|fact\./);
    }
  });
});
