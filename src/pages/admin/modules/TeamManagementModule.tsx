// import { useEffect, useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";
// import { Loader2, Search, UserCog, Trash2 } from "lucide-react";
// import { ADMIN_MODULES } from "@/lib/admin-modules";

// interface FoundUser {
//   user_id: string;
//   full_name: string | null;
//   email: string | null;
// }

// interface StaffMember {
//   user_id: string;
//   full_name: string | null;
//   email: string | null;
//   modules: string[];
// }

// const TeamManagementModule = () => {
//   const [searchEmail, setSearchEmail] = useState("");
//   const [searching, setSearching] = useState(false);
//   const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
//   const [selectedModules, setSelectedModules] = useState<string[]>([]);
//   const [saving, setSaving] = useState(false);

//   const [staffList, setStaffList] = useState<StaffMember[]>([]);
//   const [loadingStaff, setLoadingStaff] = useState(true);

//   const loadStaffList = async () => {
//     setLoadingStaff(true);
//     const { data: staffRoles } = await supabase
//       .from("user_roles")
//       .select("user_id")
//       .eq("role", "staff");

//     if (!staffRoles || staffRoles.length === 0) {
//       setStaffList([]);
//       setLoadingStaff(false);
//       return;
//     }

//     const userIds = staffRoles.map((r) => r.user_id);

//     const { data: profiles } = await supabase
//       .from("profiles")
//       .select("user_id, full_name, email")
//       .in("user_id", userIds);

//     const { data: perms } = await supabase
//       .from("admin_module_permissions")
//       .select("user_id, module")
//       .in("user_id", userIds)
//       .eq("can_view", true);

//     const list: StaffMember[] = userIds.map((id) => {
//       const profile = profiles?.find((p) => p.user_id === id);
//       const modules = perms?.filter((p) => p.user_id === id).map((p) => p.module) || [];
//       return {
//         user_id: id,
//         full_name: profile?.full_name || null,
//         email: profile?.email || null,
//         modules,
//       };
//     });

//     setStaffList(list);
//     setLoadingStaff(false);
//   };

//   useEffect(() => {
//     loadStaffList();
//   }, []);

//   const handleSearch = async () => {
//     if (!searchEmail.trim()) {
//       toast.error("Enter an email to search");
//       return;
//     }
//     setSearching(true);
//     setFoundUser(null);
//     const { data, error } = await supabase
//       .from("profiles")
//       .select("user_id, full_name, email")
//       .ilike("email", searchEmail.trim())
//       .maybeSingle();
//     setSearching(false);

//     if (error || !data) {
//       toast.error("No user found with this email. They must sign up first at /auth.");
//       return;
//     }
//     setFoundUser(data);
//     setSelectedModules([]);
//   };

//   const toggleModule = (moduleKey: string) => {
//     setSelectedModules((prev) =>
//       prev.includes(moduleKey) ? prev.filter((m) => m !== moduleKey) : [...prev, moduleKey]
//     );
//   };

//   const handleAssignStaff = async () => {
//     if (!foundUser) return;
//     if (selectedModules.length === 0) {
//       toast.error("Select at least one module for this staff member");
//       return;
//     }
//     setSaving(true);

//     // 1. Role ko 'staff' set karo (agar already koi role hai to update, warna insert)
//     const { data: existingRole } = await supabase
//       .from("user_roles")
//       .select("id")
//       .eq("user_id", foundUser.user_id)
//       .maybeSingle();

//     if (existingRole) {
//       await supabase.from("user_roles").update({ role: "staff" }).eq("user_id", foundUser.user_id);
//     } else {
//       await supabase.from("user_roles").insert({ user_id: foundUser.user_id, role: "staff" });
//     }

//     // 2. Purani permissions clear karo, nayi insert karo
//     await supabase.from("admin_module_permissions").delete().eq("user_id", foundUser.user_id);

//     const rows = selectedModules.map((module) => ({
//       user_id: foundUser.user_id,
//       module,
//       can_view: true,
//       can_edit: true,
//     }));
//     const { error } = await supabase.from("admin_module_permissions").insert(rows);

