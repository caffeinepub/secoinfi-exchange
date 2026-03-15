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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useProducts } from "../hooks/useQueries";

export default function NewOffer() {
  const { actor } = useActor();
  const { data: products } = useProducts();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [productId, setProductId] = useState("");
  const [priceMrp, setPriceMrp] = useState("");
  const [priceOffer, setPriceOffer] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [quality, setQuality] = useState("80");
  const [service, setService] = useState("80");
  const [warranty, setWarranty] = useState("12");
  const [shipping, setShipping] = useState("3");
  const [terms, setTerms] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      if (!productId) throw new Error("Select a product");
      return actor.createOffer(
        BigInt(productId),
        Number.parseFloat(priceMrp),
        Number.parseFloat(priceOffer),
        BigInt(Number.parseInt(quantity) || 1),
        BigInt(Number.parseInt(quality) || 0),
        BigInt(Number.parseInt(service) || 0),
        BigInt(Number.parseInt(warranty) || 0),
        BigInt(Number.parseInt(shipping) || 1),
        terms.trim(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-offers"] });
      toast.success("Offer created!");
      navigate({ to: "/seller/dashboard" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <div className="mb-8">
        <Tag className="w-10 h-10 text-primary mb-3" />
        <h1 className="text-3xl font-bold">Create Offer</h1>
        <p className="text-muted-foreground mt-2">
          Set your best price and terms to compete in fixtures.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label>
              Product <span className="text-destructive">*</span>
            </Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger data-ocid="offer.select">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mrp">
                MRP (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mrp"
                type="number"
                step="0.01"
                value={priceMrp}
                onChange={(e) => setPriceMrp(e.target.value)}
                data-ocid="offer.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offer">
                Offer Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="offer"
                type="number"
                step="0.01"
                value={priceOffer}
                onChange={(e) => setPriceOffer(e.target.value)}
                data-ocid="offer.input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                data-ocid="offer.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping">Shipping Days</Label>
              <Input
                id="shipping"
                type="number"
                min="1"
                value={shipping}
                onChange={(e) => setShipping(e.target.value)}
                data-ocid="offer.input"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quality">Quality (0–100)</Label>
              <Input
                id="quality"
                type="number"
                min="0"
                max="100"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                data-ocid="offer.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Service (0–100)</Label>
              <Input
                id="service"
                type="number"
                min="0"
                max="100"
                value={service}
                onChange={(e) => setService(e.target.value)}
                data-ocid="offer.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty">Warranty (mo)</Label>
              <Input
                id="warranty"
                type="number"
                min="0"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                data-ocid="offer.input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms Summary</Label>
            <Textarea
              id="terms"
              rows={3}
              placeholder="Return policy, delivery guarantees, etc."
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              data-ocid="offer.textarea"
            />
          </div>

          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending || !productId || !priceMrp || !priceOffer
            }
            data-ocid="offer.submit_button"
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {mutation.isPending ? "Creating…" : "Create Offer"}
          </Button>
          {mutation.isError && (
            <p
              className="text-sm text-destructive"
              data-ocid="offer.error_state"
            >
              {(mutation.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
