import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Search, UserCog, Trash2 } from "lucide-react";
import { ADMIN_MODULES } from "@/lib/admin-modules";

interface FoundUser {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

interface StaffMember {
  user_id: string;
  full_name: string | null;
  email: string | null;
  modules: string[];
}

const TeamManagementModule = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  const loadStaffList = async () => {
    setLoadingStaff(true);
    const { data: staffRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "staff");

    if (!staffRoles || staffRoles.length === 0) {
      setStaffList([]);
      setLoadingStaff(false);
      return;
    }

    const userIds = staffRoles.map((r) => r.user_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .in("user_id", userIds);

    const { data: perms } = await supabase
      .from("admin_module_permissions")
      .select("user_id, module")
      .in("user_id", userIds)
      .eq("can_view", true);

    const list: StaffMember[] = userIds.map((id) => {
      const profile = profiles?.find((p) => p.user_id === id);
      const modules = perms?.filter((p) => p.user_id === id).map((p) => p.module) || [];
      return {
        user_id: id,
        full_name: profile?.full_name || null,
        email: profile?.email || null,
        modules,
      };
    });

    setStaffList(list);
    setLoadingStaff(false);
  };

  useEffect(() => {
    loadStaffList();
  }, []);

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast.error("Enter an email to search");
      return;
    }
    setSearching(true);
    setFoundUser(null);
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, email")
      .ilike("email", searchEmail.trim())
      .maybeSingle();
    setSearching(false);

    if (error || !data) {
      toast.error("No user found with this email. They must sign up first at /auth.");
      return;
    }
    setFoundUser(data);
    setSelectedModules([]);
  };

  const toggleModule = (moduleKey: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleKey) ? prev.filter((m) => m !== moduleKey) : [...prev, moduleKey]
    );
  };

  const handleAssignStaff = async () => {
    if (!foundUser) return;
    if (selectedModules.length === 0) {
      toast.error("Select at least one module for this staff member");
      return;
    }
    setSaving(true);

    // 1. Role ko 'staff' set karo (agar already koi role hai to update, warna insert)
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", foundUser.user_id)
      .maybeSingle();

    if (existingRole) {
      await supabase.from("user_roles").update({ role: "staff" }).eq("user_id", foundUser.user_id);
    } else {
      await supabase.from("user_roles").insert({ user_id: foundUser.user_id, role: "staff" });
    }

    // 2. Purani permissions clear karo, nayi insert karo
    await supabase.from("admin_module_permissions").delete().eq("user_id", foundUser.user_id);

    const rows = selectedModules.map((module) => ({
      user_id: foundUser.user_id,
      module,
      can_view: true,
      can_edit: true,
    }));
    const { error } = await supabase.from("admin_module_permissions").insert(rows);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`${foundUser.email} is now a staff member with limited access`);
    setFoundUser(null);
    setSearchEmail("");
    setSelectedModules([]);
    loadStaffList();
  };

  const handleRemoveStaff = async (userId: string) => {
    if (!confirm("Remove staff access for this user? They will no longer be able to access the admin panel.")) return;

    await supabase.from("admin_module_permissions").delete().eq("user_id", userId);
    await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "staff");

    toast.success("Staff access removed");
    loadStaffList();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Add Team Member
          </CardTitle>
          <CardDescription>
            Search a registered user by email, then choose which sections they can access.
            The user must have signed up already at /auth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 max-w-md">
            <Input
              placeholder="user@example.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {foundUser && (
            <div className="border border-border rounded-lg p-4 space-y-4">
              <div>
                <p className="font-semibold">{foundUser.full_name || "No name set"}</p>
                <p className="text-sm text-muted-foreground">{foundUser.email}</p>
              </div>

              <div>
                <Label className="mb-2 block">Select allowed sections</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ADMIN_MODULES.map((mod) => (
                    <label key={mod.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedModules.includes(mod.key)}
                        onCheckedChange={() => toggleModule(mod.key)}
                      />
                      {mod.label}
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={handleAssignStaff} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Make Staff with Selected Access
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Staff Members</CardTitle>
          <CardDescription>Users with limited admin panel access.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingStaff ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : staffList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No staff members yet.</p>
          ) : (
            <div className="space-y-3">
              {staffList.map((s) => (
                <div key={s.user_id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold">{s.full_name || "No name set"}</p>
                    <p className="text-sm text-muted-foreground mb-2">{s.email}</p>
                    <div className="flex flex-wrap gap-1">
                      {s.modules.length === 0 ? (
                        <Badge variant="secondary">No modules assigned</Badge>
                      ) : (
                        s.modules.map((m) => (
                          <Badge key={m} variant="outline" className="text-xs">
                            {ADMIN_MODULES.find((am) => am.key === m)?.label || m}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveStaff(s.user_id)}>
                    <Trash2 className="w-4 h-4 mr-1 text-destructive" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagementModule;