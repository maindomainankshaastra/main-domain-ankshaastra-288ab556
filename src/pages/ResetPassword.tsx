import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase automatically exchanges the recovery token in the URL
  // for a session. We just wait for that PASSWORD_RECOVERY event.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Fallback: agar already session hai (link se aa chuka hai)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated! Please sign in.");
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <>
      <SEOHead title="Reset Password | Ankshaastra" description="Set a new password for your account." />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6 text-primary hover:opacity-80">
            <Sparkles className="w-5 h-5" />
            <span className="font-display text-2xl font-bold">Ankshaastra</span>
          </Link>
          <Card className="border-border/60 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-3xl">Reset Password</CardTitle>
              <CardDescription>
                {ready ? "Enter your new password below" : "Verifying your reset link..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ready ? (
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-pw">New Password</Label>
                    <Input
                      id="new-pw"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pw">Confirm Password</Label>
                    <Input
                      id="confirm-pw"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </form>
              ) : (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;