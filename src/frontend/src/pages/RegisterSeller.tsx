import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Loader2, Lock, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { getOrCreateSessionId } from "../utils/session";

export default function RegisterSeller() {
  const { actor } = useActor();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const sessionId = getOrCreateSessionId();
      return actor.registerSeller(businessName.trim(), email.trim(), sessionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      setDone(true);
      toast.success("Seller registration submitted!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center max-w-md">
        <Lock className="w-12 h-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-3">Connect your identity first</h1>
        <p className="text-muted-foreground mb-6">
          Please connect with Internet Identity before registering as a seller.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          size="lg"
          data-ocid="seller-register.primary_button"
        >
          {isLoggingIn ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {isLoggingIn ? "Connecting…" : "Connect Identity"}
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center max-w-lg">
        <CheckCircle className="w-14 h-14 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Application Submitted!</h1>
        <p className="text-muted-foreground mb-6">
          Your seller application is pending admin approval. You'll be able to
          create offers once an admin approves your account.
        </p>
        <div className="bg-card border border-border/60 rounded-xl p-4 text-sm text-muted-foreground mb-8 w-full">
          <strong className="text-foreground">What happens next:</strong>
          <ol className="mt-2 list-decimal list-inside space-y-1 text-left">
            <li>Admin reviews your business details</li>
            <li>Upon approval, you can add product offers</li>
            <li>Your offers compete in Fixtures for buyer orders</li>
          </ol>
        </div>
        <Button
          onClick={() => navigate({ to: "/" })}
          variant="outline"
          data-ocid="seller-register.secondary_button"
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="mb-8">
        <Store className="w-10 h-10 text-primary mb-3" />
        <h1 className="text-3xl font-bold">Seller Onboarding</h1>
        <p className="text-muted-foreground mt-2">
          Join the exchange and start competing for buyer orders through
          structured fixtures.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="biz">
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="biz"
              placeholder="Your business or brand name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              data-ocid="seller-register.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Business Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@yourbusiness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-ocid="seller-register.input"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => mutation.mutate()}
            disabled={
              mutation.isPending || !businessName.trim() || !email.trim()
            }
            data-ocid="seller-register.submit_button"
          >
            {mutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {mutation.isPending ? "Submitting…" : "Submit Application"}
          </Button>
          {mutation.isError && (
            <p
              className="text-sm text-destructive"
              data-ocid="seller-register.error_state"
            >
              {(mutation.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
