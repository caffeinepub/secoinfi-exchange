import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  Loader2,
  Plus,
  Shield,
  Trophy,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppRole } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  useAdminAllIntents,
  useAdminAllMatches,
  useAdminAllOffers,
  useAdminUsers,
  useApproveUser,
  useFixtures,
  useLeaderboard,
  useProducts,
  useProfile,
  useSetUserActive,
} from "../hooks/useQueries";
import { formatCurrency, formatNano } from "../utils/session";

function AdminLeaderboardEntry() {
  const { data: fixtures } = useFixtures();
  const { data: products } = useProducts();
  const { actor } = useActor();
  const qc = useQueryClient();

  const [fixtureId, setFixtureId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [productId, setProductId] = useState("");
  const [priceScore, setPriceScore] = useState("80");
  const [qualityScore, setQualityScore] = useState("80");
  const [serviceScore, setServiceScore] = useState("80");
  const [warrantyScore, setWarrantyScore] = useState("80");
  const [overallScore, setOverallScore] = useState("80");
  const [rank, setRank] = useState("1");
  const [isWinner, setIsWinner] = useState(false);

  const recompute = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.adminRecomputeLeaderboard();
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      toast.success(
        `Leaderboard recomputed: ${result.updated} of ${result.total} entries updated.`,
      );
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.createLeaderboardEntry(
        BigInt(fixtureId),
        BigInt(sellerId),
        BigInt(productId),
        Number.parseFloat(priceScore),
        Number.parseFloat(qualityScore),
        Number.parseFloat(serviceScore),
        Number.parseFloat(warrantyScore),
        Number.parseFloat(overallScore),
        BigInt(Number.parseInt(rank) || 1),
        isWinner,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      toast.success("Leaderboard entry added!");
      setSellerId("");
      setPriceScore("80");
      setQualityScore("80");
      setServiceScore("80");
      setWarrantyScore("80");
      setOverallScore("80");
      setRank("1");
      setIsWinner(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Add Leaderboard Entry</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => recompute.mutate()}
          disabled={recompute.isPending}
          data-ocid="admin-leaderboard.recompute_button"
        >
          {recompute.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Recompute Leaderboard
        </Button>
      </div>
      <div className="space-y-2">
        <Label>Fixture</Label>
        <Select
          value={fixtureId}
          onValueChange={(v) => {
            setFixtureId(v);
            const fix = (fixtures || []).find((f) => f.id.toString() === v);
            if (fix) setProductId(fix.productId.toString());
          }}
        >
          <SelectTrigger data-ocid="admin-leaderboard.select">
            <SelectValue placeholder="Select fixture" />
          </SelectTrigger>
          <SelectContent>
            {(fixtures || []).map((f) => (
              <SelectItem key={f.id.toString()} value={f.id.toString()}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sid">Seller ID</Label>
          <Input
            id="sid"
            type="number"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            data-ocid="admin-leaderboard.input"
          />
        </div>
        <div className="space-y-2">
          <Label>Product</Label>
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger data-ocid="admin-leaderboard.select">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {(products || []).map((p) => (
                <SelectItem key={p.id.toString()} value={p.id.toString()}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            ["Price", priceScore, setPriceScore],
            ["Quality", qualityScore, setQualityScore],
            ["Service", serviceScore, setServiceScore],
            ["Warranty", warrantyScore, setWarrantyScore],
            ["Overall", overallScore, setOverallScore],
            ["Rank", rank, setRank],
          ] as [string, string, (v: string) => void][]
        ).map(([label, val, setter]) => (
          <div key={label} className="space-y-1">
            <Label className="text-xs">{label}</Label>
            <Input
              type="number"
              value={val}
              onChange={(e) => setter(e.target.value)}
              className="h-8 text-sm"
              data-ocid="admin-leaderboard.input"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={isWinner}
          onCheckedChange={setIsWinner}
          data-ocid="admin-leaderboard.switch"
        />
        <Label>Mark as Winner</Label>
      </div>
      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !fixtureId || !sellerId || !productId}
        data-ocid="admin-leaderboard.submit_button"
      >
        {mutation.isPending && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        Add Entry
      </Button>
      {mutation.isError && (
        <p
          className="text-sm text-destructive"
          data-ocid="admin-leaderboard.error_state"
        >
          {(mutation.error as Error).message}
        </p>
      )}

      {fixtureId && <LeaderboardPreview fixtureId={BigInt(fixtureId)} />}
    </div>
  );
}

type SortCol = "score" | "price" | "reliability" | "completedOrders";
type SortDir = "asc" | "desc";

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 opacity-30">↕</span>;
  return <span className="ml-1">{dir === "desc" ? "↓" : "↑"}</span>;
}

function LeaderboardPreview({ fixtureId }: { fixtureId: bigint }) {
  const { data: entries, isLoading } = useLeaderboard(fixtureId);
  const [sort, setSort] = useState<{ col: SortCol; dir: SortDir }>({
    col: "score",
    dir: "desc",
  });

  function handleSort(col: SortCol) {
    setSort((prev) =>
      prev.col === col
        ? { col, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { col, dir: "desc" },
    );
  }

  if (isLoading) return <Skeleton className="h-24 w-full mt-4" />;
  if (!entries || entries.length === 0)
    return (
      <p className="text-sm text-muted-foreground mt-4">
        No entries for this fixture yet.
      </p>
    );

  const sorted = [...entries].sort((a, b) => {
    let aVal: number;
    let bVal: number;
    if (sort.col === "score") {
      aVal = a.overallScore;
      bVal = b.overallScore;
    } else if (sort.col === "price") {
      aVal = a.priceScore;
      bVal = b.priceScore;
    } else if (sort.col === "completedOrders") {
      aVal = Number(a.completedMatchCount);
      bVal = Number(b.completedMatchCount);
    } else {
      aVal = a.qualityScore;
      bVal = b.qualityScore;
    }
    return sort.dir === "desc" ? bVal - aVal : aVal - bVal;
  });

  return (
    <div className="mt-4">
      <h4 className="font-medium text-sm mb-2">Current Entries</h4>
      <div className="border border-border/60 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Rank</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>
                <button
                  type="button"
                  className="cursor-pointer select-none flex items-center gap-0.5 hover:text-foreground"
                  onClick={() => handleSort("score")}
                  data-ocid="admin-leaderboard.score.toggle"
                >
                  Score
                  <SortIndicator active={sort.col === "score"} dir={sort.dir} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="cursor-pointer select-none flex items-center gap-0.5 hover:text-foreground"
                  onClick={() => handleSort("price")}
                  data-ocid="admin-leaderboard.price.toggle"
                >
                  Price
                  <SortIndicator active={sort.col === "price"} dir={sort.dir} />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="cursor-pointer select-none flex items-center gap-0.5 hover:text-foreground"
                  onClick={() => handleSort("reliability")}
                  data-ocid="admin-leaderboard.reliability.toggle"
                >
                  Reliability
                  <SortIndicator
                    active={sort.col === "reliability"}
                    dir={sort.dir}
                  />
                </button>
              </TableHead>
              <TableHead>
                <button
                  type="button"
                  className="cursor-pointer select-none flex items-center gap-0.5 hover:text-foreground"
                  onClick={() => handleSort("completedOrders")}
                  data-ocid="admin-leaderboard.completed_orders.toggle"
                >
                  Completed orders
                  <SortIndicator
                    active={sort.col === "completedOrders"}
                    dir={sort.dir}
                  />
                </button>
              </TableHead>
              <TableHead>Winner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((e, i) => (
              <TableRow
                key={e.id.toString()}
                data-ocid={`admin-leaderboard.row.${i + 1}`}
              >
                <TableCell>#{e.rank.toString()}</TableCell>
                <TableCell className="font-mono text-xs">
                  #{e.sellerId.toString()}
                </TableCell>
                <TableCell className="font-semibold">
                  {e.overallScore.toFixed(1)}
                </TableCell>
                <TableCell>{e.priceScore.toFixed(1)}</TableCell>
                <TableCell>{e.qualityScore.toFixed(1)}</TableCell>
                <TableCell>{e.completedMatchCount.toString()}</TableCell>
                <TableCell>{e.isWinner ? "✓" : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: users, isLoading: loadingUsers } = useAdminUsers();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: fixtures, isLoading: loadingFixtures } = useFixtures();
  const { data: offers, isLoading: loadingOffers } = useAdminAllOffers();
  const { data: intents, isLoading: loadingIntents } = useAdminAllIntents();
  const { data: matches, isLoading: loadingMatches } = useAdminAllMatches();
  const { actor } = useActor();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const approveMutation = useApproveUser();
  const setActiveMutation = useSetUserActive();

  useEffect(() => {
    if (!loadingProfile && profile && profile.role !== AppRole.ADMIN) {
      navigate({ to: "/" });
    }
  }, [profile, loadingProfile, navigate]);

  const productMap = new Map(
    (products || []).map((p) => [p.id.toString(), p.title]),
  );

  const updateFixtureStatus = useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateFixtureStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fixtures"] });
      toast.success("Fixture status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createMatch = useMutation({
    mutationFn: async ({
      intentId,
      offerId,
      price,
      qty,
    }: { intentId: bigint; offerId: bigint; price: number; qty: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createMatch(intentId, offerId, null, price, qty);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-matches"] });
      toast.success("Match created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMatchStatus = useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateMatchStatus(id, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-matches"] });
      toast.success("Match status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (loadingProfile) {
    return (
      <div
        className="container mx-auto px-4 py-12"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Secoinfi Exchange operations
          </p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="users" data-ocid="admin.tab">
            Users ({(users || []).length})
          </TabsTrigger>
          <TabsTrigger value="products" data-ocid="admin.tab">
            Products ({(products || []).length})
          </TabsTrigger>
          <TabsTrigger value="offers" data-ocid="admin.tab">
            Offers ({(offers || []).length})
          </TabsTrigger>
          <TabsTrigger value="fixtures" data-ocid="admin.tab">
            Fixtures ({(fixtures || []).length})
          </TabsTrigger>
          <TabsTrigger value="leaderboard" data-ocid="admin.tab">
            <Trophy className="w-3.5 h-3.5 mr-1" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="intents" data-ocid="admin.tab">
            Intents ({(intents || []).length})
          </TabsTrigger>
          <TabsTrigger value="matches" data-ocid="admin.tab">
            Matches ({(matches || []).length})
          </TabsTrigger>
        </TabsList>

        {/* USERS */}
        <TabsContent value="users">
          {loadingUsers ? (
            <Skeleton className="h-48 w-full" data-ocid="admin.loading_state" />
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Name / Business</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Masked Tag</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(users || []).map((user, i) => (
                    <TableRow
                      key={user.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {user.id.toString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.businessName || user.alias || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {user.maskedTag ? `…${user.maskedTag}` : "—"}
                      </TableCell>
                      <TableCell>
                        {user.isApproved ? (
                          <CheckCircle className="w-4 h-4 text-chart-3" />
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => approveMutation.mutate(user.id)}
                            disabled={approveMutation.isPending}
                            data-ocid={`admin.confirm_button.${i + 1}`}
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={(active) =>
                            setActiveMutation.mutate({
                              userId: user.id,
                              active,
                            })
                          }
                          data-ocid={`admin.switch.${i + 1}`}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatNano(user.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(users || []).length === 0 && (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="admin.empty_state"
                >
                  No users yet.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* PRODUCTS */}
        <TabsContent value="products">
          <div className="flex justify-end mb-4">
            <Button asChild size="sm" data-ocid="admin.primary_button">
              <Link to="/admin/products/new">
                <Plus className="w-4 h-4 mr-1" />
                New Product
              </Link>
            </Button>
          </div>
          {loadingProducts ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(products || []).map((p, i) => (
                    <TableRow
                      key={p.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {p.id.toString()}
                      </TableCell>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {p.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {p.baseSkuCode}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatNano(p.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(products || []).length === 0 && (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="admin.empty_state"
                >
                  No products yet.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* OFFERS */}
        <TabsContent value="offers">
          {loadingOffers ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>MRP</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(offers || []).map((o, i) => (
                    <TableRow
                      key={o.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {o.id.toString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        #{o.sellerId.toString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {productMap.get(o.productId.toString()) ||
                          `#${o.productId.toString()}`}
                      </TableCell>
                      <TableCell className="text-sm line-through text-muted-foreground">
                        {formatCurrency(o.priceMrp)}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(o.priceOffer)}
                      </TableCell>
                      <TableCell>{o.quantityAvailable.toString()}</TableCell>
                      <TableCell>{o.qualityScore.toString()}</TableCell>
                      <TableCell>
                        <Badge variant={o.isActive ? "default" : "secondary"}>
                          {o.isActive ? "Active" : "Off"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(offers || []).length === 0 && (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="admin.empty_state"
                >
                  No offers yet.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* FIXTURES */}
        <TabsContent value="fixtures">
          <div className="flex justify-end mb-4">
            <Button asChild size="sm" data-ocid="admin.primary_button">
              <Link to="/admin/fixtures/new">
                <Plus className="w-4 h-4 mr-1" />
                New Fixture
              </Link>
            </Button>
          </div>
          {loadingFixtures ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(fixtures || []).map((f, i) => (
                    <TableRow
                      key={f.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {f.id.toString()}
                      </TableCell>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell className="text-sm">
                        {productMap.get(f.productId.toString()) ||
                          `#${f.productId.toString()}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            f.status === "LIVE" ? "default" : "secondary"
                          }
                        >
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatNano(f.startsAt)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatNano(f.endsAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {f.status === "PLANNED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() =>
                                updateFixtureStatus.mutate({
                                  id: f.id,
                                  status: "LIVE",
                                })
                              }
                              data-ocid={`admin.primary_button.${i + 1}`}
                            >
                              Go Live
                            </Button>
                          )}
                          {f.status === "LIVE" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() =>
                                updateFixtureStatus.mutate({
                                  id: f.id,
                                  status: "CLOSED",
                                })
                              }
                              data-ocid={`admin.secondary_button.${i + 1}`}
                            >
                              Close
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(fixtures || []).length === 0 && (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="admin.empty_state"
                >
                  No fixtures yet.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* LEADERBOARD */}
        <TabsContent value="leaderboard">
          <AdminLeaderboardEntry />
        </TabsContent>

        {/* INTENTS */}
        <TabsContent value="intents">
          {loadingIntents ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="border border-border/60 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(intents || []).map((intent, i) => (
                    <TableRow
                      key={intent.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {intent.id.toString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        #{intent.buyerId.toString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {productMap.get(intent.productId.toString()) ||
                          `#${intent.productId.toString()}`}
                      </TableCell>
                      <TableCell>
                        {intent.requestedQuantity.toString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{intent.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatNano(intent.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(intents || []).length === 0 && (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="admin.empty_state"
                >
                  No intents yet.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* MATCHES */}
        <TabsContent value="matches">
          <MatchesTab
            matches={matches || []}
            intents={intents || []}
            offers={offers || []}
            loading={loadingMatches}
            onCreateMatch={({ intentId, offerId, price, qty }) =>
              createMatch.mutate({ intentId, offerId, price, qty })
            }
            onStatusUpdate={(id, status) =>
              updateMatchStatus.mutate({ id, status })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MatchesTab({
  matches,
  intents,
  offers,
  loading,
  onCreateMatch,
  onStatusUpdate,
}: {
  matches: import("../backend").Match[];
  intents: import("../backend").BuyerIntent[];
  offers: import("../backend").SellerProductOffer[];
  loading: boolean;
  onCreateMatch: (data: {
    intentId: bigint;
    offerId: bigint;
    price: number;
    qty: bigint;
  }) => void;
  onStatusUpdate: (id: bigint, status: string) => void;
}) {
  const [intentId, setIntentId] = useState("");
  const [offerId, setOfferId] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");

  if (loading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-8">
      <div className="bg-card border border-border/60 rounded-xl p-5 max-w-lg">
        <h3 className="font-semibold mb-4">Create Match</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Intent ID</Label>
              <Select value={intentId} onValueChange={setIntentId}>
                <SelectTrigger className="h-8" data-ocid="admin-match.select">
                  <SelectValue placeholder="Select intent" />
                </SelectTrigger>
                <SelectContent>
                  {intents
                    .filter((i) => i.status === "OPEN")
                    .map((i) => (
                      <SelectItem key={i.id.toString()} value={i.id.toString()}>
                        Intent #{i.id.toString()}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Offer ID</Label>
              <Select value={offerId} onValueChange={setOfferId}>
                <SelectTrigger className="h-8" data-ocid="admin-match.select">
                  <SelectValue placeholder="Select offer" />
                </SelectTrigger>
                <SelectContent>
                  {offers
                    .filter((o) => o.isActive)
                    .map((o) => (
                      <SelectItem key={o.id.toString()} value={o.id.toString()}>
                        Offer #{o.id.toString()}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Agreed Price</Label>
              <Input
                className="h-8"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                data-ocid="admin-match.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Quantity</Label>
              <Input
                className="h-8"
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                data-ocid="admin-match.input"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() =>
              onCreateMatch({
                intentId: BigInt(intentId),
                offerId: BigInt(offerId),
                price: Number.parseFloat(price),
                qty: BigInt(Number.parseInt(qty) || 1),
              })
            }
            disabled={!intentId || !offerId || !price}
            data-ocid="admin-match.submit_button"
          >
            Create Match
          </Button>
        </div>
      </div>

      <div className="border border-border/60 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>ID</TableHead>
              <TableHead>Intent</TableHead>
              <TableHead>Offer</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Settlement</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((m, i) => (
              <TableRow key={m.id.toString()} data-ocid={`admin.row.${i + 1}`}>
                <TableCell className="font-mono text-xs">
                  {m.id.toString()}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  #{m.buyerIntentId.toString()}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  #{m.sellerProductOfferId.toString()}
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  {formatCurrency(m.agreedPrice)}
                </TableCell>
                <TableCell>{m.quantity.toString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{m.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{m.settlementStatus}</Badge>
                </TableCell>
                <TableCell>
                  <Select
                    onValueChange={(status) => onStatusUpdate(m.id, status)}
                  >
                    <SelectTrigger
                      className="h-7 w-28 text-xs"
                      data-ocid={`admin.select.${i + 1}`}
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "PLACED",
                        "SHIPPED",
                        "DELIVERED",
                        "DISPUTED",
                        "REFUNDED",
                      ].map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {matches.length === 0 && (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="admin.empty_state"
          >
            No matches yet.
          </div>
        )}
      </div>
    </div>
  );
}
