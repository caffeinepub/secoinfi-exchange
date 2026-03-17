import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Plus, ShoppingCart, X } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { AppRole } from "../backend";
import { useActor } from "../hooks/useActor";
import { useMyIntents, useProducts, useProfile } from "../hooks/useQueries";
import { formatNano } from "../utils/session";

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

export default function BuyerDashboard() {
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: intents, isLoading } = useMyIntents();
  const { data: products } = useProducts();
  const { actor } = useActor();
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loadingProfile && profile && profile.role !== AppRole.BUYER) {
      navigate({ to: "/" });
    }
  }, [profile, loadingProfile, navigate]);

  const productMap = new Map(
    (products || []).map((p) => [p.id.toString(), p.title]),
  );

  const cancelMutation = useMutation({
    mutationFn: async (intentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateIntentStatus(intentId, "CANCELLED");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-intents"] });
      toast.success("Intent cancelled");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (loadingProfile || isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-12"
        data-ocid="buyer-dashboard.loading_state"
      >
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Intents</h1>
          {profile?.maskedTag && (
            <p className="text-muted-foreground text-sm mt-1">
              Your buyer tag:{" "}
              <span className="font-mono text-primary">
                …{profile.maskedTag}
              </span>
            </p>
          )}
        </div>
        <Button asChild data-ocid="buyer-dashboard.primary_button">
          <Link to="/buyer/intents/new">
            <Plus className="w-4 h-4 mr-1" /> New Intent
          </Link>
        </Button>
      </div>

      {(intents || []).length === 0 && (
        <div
          className="text-center py-16 text-muted-foreground border border-border/40 rounded-xl"
          data-ocid="buyer-dashboard.empty_state"
        >
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No intents yet</p>
          <p className="text-sm mt-1 mb-6">
            Create your first intent to start receiving competitive offers
          </p>
          <Button asChild data-ocid="buyer-dashboard.primary_button">
            <Link to="/buyer/intents/new">Create Intent</Link>
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {(intents || []).map((intent, i) => {
          const isAutoMatched = intent.status === "MATCHED_AUTO";
          const cardContent = (
            <div
              className={`bg-card border rounded-xl p-5 ${
                isAutoMatched
                  ? "border-amber-500/40 hover:border-amber-500/70 cursor-pointer transition-colors"
                  : "border-border/60"
              }`}
              data-ocid={`buyer-dashboard.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {statusBadge(intent.status)}
                    <span className="text-sm text-muted-foreground">
                      Product:{" "}
                      <span className="text-foreground">
                        {productMap.get(intent.productId.toString()) ||
                          `#${intent.productId.toString()}`}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Qty:{" "}
                    <span className="text-foreground">
                      {intent.requestedQuantity.toString()}
                    </span>
                    {" · "}
                    Created: {formatNano(intent.createdAt)}
                  </p>
                  {intent.constraintsJson &&
                    intent.constraintsJson !== "{}" && (
                      <pre className="mt-2 text-xs bg-muted/40 rounded p-2 text-muted-foreground overflow-auto">
                        {intent.constraintsJson}
                      </pre>
                    )}
                </div>
                <div className="flex items-center gap-2">
                  {isAutoMatched && (
                    <ChevronRight className="w-4 h-4 text-amber-500" />
                  )}
                  {intent.status === "OPEN" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.preventDefault();
                        cancelMutation.mutate(intent.id);
                      }}
                      disabled={cancelMutation.isPending}
                      data-ocid={`buyer-dashboard.delete_button.${i + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );

          if (isAutoMatched) {
            return (
              <Link
                key={intent.id.toString()}
                to="/buyer/intents/$id"
                params={{ id: intent.id.toString() }}
                data-ocid={`buyer-dashboard.link.${i + 1}`}
              >
                {cardContent}
              </Link>
            );
          }

          return <div key={intent.id.toString()}>{cardContent}</div>;
        })}
      </div>
    </div>
  );
}
