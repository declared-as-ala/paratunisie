import { CatalogueQualityService, QUALITY_CHECKS } from "./catalogue-quality.service";

describe("CatalogueQualityService (read-only report)", () => {
  const queryRaw = jest.fn();
  const prisma = { $queryRaw: queryRaw, product: { count: jest.fn().mockResolvedValue(7) } } as never;
  const service = new CatalogueQualityService(prisma);

  beforeEach(() => queryRaw.mockReset().mockResolvedValue([{ n: BigInt(0) }]));

  it("rejects unknown checks without touching the database", async () => {
    const result = await service.list("DROP TABLE x");
    expect(result.items).toEqual([]);
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("only issues SELECT statements and binds the search term", async () => {
    await service.list("duplicate-names", 2, 10, "whey'; drop table \"Product\";--");
    for (const [sql] of queryRaw.mock.calls) {
      expect(sql.sql).toMatch(/^\s*SELECT/i);
      expect(sql.sql).not.toMatch(/\b(UPDATE|DELETE|INSERT|DROP|ALTER|TRUNCATE)\b/i);
      expect(sql.sql).not.toContain("drop table");
    }
    const bound = queryRaw.mock.calls.flatMap(([sql]) => sql.values);
    expect(bound).toContain("%whey'; drop table \"Product\";--%");
  });

  it("caps the page size at 100", async () => {
    await service.list("thin-description", 1, 5000);
    expect(queryRaw.mock.calls[0][0].values).toContain(100);
  });

  it("summarizes every check", async () => {
    const result = await service.summary();
    expect(result.checks.map((c) => c.check)).toEqual([...QUALITY_CHECKS]);
  });
});
