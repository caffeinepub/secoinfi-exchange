import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";
import { useMyMatches, useProfile } from "../hooks/useQueries";
import { formatCurrency, formatNano } from "../utils/session";

function matchStatusBadge(status: string) {
  const map: Record<string, string> = {
    PLACED: "bg-primary/20 text-primary border-primary/30",
    SHIPPED: "bg-chart-2/20 text-chart-2 border-chart-2/30",
    DELIVERED: "bg-chart-3/20 text-chart-3 border-chart-3/30",
    DISPUTED: "bg-destructive/20 text-destructive border-destructive/30",
    REFUNDED: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={map[status] || "bg-muted text-muted-foreground"}>
      {status}
    </Badge>
  );
}

export default function BuyerOrders() {
  const { data: matches, isLoading } = useMyMatches();
  const { data: profile } = useProfile();

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-12"
        data-ocid="buyer-orders.loading_state"
      >
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        {profile?.maskedTag && (
          <p className="text-muted-foreground text-sm mt-1">
            Buyer tag:{" "}
            <span className="font-mono text-primary">…{profile.maskedTag}</span>
          </p>
        )}
      </div>

      {(matches || []).length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground border border-border/40 rounded-xl"
          data-ocid="buyer-orders.empty_state"
        >
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm mt-1">
            Submit an intent and get matched with the best seller
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(matches || []).map((match, i) => (
            <div
              key={match.id.toString()}
              className="bg-card border border-border/60 rounded-xl p-5"
              data-ocid={`buyer-orders.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {matchStatusBadge(match.status)}
                    <Badge variant="outline" className="text-xs">
                      {match.settlementStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Agreed Price:{" "}
                    <span className="text-foreground font-semibold">
                      {formatCurrency(match.agreedPrice)}
                    </span>
                    {" · "}
                    Qty:{" "}
                    <span className="text-foreground">
                      {match.quantity.toString()}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Order ID:{" "}
                    <span className="font-mono">#{match.id.toString()}</span>
                    {" · "}
                    Created: {formatNano(match.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
