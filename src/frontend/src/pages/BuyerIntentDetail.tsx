import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Package, Tag, User } from "lucide-react";
import { useActor } from "../hooks/useActor";
import {
  useLeaderboard,
  useMyIntents,
  useMyMatches,
  useProducts,
} from "../hooks/useQueries";
import { formatNano } from "../utils/session";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

function statusBadge(status: string) {
  const map: Record<string, { cls: string; label: string }> = {
    OPEN: {
      cls: "bg-chart-3/20 text-chart-3 border-chart-3/30",
      label: "Open",
    },
    MATCHED: {
      cls: "bg-primary/20 text-primary border-primary/30",
      label: "Matched",
    },
    MATCHED_AUTO: {
      cls: "bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-400",
      label: "Auto-matched",
    },
    FULFILLED: { cls: "bg-muted text-muted-foreground", label: "Fulfilled" },
    CANCELLED: {
      cls: "bg-destructive/20 text-destructive border-destructive/30",
      label: "Cancelled",
    },
  };
  const entry = map[status];
  return (
    <Badge className={entry?.cls || "bg-muted text-muted-foreground"}>
      {entry?.label || status}
    </Badge>
  );
}

export default function BuyerIntentDetail() {
  const { id } = useParams({ from: "/buyer/intents/$id" });
  const { actor, isFetching: actorFetching } = useActor();

  const { data: intents, isLoading: loadingIntents } = useMyIntents();
  const { data: matches, isLoading: loadingMatches } = useMyMatches();
  const { data: products } = useProducts();

  const intent = (intents || []).find((i) => i.id.toString() === id);
  const match = intent
    ? (matches || []).find((m) => m.buyerIntentId === intent.id)
    : undefined;

  const { data: offers, isLoading: loadingOffers } = useQuery({
    queryKey: ["offers-by-product", intent?.productId?.toString()],
    queryFn: async () => {
      if (!actor || !intent) return [];
      return actor.listOffersByProduct(intent.productId);
    },
    enabled: !!actor && !actorFetching && !!intent,
  });

  const offer = match
    ? (offers || []).find((o) => o.id === match.sellerProductOfferId)
    : undefined;

  const fixtureId = match?.fixtureId ?? null;
  const { data: leaderboardEntries } = useLeaderboard(fixtureId ?? null);
  const leaderboardEntry = offer
    ? (leaderboardEntries || []).find((e) => e.sellerId === offer.sellerId)
    : undefined;

  const productMap = new Map(
    (products || []).map((p) => [p.id.toString(), p.title]),
  );

  const isLoading = loadingIntents || loadingMatches || loadingOffers;

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-12 max-w-2xl"
        data-ocid="buyer-intent-detail.loading_state"
      >
        <Skeleton className="h-6 w-32 mb-8" />
        <Skeleton className="h-48 w-full mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!intent) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Link
          to="/buyer/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          data-ocid="buyer-intent-detail.link"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Intents
        </Link>
        <p className="text-muted-foreground">Intent not found.</p>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 py-12 max-w-2xl"
      data-ocid="buyer-intent-detail.panel"
    >
      <Link
        to="/buyer/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        data-ocid="buyer-intent-detail.link"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Intents
      </Link>

      {/* Intent details */}
      <div className="bg-card border border-border/60 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Intent Details</h2>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-muted-foreground">ID</dt>
            <dd className="font-mono font-medium">{intent.id.toString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd>{statusBadge(intent.status)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Product</dt>
            <dd className="font-medium">
              {productMap.get(intent.productId.toString()) ||
                `#${intent.productId.toString()}`}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Quantity</dt>
            <dd>{intent.requestedQuantity.toString()}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Created at</dt>
            <dd>{formatNano(intent.createdAt)}</dd>
          </div>
        </dl>
      </div>

      {/* Matched seller offer */}
      {match && offer ? (
        <div className="bg-card border border-amber-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Matched Seller Offer</h2>
            <div className="ml-auto flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 dark:text-amber-400">
                Auto-matched
              </Badge>
              {match.status === "DISPUTED" && (
                <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                  DISPUTED
                </Badge>
              )}
              {match.status === "REFUNDED" && (
                <Badge className="bg-muted text-muted-foreground border-border/40">
                  REFUNDED
                </Badge>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Seller ID</dt>
              <dd className="font-mono font-medium">
                #{offer.sellerId.toString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Price Offer</dt>
              <dd className="font-semibold text-primary">
                {formatCurrency(offer.priceOffer)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Warranty</dt>
              <dd>{offer.warrantyMonths.toString()} months</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Service Score</dt>
              <dd>{offer.serviceScore.toString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Completed Orders</dt>
              <dd>
                {leaderboardEntry
                  ? leaderboardEntry.completedMatchCount.toString()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Overall Score</dt>
              <dd className="font-bold">
                {leaderboardEntry
                  ? leaderboardEntry.overallScore.toFixed(1)
                  : "—"}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-muted-foreground italic">
            <Tag className="w-3 h-3 inline mr-1" />
            This view is read-only. No action is required from you at this
            stage.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border/40 rounded-xl p-6 text-center text-muted-foreground">
          <p className="text-sm">No match linked yet.</p>
        </div>
      )}
    </div>
  );
}