//     setSaving(false);

//     if (error) {
//       toast.error(error.message);
//       return;
//     }

//     toast.success(`${foundUser.email} is now a staff member with limited access`);
//     setFoundUser(null);
//     setSearchEmail("");
//     setSelectedModules([]);
//     loadStaffList();
//   };

//   const handleRemoveStaff = async (userId: string) => {
//     if (!confirm("Remove staff access for this user? They will no longer be able to access the admin panel.")) return;

//     await supabase.from("admin_module_permissions").delete().eq("user_id", userId);
//     await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "staff");

//     toast.success("Staff access removed");
//     loadStaffList();
//   };

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <UserCog className="w-5 h-5 text-primary" />
//             Add Team Member
//           </CardTitle>
//           <CardDescription>
//             Search a registered user by email, then choose which sections they can access.
//             The user must have signed up already at /auth.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex gap-2 max-w-md">
//             <Input
//               placeholder="user@example.com"
//               value={searchEmail}
//               onChange={(e) => setSearchEmail(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//             />
//             <Button onClick={handleSearch} disabled={searching}>
//               {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
//             </Button>
//           </div>

//           {foundUser && (
//             <div className="border border-border rounded-lg p-4 space-y-4">
//               <div>
//                 <p className="font-semibold">{foundUser.full_name || "No name set"}</p>
//                 <p className="text-sm text-muted-foreground">{foundUser.email}</p>
//               </div>

//               <div>
//                 <Label className="mb-2 block">Select allowed sections</Label>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                   {ADMIN_MODULES.map((mod) => (
//                     <label key={mod.key} className="flex items-center gap-2 text-sm cursor-pointer">
//                       <Checkbox
//                         checked={selectedModules.includes(mod.key)}
//                         onCheckedChange={() => toggleModule(mod.key)}
//                       />
//                       {mod.label}
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <Button onClick={handleAssignStaff} disabled={saving}>
//                 {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                 Make Staff with Selected Access
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Current Staff Members</CardTitle>
//           <CardDescription>Users with limited admin panel access.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {loadingStaff ? (
//             <Loader2 className="w-6 h-6 animate-spin text-primary" />
//           ) : staffList.length === 0 ? (
//             <p className="text-sm text-muted-foreground py-4 text-center">No staff members yet.</p>
//           ) : (
//             <div className="space-y-3">
//               {staffList.map((s) => (
//                 <div key={s.user_id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-4 flex-wrap">
//                   <div>
//                     <p className="font-semibold">{s.full_name || "No name set"}</p>
//                     <p className="text-sm text-muted-foreground mb-2">{s.email}</p>
//                     <div className="flex flex-wrap gap-1">
//                       {s.modules.length === 0 ? (
//                         <Badge variant="secondary">No modules assigned</Badge>
//                       ) : (
//                         s.modules.map((m) => (
//                           <Badge key={m} variant="outline" className="text-xs">
//                             {ADMIN_MODULES.find((am) => am.key === m)?.label || m}
//                           </Badge>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                   <Button variant="outline" size="sm" onClick={() => handleRemoveStaff(s.user_id)}>
//                     <Trash2 className="w-4 h-4 mr-1 text-destructive" />
//                     Remove
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default TeamManagementModule;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Search, UserCog, Trash2, Pencil, ShieldCheck } from "lucide-react";
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

// ------------------------------------------------------------------
// Role presets — map each predefined role to recommended module keys.
// Keys must match ADMIN_MODULES exactly (source of truth for what a
// "module" is in this system).
// ------------------------------------------------------------------

const ALL_MODULE_KEYS = ADMIN_MODULES.map((m) => m.key);

type RolePreset = {
  key: string;
  label: string;
  description: string;
  modules: string[];
};

