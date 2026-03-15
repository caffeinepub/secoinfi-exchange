import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { CheckCircle, Clock, Swords, XCircle } from "lucide-react";
import { useFixtures, useProducts } from "../hooks/useQueries";
import { formatNano } from "../utils/session";

function statusBadge(status: string) {
  if (status === "LIVE")
    return (
      <Badge className="bg-chart-3/20 text-chart-3 border-chart-3/30">
        <CheckCircle className="w-3 h-3 mr-1" />
        LIVE
      </Badge>
    );
  if (status === "CLOSED")
    return (
      <Badge className="bg-destructive/20 text-destructive border-destructive/30">
        <XCircle className="w-3 h-3 mr-1" />
        CLOSED
      </Badge>
    );
  return (
    <Badge className="bg-muted text-muted-foreground border-border">
      <Clock className="w-3 h-3 mr-1" />
      PLANNED
    </Badge>
  );
}

export default function FixturesPage() {
  const { data: fixtures, isLoading, isError } = useFixtures();
  const { data: products } = useProducts();

  const productMap = new Map(
    (products || []).map((p) => [p.id.toString(), p.title]),
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Fixtures</h1>
        <p className="text-muted-foreground mt-1">
          Live competition rounds where sellers battle for your orders
        </p>
      </div>

      {isLoading && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          data-ocid="fixtures.loading_state"
        >
          {["s1", "s2", "s3", "s4"].map((sk) => (
            <Skeleton key={sk} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div
          className="text-center py-16 text-destructive"
          data-ocid="fixtures.error_state"
        >
          Failed to load fixtures.
        </div>
      )}

      {!isLoading && !isError && (fixtures || []).length === 0 && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="fixtures.empty_state"
        >
          <Swords className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No fixtures yet</p>
          <p className="text-sm mt-1">
            Fixtures are created by admins to run seller competitions
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(fixtures || []).map((fixture, i) => (
          <div
            key={fixture.id.toString()}
            className="bg-card border border-border/60 rounded-xl p-6"
            data-ocid={`fixtures.item.${i + 1}`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-lg">{fixture.name}</h3>
              {statusBadge(fixture.status)}
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Product:{" "}
              <span className="text-foreground">
                {productMap.get(fixture.productId.toString()) ||
                  `#${fixture.productId.toString()}`}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mb-1">
              Group A: {fixture.groupASellerIds.length} sellers · Group B:{" "}
              {fixture.groupBSellerIds.length} sellers
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {formatNano(fixture.startsAt)} → {formatNano(fixture.endsAt)}
            </p>
            <Link
              to="/fixtures/$id/leaderboard"
              params={{ id: fixture.id.toString() }}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              data-ocid={`fixtures.item.${i + 1}`}
            >
              View Leaderboard →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
