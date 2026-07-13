// import { useState, useEffect } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { z } from "zod";
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/hooks/useAuth";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { toast } from "sonner";
// import { Loader2, Sparkles } from "lucide-react";
// import SEOHead from "@/components/SEOHead";

// const signUpSchema = z.object({
//   fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
//   email: z.string().trim().email("Invalid email").max(255),
//   password: z.string().min(8, "Password must be at least 8 characters").max(72),
// });

// const signInSchema = z.object({
//   email: z.string().trim().email("Invalid email").max(255),
//   password: z.string().min(1, "Password required").max(72),
// });

// const Auth = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user, loading } = useAuth();
//   const from = (location.state as any)?.from || "/dashboard";

//   const [tab, setTab] = useState<"signin" | "signup">("signin");
//   const [submitting, setSubmitting] = useState(false);
//   const [form, setForm] = useState({ fullName: "", email: "", password: "" });

//   useEffect(() => {
//     if (!loading && user) navigate(from, { replace: true });
//   }, [user, loading, from, navigate]);

//   const handleSignUp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const result = signUpSchema.safeParse(form);
//     if (!result.success) {
//       toast.error(result.error.errors[0].message);
//       return;
//     }
//     setSubmitting(true);
//     const { error } = await supabase.auth.signUp({
//       email: result.data.email,
//       password: result.data.password,
//       options: {
//         emailRedirectTo: `${window.location.origin}/dashboard`,
//         data: { full_name: result.data.fullName },
//       },
//     });
//     setSubmitting(false);
//     if (error) {
//       toast.error(error.message);
//       return;
//     }
//     toast.success("Account created! Welcome to Ankshaastra.");
//     navigate(from, { replace: true });
//   };

//   const handleSignIn = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const result = signInSchema.safeParse({ email: form.email, password: form.password });
//     if (!result.success) {
//       toast.error(result.error.errors[0].message);
//       return;
//     }
//     setSubmitting(true);
//     const { error } = await supabase.auth.signInWithPassword(result.data);
//     setSubmitting(false);
//     if (error) {
//       toast.error(error.message === "Invalid login credentials" ? "Wrong email or password" : error.message);
//       return;
//     }
//     toast.success("Welcome back!");
//     navigate(from, { replace: true });
//   };

//   return (
//     <>
//       <SEOHead title="Sign In or Sign Up | Ankshaastra" description="Access your Ankshaastra dashboard, orders, invoices and reports." />
//       <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
//         <div className="w-full max-w-md">
//           <Link to="/" className="flex items-center justify-center gap-2 mb-6 text-primary hover:opacity-80">
//             <Sparkles className="w-5 h-5" />
//             <span className="font-display text-2xl font-bold">Ankshaastra</span>
//           </Link>
//           <Card className="border-border/60 shadow-xl">
//             <CardHeader className="text-center">
//               <CardTitle className="font-display text-3xl">Welcome</CardTitle>
//               <CardDescription>Sign in or create an account to continue</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
//                 <TabsList className="grid w-full grid-cols-2 mb-6">
//                   <TabsTrigger value="signin">Sign In</TabsTrigger>
//                   <TabsTrigger value="signup">Sign Up</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="signin">
//                   <form onSubmit={handleSignIn} className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="email-in">Email</Label>
//                       <Input id="email-in" type="email" required value={form.email}
//                         onChange={(e) => setForm({ ...form, email: e.target.value })} />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="pw-in">Password</Label>
//                       <Input id="pw-in" type="password" required value={form.password}
//                         onChange={(e) => setForm({ ...form, password: e.target.value })} />
//                     </div>
//                     <Button type="submit" className="w-full" disabled={submitting}>
//                       {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                       Sign In
//                     </Button>
//                   </form>
//                 </TabsContent>

//                 <TabsContent value="signup">
//                   <form onSubmit={handleSignUp} className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="name-up">Full Name</Label>
//                       <Input id="name-up" required value={form.fullName}
//                         onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="email-up">Email</Label>
//                       <Input id="email-up" type="email" required value={form.email}
//                         onChange={(e) => setForm({ ...form, email: e.target.value })} />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="pw-up">Password</Label>
//                       <Input id="pw-up" type="password" required value={form.password}
//                         onChange={(e) => setForm({ ...form, password: e.target.value })} />
//                       <p className="text-xs text-muted-foreground">Min 8 characters. Checked against leaked-password database.</p>
//                     </div>
//                     <Button type="submit" className="w-full" disabled={submitting}>
//                       {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                       Create Account
//                     </Button>
//                   </form>
//                 </TabsContent>
//               </Tabs>
//             </CardContent>
//           </Card>
//           <p className="text-center text-xs text-muted-foreground mt-6">
//             By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> & <Link to="/privacy" className="underline">Privacy Policy</Link>.
//           </p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Auth;

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(1, "Password required").max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const from = (location.state as any)?.from || "/dashboard";

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, from, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signUpSchema.safeParse(form);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: result.data.fullName },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created! Welcome to Ankshaastra.");
    navigate(from, { replace: true });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signInSchema.safeParse({ email: form.email, password: form.password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(result.data);
    setSubmitting(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Wrong email or password" : error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate(from, { replace: true });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSendingReset(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Reset link sent! Check your email.");
    setShowForgot(false);
  };

  return (
    <>
      <SEOHead title="Sign In or Sign Up | Ankshaastra" description="Access your Ankshaastra dashboard, orders, invoices and reports." />
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-6 text-primary hover:opacity-80">
            <Sparkles className="w-5 h-5" />
            <span className="font-display text-2xl font-bold">Ankshaastra</span>
          </Link>
          <Card className="border-border/60 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-3xl">Welcome</CardTitle>
              <CardDescription>Sign in or create an account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-in">Email</Label>
                      <Input id="email-in" type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pw-in">Password</Label>
                      <Input id="pw-in" type="password" required value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })} />
                      <button
                        type="button"
                        onClick={() => { setForgotEmail(form.email); setShowForgot(true); }}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Sign In
                    </Button>
                  </form>

                  {showForgot && (
                    <form onSubmit={handleForgotPassword} className="mt-4 space-y-3 border-t border-border pt-4">
                      <Label htmlFor="forgot-email">Enter your email to receive a reset link</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={sendingReset}>
                          {sendingReset && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Send Reset Link
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setShowForgot(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name-up">Full Name</Label>
                      <Input id="name-up" required value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-up">Email</Label>
                      <Input id="email-up" type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pw-up">Password</Label>
                      <Input id="pw-up" type="password" required value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })} />
                      <p className="text-xs text-muted-foreground">Min 8 characters. Checked against leaked-password database.</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> & <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </>
  );
};

export default Auth;