const ROLE_PRESETS: RolePreset[] = [
  {
    key: "super-admin",
    label: "Super Admin",
    description: "Full access to every module.",
    modules: ALL_MODULE_KEYS,
  },
  {
    key: "admin",
    label: "Admin",
    description: "Full operational access, excluding GST maintenance tools.",
    modules: ALL_MODULE_KEYS.filter((k) => k !== "gst-maintenance"),
  },
  {
    key: "finance",
    label: "Finance",
    description: "Orders, invoices, pricing, and GST modules.",
    modules: ["orders", "invoices", "pricing", "settings", "gst-reports", "gst-maintenance"],
  },
  {
    key: "support",
    label: "Support",
    description: "Order handling and customer communication.",
    modules: ["orders", "email", "crm"],
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "CRM, content, and campaign-facing modules.",
    modules: ["crm", "templates", "email", "service-pages"],
  },
];

// Returns the preset key whose module set exactly matches the given
// modules, or null if the current selection doesn't match any preset
// (i.e. it's a custom mix).
function matchPreset(modules: string[]): string | null {
  const sorted = [...modules].sort().join(",");
  const found = ROLE_PRESETS.find((p) => [...p.modules].sort().join(",") === sorted);
  return found?.key ?? null;
}

function toggleInList(list: string[], key: string): string[] {
  return list.includes(key) ? list.filter((m) => m !== key) : [...list, key];
}

// Context for whichever save is pending confirmation — covers both the
// "Add Team Member" flow and the "Edit Permissions" flow for an existing
// staff member, so a single confirmation dialog can serve both.
type PendingSave = {
  mode: "add" | "edit";
  userId: string;
  label: string;
  modules: string[];
};

