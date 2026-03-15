import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Package, Search } from "lucide-react";
import { useState } from "react";
import { useProducts } from "../hooks/useQueries";

export default function ProductsPage() {
  const { data: products, isLoading, isError } = useProducts();
  const [search, setSearch] = useState("");

  const filtered = (products || []).filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.baseSkuCode.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">
            Browse the product catalog and find the best deals
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="products.search_input"
          />
        </div>
      </div>

      {isLoading && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-ocid="products.loading_state"
        >
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
            <Skeleton key={sk} className="h-44 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div
          className="text-center py-16 text-destructive"
          data-ocid="products.error_state"
        >
          Failed to load products. Please try again.
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="products.empty_state"
        >
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">
            {search
              ? "Try a different search term"
              : "Products will appear here once added by admin"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product, i) => (
          <Link
            key={product.id.toString()}
            to="/products/$id"
            params={{ id: product.id.toString() }}
            className="block"
            data-ocid={`products.item.${i + 1}`}
          >
            <div className="bg-card border border-border/60 rounded-xl p-6 hover:border-primary/40 hover:bg-card/80 transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {product.baseSkuCode}
                </span>
              </div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">
                {product.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {product.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
