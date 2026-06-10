import { notFound } from "next/navigation";
import { getAllMaterials } from "@/lib/content";
import { MaterialCard } from "@/components/MaterialCard";
import { categories } from "@/config/categories";

export const dynamicParams = false;

export async function generateStaticParams() {
  const materials = getAllMaterials();
  return Array.from(new Set(materials.map((m) => m.category))).map(
    (category) => ({ category })
  );
}

export default async function CategoryMaterialsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const config = categories[category];
  if (!config) notFound();

  const materials = getAllMaterials()
    .filter((m) => m.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">
        {config.icon} {config.description}
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-8">
        {materials.length} 份资料
      </p>

      {materials.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-center py-8">
          该分类下暂无资料
        </p>
      ) : (
        <div className="grid gap-4">
          {materials.map((material) => (
            <MaterialCard key={material.slug} material={material} />
          ))}
        </div>
      )}
    </main>
  );
}