const TeamManagementModule = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [presetKey, setPresetKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Edit-permissions dialog state (existing staff member)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editModules, setEditModules] = useState<string[]>([]);
  const [editPresetKey, setEditPresetKey] = useState<string | null>(null);

  // Permission-change confirmation (shared by Add + Edit)
  const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);

  // Remove-member confirmation
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
  const [removing, setRemoving] = useState(false);

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
    setPresetKey(null);
  };

  const toggleModule = (moduleKey: string) => {
    setSelectedModules((prev) => toggleInList(prev, moduleKey));
    setPresetKey(null); // manual edit breaks any preset match
  };

  const applyPreset = (preset: RolePreset) => {
    setSelectedModules(preset.modules);
    setPresetKey(preset.key);
  };

  const toggleEditModule = (moduleKey: string) => {
    setEditModules((prev) => toggleInList(prev, moduleKey));
    setEditPresetKey(null);
  };

  const applyEditPreset = (preset: RolePreset) => {
    setEditModules(preset.modules);
    setEditPresetKey(preset.key);
  };

  const openEditPermissions = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEditModules(staff.modules);
    setEditPresetKey(matchPreset(staff.modules));
  };

  // Step 1 (Add flow): validate, then ask for confirmation.
  const requestAssignStaff = () => {
    if (!foundUser) return;
    if (selectedModules.length === 0) {
      toast.error("Select at least one module for this staff member");
      return;
    }
    setPendingSave({
      mode: "add",
      userId: foundUser.user_id,
      label: foundUser.email || "This user",
      modules: selectedModules,
    });
  };

  // Step 1 (Edit flow): validate, then ask for confirmation.
  const requestEditPermissions = () => {
    if (!editingStaff) return;
    if (editModules.length === 0) {
      toast.error("Select at least one module for this staff member");
      return;
    }
    setPendingSave({
      mode: "edit",
      userId: editingStaff.user_id,
      label: editingStaff.email || "This user",
      modules: editModules,
    });
  };

  // Step 2: the actual write — same two supabase calls as the original
  // handleAssignStaff, now shared by both Add and Edit since the
  // operation (set role to staff, replace module permissions) is
  // identical either way.
  const performSaveModules = async () => {
    if (!pendingSave) return;
    const { userId, modules, mode, label } = pendingSave;
    setSaving(true);

    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingRole) {
      await supabase.from("user_roles").update({ role: "staff" }).eq("user_id", userId);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: "staff" });
    }

    await supabase.from("admin_module_permissions").delete().eq("user_id", userId);

    const rows = modules.map((module) => ({
      user_id: userId,
      module,
      can_view: true,
      can_edit: true,
    }));
    const { error } = await supabase.from("admin_module_permissions").insert(rows);

    setSaving(false);
    setPendingSave(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (mode === "add") {
      toast.success(`${label} is now a staff member with limited access`);
      setFoundUser(null);
      setSearchEmail("");
      setSelectedModules([]);
      setPresetKey(null);
    } else {
      toast.success(`${label}'s permissions were updated`);
      setEditingStaff(null);
      setEditModules([]);
      setEditPresetKey(null);
    }
    loadStaffList();
  };

  // Existing removal logic — unchanged, just no longer gated by window.confirm().
  const performRemoveStaff = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    await supabase.from("admin_module_permissions").delete().eq("user_id", removeTarget.user_id);
    await supabase.from("user_roles").delete().eq("user_id", removeTarget.user_id).eq("role", "staff");
    setRemoving(false);
    toast.success("Staff access removed");
    setRemoveTarget(null);
    loadStaffList();
  };

  const renderPresetRow = (activePresetKey: string | null, onApply: (preset: RolePreset) => void) => (
    <div className="flex flex-wrap gap-2">
      {ROLE_PRESETS.map((preset) => (
        <Button
          key={preset.key}
          type="button"
          size="sm"
          variant={activePresetKey === preset.key ? "default" : "outline"}
          onClick={() => onApply(preset)}
          title={preset.description}
        >
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
          {preset.label}
        </Button>
      ))}
    </div>
  );

  const renderModuleGrid = (modules: string[], onToggle: (key: string) => void) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {ADMIN_MODULES.map((mod) => (
        <label key={mod.key} className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox checked={modules.includes(mod.key)} onCheckedChange={() => onToggle(mod.key)} />
          {mod.label}
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Add Team Member
          </CardTitle>
          <CardDescription>
            Search a registered user by email, then choose a role preset or hand-pick which sections
            they can access. The user must have signed up already at /auth.
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

              <div className="space-y-2">
                <Label className="block">Role preset</Label>
                {renderPresetRow(presetKey, applyPreset)}
                {presetKey === null && selectedModules.length > 0 && (
                  <p className="text-xs text-muted-foreground">Custom module selection</p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">Select allowed sections</Label>
                {renderModuleGrid(selectedModules, toggleModule)}
              </div>

              <Button onClick={requestAssignStaff} disabled={saving}>
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
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditPermissions(s)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Manage Access
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRemoveTarget(s)}>
                      <Trash2 className="w-4 h-4 mr-1 text-destructive" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Permissions dialog — reuses the existing Dialog component and
          the same preset/checklist UI as the Add flow. */}
      <Dialog
        open={!!editingStaff}
        onOpenChange={(o) => {
          if (!o) {
            setEditingStaff(null);
            setEditModules([]);
            setEditPresetKey(null);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Access</DialogTitle>
            <DialogDescription>
              {editingStaff?.full_name || editingStaff?.email || "This team member"}'s module permissions.
            </DialogDescription>
          </DialogHeader>
          {editingStaff && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="block">Role preset</Label>
                {renderPresetRow(editPresetKey, applyEditPreset)}
                {editPresetKey === null && editModules.length > 0 && (
                  <p className="text-xs text-muted-foreground">Custom module selection</p>
                )}
              </div>
              <div>
                <Label className="mb-2 block">Select allowed sections</Label>
                {renderModuleGrid(editModules, toggleEditModule)}
              </div>
              <DialogFooter>
                <Button onClick={requestEditPermissions} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permission-change confirmation — shared by Add + Edit. Nothing is
          written until "Save Changes" is clicked here. */}
      <AlertDialog open={!!pendingSave} onOpenChange={(o) => !saving && !o && setPendingSave(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Permission Changes</AlertDialogTitle>
            <AlertDialogDescription>
              These permission changes will affect this team member immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={saving}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                performSaveModules();
              }}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Team Member confirmation — replaces the previous window.confirm(). */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !removing && !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will immediately lose access to the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={removing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                performRemoveStaff();
              }}
            >
              {removing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamManagementModule;