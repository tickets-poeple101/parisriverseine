// app/products/[slug]/page.tsx
import { Metadata } from "next";
import TicketSelector from "@/components/TicketSelector";
import rawCatalog from "@/data/products.json" assert { type: "json" };

type Variant = {
  label: string;
  priceCents: number;
  sku: string;
};

type CatalogItem = {
  id: string;
  title: string;
  images: string[];
  variants: Variant[];
  description?: string;
};

const CATALOG = rawCatalog as CatalogItem[];

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = CATALOG.find((p) => p.id === params.slug);
  return {
    title: product
      ? `${product.title} | Paris River Seine`
      : "Product | Paris River Seine",
  };
}

export default function ProductPage({ params }: PageProps) {
  const product = CATALOG.find((p) => p.id === params.slug);

  if (!product) {
    return <main className="p-8">Product not found.</main>;
  }

  const variants = product.variants.map((v) => v.label);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
      <TicketSelector
  slug={params.slug}
  variants={variants}
  products={[product]}
/>

    </main>
  );
}
