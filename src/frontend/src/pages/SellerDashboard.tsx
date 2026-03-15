import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Package, Plus, Store } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { AppRole } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  useMatchesForSeller,
  useMyOffers,
  useProducts,
  useProfile,
} from "../hooks/useQueries";
import { formatCurrency, formatNano } from "../utils/session";

export default function SellerDashboard() {
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: offers, isLoading: loadingOffers } = useMyOffers();
  const { data: matches, isLoading: loadingMatches } = useMatchesForSeller();
  const { data: products } = useProducts();
  const { actor } = useActor();
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingProfile && profile && profile.role !== AppRole.SELLER) {
      navigate({ to: "/" });
    }
  }, [profile, loadingProfile, navigate]);

  const productMap = new Map(
    (products || []).map((p) => [p.id.toString(), p.title]),
  );

  const deactivateMutation = useMutation({
    mutationFn: async (offer: {
      id: bigint;
      productId: bigint;
      priceMrp: number;
      priceOffer: number;
      quantityAvailable: bigint;
      qualityScore: bigint;
      serviceScore: bigint;
      warrantyMonths: bigint;
      shippingTimeDays: bigint;
      termsSummary: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOffer(
        offer.id,
        offer.productId,
        offer.priceMrp,
        offer.priceOffer,
        offer.quantityAvailable,
        offer.qualityScore,
        offer.serviceScore,
        offer.warrantyMonths,
        offer.shippingTimeDays,
        offer.termsSummary,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-offers"] });
      toast.success("Offer updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (loadingProfile) {
    return (
      <div
        className="container mx-auto px-4 py-12"
        data-ocid="seller-dashboard.loading_state"
      >
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!profile?.isApproved) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <Store className="w-12 h-12 mx-auto text-muted-foreground opacity-40 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Pending Approval</h1>
        <p className="text-muted-foreground">
          Your seller account is awaiting admin approval. You'll be notified
          once approved.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {profile?.businessName || "Your business"}
          </p>
        </div>
        <Button asChild data-ocid="seller-dashboard.primary_button">
          <Link to="/seller/offers/new">
            <Plus className="w-4 h-4 mr-1" /> New Offer
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="offers">
        <TabsList className="mb-6">
          <TabsTrigger value="offers" data-ocid="seller-dashboard.tab">
            My Offers ({(offers || []).length})
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="seller-dashboard.tab">
            Orders ({(matches || []).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offers">
          {loadingOffers && <Skeleton className="h-32 w-full" />}
          {!loadingOffers && (offers || []).length === 0 && (
            <div
              className="text-center py-16 text-muted-foreground border border-border/40 rounded-xl"
              data-ocid="seller-dashboard.empty_state"
            >
              <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No offers yet. Create your first offer to start competing!</p>
            </div>
          )}
          <div className="space-y-4">
            {(offers || []).map((offer, i) => (
              <div
                key={offer.id.toString()}
                className="bg-card border border-border/60 rounded-xl p-5"
                data-ocid={`seller-dashboard.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">
                        {productMap.get(offer.productId.toString()) ||
                          `Product #${offer.productId.toString()}`}
                      </span>
                      <Badge variant={offer.isActive ? "default" : "secondary"}>
                        {offer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      MRP:{" "}
                      <span className="line-through">
                        {formatCurrency(offer.priceMrp)}
                      </span>
                      {" → "}
                      Offer:{" "}
                      <span className="text-primary font-semibold">
                        {formatCurrency(offer.priceOffer)}
                      </span>
                      {" · "} Qty: {offer.quantityAvailable.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quality: {offer.qualityScore.toString()} · Service:{" "}
                      {offer.serviceScore.toString()} · Warranty:{" "}
                      {offer.warrantyMonths.toString()}mo
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deactivateMutation.mutate(offer)}
                    disabled={deactivateMutation.isPending}
                    data-ocid={`seller-dashboard.edit_button.${i + 1}`}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          {loadingMatches && <Skeleton className="h-32 w-full" />}
          {!loadingMatches && (matches || []).length === 0 && (
            <div
              className="text-center py-16 text-muted-foreground border border-border/40 rounded-xl"
              data-ocid="seller-dashboard.empty_state"
            >
              <p>No orders yet.</p>
            </div>
          )}
          <div className="space-y-4">
            {(matches || []).map((match, i) => (
              <div
                key={match.id.toString()}
                className="bg-card border border-border/60 rounded-xl p-5"
                data-ocid={`seller-dashboard.item.${i + 1}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Badge>{match.status}</Badge>
                  <Badge variant="outline">{match.settlementStatus}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Buyer:{" "}
                  <span className="font-mono text-foreground">Anon Buyer</span>
                  {" · "} Price:{" "}
                  <span className="text-primary font-semibold">
                    {formatCurrency(match.agreedPrice)}
                  </span>
                  {" · "} Qty: {match.quantity.toString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNano(match.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
