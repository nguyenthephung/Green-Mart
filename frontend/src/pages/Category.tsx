import { useEffect, useState } from "react";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { priceRanges } from "@/data/filters";
import { useLocation } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import CategoryTag from "@/components/CategoryTag";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Category() {
  const query = useQuery();
  const searchTerm = query.get("search") || "";
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    const matchesPrice =
      selectedPriceRange !== null
        ? product.price >= priceRanges[selectedPriceRange].min &&
          product.price < priceRanges[selectedPriceRange].max
        : true;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="flex">
      <aside className="w-64 p-4 border-r">
        <h3 className="font-semibold mb-2">Lọc theo giá</h3>
        <ul className="space-y-2">
          {priceRanges.map((range, idx) => (
            <li key={idx}>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="price"
                  value={idx}
                  checked={selectedPriceRange === idx}
                  onChange={() => setSelectedPriceRange(idx)}
                />
                {range.label}
              </label>
            </li>
          ))}
          <li>
            <button onClick={() => setSelectedPriceRange(null)} className="text-sm text-gray-500 underline">
              Xóa lọc giá
            </button>
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-4">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {categories.map((cat) => (
            <CategoryTag
              key={cat.id}
              name={cat.name}
              active={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
            />
          ))}
        </div>
        <div>
          {categories.map((cat) => {
            const sectionProducts = filteredProducts.filter((p) => p.categoryId === cat.id);
            if (sectionProducts.length === 0) return null;
            return (
              <div key={cat.id} className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{cat.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {sectionProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
