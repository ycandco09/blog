import { getAllMaterials } from "@/lib/content";
import { MaterialCard } from "@/components/MaterialCard";
import { categories } from "@/config/categories";

export default function MaterialsPage() {
  const materials = getAllMaterials().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const grouped: Record<string, (typeof materials)[number][]> = {};
  for (const m of materials) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">📚 资料库</h1>
      <p className="text-[var(--color-text-secondary)] mb-8">
        安全研究参考资料与技术文档归档
      </p>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-center py-8">
          暂无资料
        </p>
      ) : (
        Object.entries(grouped).map(([cat, items]) => {
          const config = categories[cat];
          return (
            <section key={cat} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                {config && (
                  <h2 className="text-xl font-semibold">
                    {config.icon} {config.description}
                  </h2>
                )}
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {items.length} 份资料
                </span>
              </div>

              <div className="grid gap-4">
                {items.map((material) => (
                  <MaterialCard key={material.slug} material={material} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}
