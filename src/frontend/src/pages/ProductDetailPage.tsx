import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useParams } from "@tanstack/react-router";
import { Package, ShoppingCart, Star, Tag } from "lucide-react";
import { AppRole } from "../backend";
import {
  useOffersByProduct,
  useProduct,
  useProfile,
} from "../hooks/useQueries";
import { formatCurrency } from "../utils/session";

export default function ProductDetailPage() {
  const { id } = useParams({ from: "/products/$id" });
  const productId = BigInt(id);

  const { data: product, isLoading: loadingProduct } = useProduct(productId);
  const { data: offers, isLoading: loadingOffers } =
    useOffersByProduct(productId);
  const { data: profile } = useProfile();

  const activeOffers = (offers || []).filter((o) => o.isActive);

  if (loadingProduct) {
    return (
      <div
        className="container mx-auto px-4 py-12"
        data-ocid="product-detail.loading_state"
      >
        <Skeleton className="h-10 w-72 mb-4" />
        <Skeleton className="h-24 w-full mb-8" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="container mx-auto px-4 py-12 text-center"
        data-ocid="product-detail.error_state"
      >
        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-xl font-semibold">Product not found</p>
      </div>
    );
  }

  let attrs: Record<string, string> = {};
  try {
    attrs = JSON.parse(product.attributes);
  } catch {
    /* noop */
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-3 mb-3">
          <Badge variant="secondary">{product.category}</Badge>
          <span className="text-xs text-muted-foreground font-mono pt-0.5">
            {product.baseSkuCode}
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-3">{product.title}</h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
          {product.description}
        </p>
        {Object.keys(attrs).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(attrs).map(([k, v]) => (
              <Badge key={k} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {k}: {v}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* CTA for buyers */}
      {profile?.role === AppRole.BUYER && (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-semibold">Want the best deal?</p>
            <p className="text-sm text-muted-foreground">
              Submit an intent and let sellers compete to serve you.
            </p>
          </div>
          <Button asChild data-ocid="product-detail.primary_button">
            <Link to="/buyer/intents/new" search={{ productId: id }}>
              <ShoppingCart className="w-4 h-4 mr-2" /> Request Best Deal
            </Link>
          </Button>
        </div>
      )}

      {/* Offers table */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" /> Active Seller Offers
          <Badge variant="secondary" className="ml-2">
            {activeOffers.length}
          </Badge>
        </h2>

        {loadingOffers && (
          <Skeleton
            className="h-32 w-full"
            data-ocid="product-detail.loading_state"
          />
        )}

        {!loadingOffers && activeOffers.length === 0 && (
          <div
            className="text-center py-10 text-muted-foreground border border-border/40 rounded-xl"
            data-ocid="product-detail.empty_state"
          >
            <p>No active offers for this product yet.</p>
          </div>
        )}

        {!loadingOffers && activeOffers.length > 0 && (
          <div className="border border-border/60 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Seller</TableHead>
                  <TableHead>MRP</TableHead>
                  <TableHead>Offer Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Warranty</TableHead>
                  <TableHead>Ship (days)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeOffers.map((offer, i) => (
                  <TableRow
                    key={offer.id.toString()}
                    data-ocid={`product-detail.row.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      Seller #{offer.sellerId.toString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground line-through text-sm">
                      {formatCurrency(offer.priceMrp)}
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {formatCurrency(offer.priceOffer)}
                    </TableCell>
                    <TableCell>{offer.quantityAvailable.toString()}</TableCell>
                    <TableCell>{offer.qualityScore.toString()}/100</TableCell>
                    <TableCell>{offer.serviceScore.toString()}/100</TableCell>
                    <TableCell>{offer.warrantyMonths.toString()} mo</TableCell>
                    <TableCell>{offer.shippingTimeDays.toString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
