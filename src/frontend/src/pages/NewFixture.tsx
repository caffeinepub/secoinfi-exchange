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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Swords } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useProducts } from "../hooks/useQueries";
import { toNano } from "../utils/session";

export default function NewFixture() {
  const { actor } = useActor();
  const { data: products } = useProducts();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [groupA, setGroupA] = useState("");
  const [groupB, setGroupB] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [formula, setFormula] = useState("v1");

  const parseIds = (str: string): bigint[] =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => BigInt(s));

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      if (!productId || !name.trim() || !startsAt || !endsAt)
        throw new Error("Fill all required fields");
      return actor.createFixture(
        name.trim(),
        BigInt(productId),
        parseIds(groupA),
        parseIds(groupB),
        toNano(startsAt),
        toNano(endsAt),
        formula.trim(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fixtures"] });
      toast.success("Fixture created!");
      navigate({ to: "/admin" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <div className="mb-8">
        <Swords className="w-10 h-10 text-primary mb-3" />
        <h1 className="text-3xl font-bold">Create Fixture</h1>
        <p className="text-muted-foreground mt-2">
          Set up a competition round for sellers to compete.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fname">
              Fixture Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q1 Electronics Round 1"
              data-ocid="fixture.input"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Product <span className="text-destructive">*</span>
            </Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger data-ocid="fixture.select">
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

          <div className="space-y-2">
            <Label htmlFor="groupA">Group A Seller IDs (comma-separated)</Label>
            <Input
              id="groupA"
              value={groupA}
              onChange={(e) => setGroupA(e.target.value)}
              placeholder="1, 2, 3"
              data-ocid="fixture.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groupB">Group B Seller IDs (comma-separated)</Label>
            <Input
              id="groupB"
              value={groupB}
              onChange={(e) => setGroupB(e.target.value)}
              placeholder="4, 5, 6"
              data-ocid="fixture.input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">
                Starts At <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                data-ocid="fixture.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">
                Ends At <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                data-ocid="fixture.input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formula">Scoring Formula Version</Label>
            <Input
              id="formula"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="v1"
              data-ocid="fixture.input"
            />
          </div>

          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending ||
              !name.trim() ||
              !productId ||
              !startsAt ||
              !endsAt
            }
            data-ocid="fixture.submit_button"
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {mutation.isPending ? "Creating…" : "Create Fixture"}
          </Button>
          {mutation.isError && (
            <p
              className="text-sm text-destructive"
              data-ocid="fixture.error_state"
            >
              {(mutation.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
