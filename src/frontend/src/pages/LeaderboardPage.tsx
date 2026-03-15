import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Crown,
  Medal,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { useFixture, useLeaderboard, useProducts } from "../hooks/useQueries";

type SortCol = "score" | "price" | "reliability";
type SortDir = "asc" | "desc";

function SortIndicator({
  col,
  sort,
}: { col: SortCol; sort: { col: SortCol; dir: SortDir } }) {
  if (sort.col !== col)
    return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30 inline" />;
  if (sort.dir === "desc") return <ArrowDown className="w-3 h-3 ml-1 inline" />;
  return <ArrowUp className="w-3 h-3 ml-1 inline" />;
}

export default function LeaderboardPage() {
  const { id } = useParams({ from: "/fixtures/$id/leaderboard" });
  const fixtureId = BigInt(id);
  const { data: fixture, isLoading: loadingFixture } = useFixture(fixtureId);
  const { data: entries, isLoading: loadingEntries } =
    useLeaderboard(fixtureId);
  const { data: products } = useProducts();
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir }>({
    col: "score",
    dir: "desc",
  });

  const handleSort = (col: SortCol) => {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { col, dir: "desc" },
    );
  };

  const productMap = new Map(
    (products || []).map((p) => [p.id.toString(), p.title]),
  );

  const sorted = [...(entries || [])].sort((a, b) => {
    let diff = 0;
    if (sort.col === "price") diff = a.priceScore - b.priceScore;
    else if (sort.col === "reliability") diff = a.qualityScore - b.qualityScore;
    else diff = a.overallScore - b.overallScore;
    return sort.dir === "desc" ? -diff : diff;
  });

  const groupAIds = new Set(
    (fixture?.groupASellerIds || []).map((gid) => gid.toString()),
  );
  const groupBIds = new Set(
    (fixture?.groupBSellerIds || []).map((gid) => gid.toString()),
  );

  const rankIcon = (rank: bigint) => {
    if (rank === 1n) return <Crown className="w-4 h-4 text-accent" />;
    if (rank === 2n) return <Medal className="w-4 h-4 text-muted-foreground" />;
    if (rank === 3n) return <Medal className="w-4 h-4 text-chart-4" />;
    return (
      <span className="text-muted-foreground text-sm">#{rank.toString()}</span>
    );
  };

  if (loadingFixture || loadingEntries) {
    return (
      <div
        className="container mx-auto px-4 py-12"
        data-ocid="leaderboard.loading_state"
      >
        <Skeleton className="h-10 w-72 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">
              {fixture?.name || "Fixture"} — Leaderboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Product:{" "}
              {fixture
                ? productMap.get(fixture.productId.toString()) ||
                  `#${fixture.productId.toString()}`
                : ""}
              {" · "} Formula: {fixture?.scoringFormulaVersion}
            </p>
          </div>
        </div>

        {/* Group legend */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-primary/40 inline-block" />
            Group A ({fixture?.groupASellerIds.length ?? 0} sellers)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-accent/40 inline-block" />
            Group B ({fixture?.groupBSellerIds.length ?? 0} sellers)
          </div>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground border border-border/40 rounded-xl"
          data-ocid="leaderboard.empty_state"
        >
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No leaderboard entries yet for this fixture.</p>
        </div>
      ) : (
        <div className="border border-border/60 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => handleSort("score")}
                    className="flex items-center font-semibold hover:text-foreground transition-colors"
                    data-ocid="leaderboard.score.toggle"
                  >
                    Score
                    <SortIndicator col="score" sort={sort} />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => handleSort("price")}
                    className="flex items-center font-semibold hover:text-foreground transition-colors"
                    data-ocid="leaderboard.price.toggle"
                  >
                    Price
                    <SortIndicator col="price" sort={sort} />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    onClick={() => handleSort("reliability")}
                    className="flex items-center font-semibold hover:text-foreground transition-colors"
                    data-ocid="leaderboard.reliability.toggle"
                  >
                    Reliability
                    <SortIndicator col="reliability" sort={sort} />
                  </button>
                </TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Winner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((entry, i) => {
                const sellerStr = entry.sellerId.toString();
                const inA = groupAIds.has(sellerStr);
                const inB = groupBIds.has(sellerStr);
                return (
                  <TableRow
                    key={entry.id.toString()}
                    className={entry.isWinner ? "bg-primary/5" : ""}
                    data-ocid={`leaderboard.row.${i + 1}`}
                  >
                    <TableCell>{rankIcon(entry.rank)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs">#{sellerStr}</span>
                        {inA && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-1 py-0">
                            A
                          </Badge>
                        )}
                        {inB && (
                          <Badge className="bg-accent/20 text-accent border-accent/30 text-xs px-1 py-0">
                            B
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {productMap.get(entry.productId.toString()) ||
                        `#${entry.productId.toString()}`}
                    </TableCell>
                    <TableCell className="font-bold text-primary">
                      {entry.overallScore.toFixed(1)}
                    </TableCell>
                    <TableCell>{entry.priceScore.toFixed(1)}</TableCell>
                    <TableCell>{entry.qualityScore.toFixed(1)}</TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        <div>Warranty: {entry.warrantyScore.toFixed(1)}</div>
                        <div>Service: {entry.serviceScore.toFixed(1)}</div>
                        <div>
                          Completed orders:{" "}
                          {entry.completedMatchCount.toString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.isWinner ? (
                        <Badge className="bg-accent/20 text-accent border-accent/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
