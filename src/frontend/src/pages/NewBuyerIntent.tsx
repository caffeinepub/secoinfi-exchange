import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { AlertTriangle, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useProducts } from "../hooks/useQueries";
import { getOrCreateSessionId } from "../utils/session";

export default function NewBuyerIntent() {
  const { actor } = useActor();
  const { data: products } = useProducts();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const search = useSearch({ from: "/buyer/intents/new" }) as {
    productId?: string;
  };

  const [productId, setProductId] = useState(search.productId || "");
  const [quantity, setQuantity] = useState("1");
  const [constraints, setConstraints] = useState(
    JSON.stringify(
      { minQualityScore: 70, maxDeliveryDays: 7, maxPrice: null },
      null,
      2,
    ),
  );

  // Load profile to check buyerActivated
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => actor!.getMyProfile(),
    enabled: !!actor,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      if (!productId) throw new Error("Select a product");
      const sessionId = getOrCreateSessionId();
      let constraintsStr = constraints.trim();
      try {
        JSON.parse(constraintsStr);
      } catch {
        constraintsStr = "{}";
      }
      return actor.createBuyerIntent(
        BigInt(productId),
        BigInt(Number.parseInt(quantity) || 1),
        constraintsStr,
        sessionId,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-intents"] });
      toast.success("Intent created!");
      navigate({ to: "/buyer/dashboard" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (profileLoading) {
    return (
      <div
        className="container mx-auto px-4 py-16 max-w-lg flex justify-center"
        data-ocid="intent.loading_state"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Gate: buyer must be activated
  const isActivated = profile?.buyerActivated === true;
  if (profile && !isActivated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <Alert
          variant="destructive"
          data-ocid="intent.activation_required.error_state"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Account not activated</AlertTitle>
          <AlertDescription>
            You need to complete the mock UPI payment step before creating
            intents. Go to{" "}
            <a
              href="/register/buyer"
              className="underline font-medium"
              data-ocid="intent.activation_required.link"
            >
              Buyer Registration
            </a>{" "}
            and click “Mark as Paid” to activate your account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <div className="mb-8">
        <Zap className="w-10 h-10 text-primary mb-3" />
        <h1 className="text-3xl font-bold">Request Best Deal</h1>
        <p className="text-muted-foreground mt-2">
          Submit your requirements and let sellers compete to serve you
          anonymously.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label>
              Product <span className="text-destructive">*</span>
            </Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger data-ocid="intent.select">
                <SelectValue placeholder="Select a product" />
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

          <div className="space-y-2">
            <Label htmlFor="qty">
              Quantity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="qty"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              data-ocid="intent.input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="constraints">Constraints (JSON)</Label>
            <Textarea
              id="constraints"
              rows={5}
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              className="font-mono text-sm"
              data-ocid="intent.textarea"
            />
            <p className="text-xs text-muted-foreground">
              Optionally specify max price, min quality score, max delivery
              days, etc.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !productId}
            data-ocid="intent.submit_button"
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {mutation.isPending ? "Submitting…" : "Submit Intent"}
          </Button>
          {mutation.isError && (
            <p
              className="text-sm text-destructive"
              data-ocid="intent.error_state"
            >
              {(mutation.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
