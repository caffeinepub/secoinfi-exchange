import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Loader2, Lock, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { getOrCreateSessionId } from "../utils/session";

export default function RegisterBuyer() {
  const { actor } = useActor();
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [alias, setAlias] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [registered, setRegistered] = useState<{
    maskedTag: string;
    nonceSuffix: string;
  } | null>(null);
  const [activated, setActivated] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      if (!/^\d{10}$/.test(mobile.trim())) {
        throw new Error("Mobile must be exactly 10 digits");
      }
      const sessionId = getOrCreateSessionId();
      return actor.registerBuyer(
        alias.trim() || null,
        mobile.trim(),
        sessionId,
      );
    },
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      const tag = (user.maskedTag as string | undefined | null) ?? "????";
      setRegistered({
        maskedTag: tag,
        nonceSuffix: "reg1",
      });
      toast.success("Registration successful!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const activateMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const sessionId = getOrCreateSessionId();
      return actor.markBuyerActivated(sessionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      setActivated(true);
      toast.success("Payment confirmed! Account activated.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center max-w-md">
        <Lock className="w-12 h-12 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-3">Connect your identity first</h1>
        <p className="text-muted-foreground mb-6">
          You need to connect with Internet Identity before registering as a
          buyer.
        </p>
        <Button
          onClick={login}
          disabled={isLoggingIn}
          size="lg"
          data-ocid="register.primary_button"
        >
          {isLoggingIn ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {isLoggingIn ? "Connecting…" : "Connect Identity"}
        </Button>
      </div>
    );
  }

  if (registered) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center max-w-lg">
        <CheckCircle className="w-14 h-14 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-2">Welcome to Secoinfi!</h1>
        <p className="text-muted-foreground mb-6">
          Your buyer account has been created. Your anonymous identity tag:
        </p>

        {/* Masked tag display */}
        <div
          className="flex items-center gap-3 bg-card border border-primary/30 rounded-xl px-6 py-4 mb-8"
          data-ocid="register.masked_tag.card"
        >
          <span className="text-muted-foreground text-sm">Masked Tag:</span>
          <Badge className="font-mono text-base bg-primary/10 text-primary border-primary/30">
            …{registered.maskedTag}
          </Badge>
          <span className="text-xs text-muted-foreground">
            (your anonymous buyer ID)
          </span>
        </div>

        {!activated ? (
          <Card
            className="w-full mb-6 border-accent/30"
            data-ocid="register.activation.card"
          >
            <CardHeader>
              <CardTitle className="text-lg text-accent">
                Activate Your Waitlist Entry
              </CardTitle>
              <CardDescription>
                To activate your buyer waitlist, pay the arbitrage fee to UPI ID{" "}
                <strong className="text-foreground font-mono">
                  secoin@uboi
                </strong>{" "}
                and then click ‘Mark as Paid’.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono">
                UPI ID: <strong className="text-foreground">secoin@uboi</strong>
              </div>
              <p className="text-xs text-muted-foreground">
                Once you have paid, click below to confirm. (Real UPI
                integration coming soon.)
              </p>
              <Button
                onClick={() => activateMutation.mutate()}
                disabled={activateMutation.isPending}
                className="w-full"
                data-ocid="register.confirm_button"
              >
                {activateMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {activateMutation.isPending ? "Confirming…" : "Mark as Paid"}
              </Button>
              {activateMutation.isError && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="register.activation.error_state"
                >
                  {(activateMutation.error as Error).message}
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div
            className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 text-primary text-sm"
            data-ocid="register.activation.success_state"
          >
            ✓ Payment confirmed. Your account is now active and eligible for
            matching!
          </div>
        )}

        <Button
          onClick={() => navigate({ to: "/products" })}
          variant="outline"
          data-ocid="register.secondary_button"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="mb-8">
        <UserPlus className="w-10 h-10 text-primary mb-3" />
        <h1 className="text-3xl font-bold">Register as Buyer</h1>
        <p className="text-muted-foreground mt-2">
          Your mobile number is stored securely and never shared with sellers.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="alias">
              Display Name{" "}
              <span className="text-muted-foreground text-xs">
                (optional alias)
              </span>
            </Label>
            <Input
              id="alias"
              placeholder="How should we call you?"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              data-ocid="register.alias.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              maxLength={10}
              data-ocid="register.mobile.input"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" /> Encrypted &amp; never visible to
              sellers
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">
              City{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="city"
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              data-ocid="register.city.input"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => registerMutation.mutate()}
            disabled={registerMutation.isPending || !mobile.trim()}
            data-ocid="register.submit_button"
          >
            {registerMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {registerMutation.isPending
              ? "Creating account…"
              : "Create Buyer Account"}
          </Button>
          {registerMutation.isError && (
            <p
              className="text-sm text-destructive"
              data-ocid="register.error_state"
            >
              {(registerMutation.error as Error).message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
