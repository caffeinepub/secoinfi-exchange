import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function NewProduct() {
  const { actor } = useActor();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [sku, setSku] = useState("");
  const [attributes, setAttributes] = useState("{}");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      let attrsStr = attributes.trim();
      try {
        JSON.parse(attrsStr);
      } catch {
        attrsStr = "{}";
      }
      return actor.createProduct(
        title.trim(),
        description.trim(),
        category.trim(),
        sku.trim(),
        attrsStr,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created!");
      navigate({ to: "/admin" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <div className="mb-8">
        <Package className="w-10 h-10 text-primary mb-3" />
        <h1 className="text-3xl font-bold">New Product</h1>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product name"
              data-ocid="product.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product…"
              data-ocid="product.textarea"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cat">
                Category <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Electronics"
                data-ocid="product.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">
                Base SKU <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU-001"
                data-ocid="product.input"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="attrs">Attributes (JSON)</Label>
            <Textarea
              id="attrs"
              rows={3}
              value={attributes}
              onChange={(e) => setAttributes(e.target.value)}
              className="font-mono text-sm"
              placeholder='{"brand": "Acme", "color": "black"}'
              data-ocid="product.textarea"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending ||
              !title.trim() ||
              !category.trim() ||
              !sku.trim()
            }
            data-ocid="product.submit_button"
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {mutation.isPending ? "Creating…" : "Create Product"}
          </Button>
          {mutation.isError && (
            <p
              className="text-sm text-destructive"
              data-ocid="product.error_state"
            >
              {(mutation.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
