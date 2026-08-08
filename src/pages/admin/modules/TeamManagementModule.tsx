


// import { useEffect, useState } from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { supabase } from "@/integrations/supabase/client";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// async function logAudit(actionType: string, targetUserId: string, targetName: string) {
//   const { data } = await supabase.auth.getUser();
//   const actor = data.user;
//   await supabase.from("audit_logs").insert({
//     user_id: actor?.id ?? null,
//     user_name: actor?.user_metadata?.full_name || actor?.email || null,
//     user_email: actor?.email ?? null,
//     action_type: actionType,
//     module: "team-management",
//     record_id: targetUserId,
//     record_name: targetName,
//   });
// }
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { toast } from "sonner";
// import { Loader2, Search, UserCog, Trash2, Pencil, ShieldCheck, History, Users } from "lucide-react";
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

// // A former staff member — captured as a permanent snapshot at the moment
// // they were removed, so the record survives even if their profile row or
// // permissions are later deleted or changed.
// interface RemovedStaffMember {
//   user_id: string;
//   full_name: string | null;
//   email: string | null;
//   modules_snapshot: string[];
//   removed_at: string;
//   removed_by: string | null;
//   removed_by_name: string | null;
// }

// // ------------------------------------------------------------------
// // Role presets — map each predefined role to recommended module keys.
// // Keys must match ADMIN_MODULES exactly (source of truth for what a
// // "module" is in this system).
// // ------------------------------------------------------------------

// const ALL_MODULE_KEYS = ADMIN_MODULES.map((m) => m.key);

// type RolePreset = {
//   key: string;
//   label: string;
//   description: string;
//   modules: string[];
// };

// const ROLE_PRESETS: RolePreset[] = [
//   {
//     key: "super-admin",
//     label: "Super Admin",
//     description: "Full access to every module.",
//     modules: ALL_MODULE_KEYS,
//   },
//   {
//     key: "admin",
//     label: "Admin",
//     description: "Full operational access, excluding GST maintenance tools.",
//     modules: ALL_MODULE_KEYS.filter((k) => k !== "gst-maintenance"),
//   },
//   {
//     key: "finance",
//     label: "Finance",
//     description: "Orders, invoices, pricing, and GST modules.",
//     modules: ["orders", "invoices", "pricing", "settings", "gst-reports", "gst-maintenance"],
//   },
//   {
//     key: "support",
//     label: "Support",
//     description: "Order handling and customer communication.",
//     modules: ["orders", "email", "crm"],
//   },
//   {
//     key: "marketing",
//     label: "Marketing",
//     description: "CRM, content, and campaign-facing modules.",
//     modules: ["crm", "templates", "email", "service-pages"],
//   },
// ];

// // Returns the preset key whose module set exactly matches the given
// // modules, or null if the current selection doesn't match any preset
// // (i.e. it's a custom mix).
// function matchPreset(modules: string[]): string | null {
//   const sorted = [...modules].sort().join(",");
//   const found = ROLE_PRESETS.find((p) => [...p.modules].sort().join(",") === sorted);
//   return found?.key ?? null;
// }

// function toggleInList(list: string[], key: string): string[] {
//   return list.includes(key) ? list.filter((m) => m !== key) : [...list, key];
// }

// function formatDateTime(value: string | null): string {
//   if (!value) return "—";
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) return "—";
//   return d.toLocaleString(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// // Context for whichever save is pending confirmation — covers both the
// // "Add Team Member" flow and the "Edit Permissions" flow for an existing
// // staff member, so a single confirmation dialog can serve both.
// type PendingSave = {
//   mode: "add" | "edit";
//   userId: string;
//   label: string;
//   modules: string[];
// };

// const TeamManagementModule = () => {
//   const { user: currentUser } = useAuth();

//   const [searchEmail, setSearchEmail] = useState("");
//   const [searching, setSearching] = useState(false);
//   const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
//   const [selectedModules, setSelectedModules] = useState<string[]>([]);
//   const [presetKey, setPresetKey] = useState<string | null>(null);
//   const [saving, setSaving] = useState(false);

//   const [staffList, setStaffList] = useState<StaffMember[]>([]);
//   const [loadingStaff, setLoadingStaff] = useState(true);

//   // Former staff — audit trail. Kept separate from staffList so the two
//   // tabs (Active / Removed) never mix live and historical data.
//   const [removedStaffList, setRemovedStaffList] = useState<RemovedStaffMember[]>([]);
//   const [loadingRemoved, setLoadingRemoved] = useState(true);

//   // Edit-permissions dialog state (existing staff member)
//   const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
//   const [editModules, setEditModules] = useState<string[]>([]);
//   const [editPresetKey, setEditPresetKey] = useState<string | null>(null);

//   // Permission-change confirmation (shared by Add + Edit)
//   const [pendingSave, setPendingSave] = useState<PendingSave | null>(null);

//   // Remove-member confirmation
//   const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
//   const [removing, setRemoving] = useState(false);

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

//   // Loads the audit trail of former staff, most-recently-removed first.
//   // Names/emails/modules come straight from the snapshot columns — never
//   // re-joined against profiles/permissions — because those live rows may
//   // have already changed or been deleted since the removal happened.
//   const loadRemovedStaffList = async () => {
//     setLoadingRemoved(true);
//     const { data: removals } = await supabase
//       .from("staff_removals")
//       .select("user_id, full_name, email, modules_snapshot, removed_at, removed_by")
//       .order("removed_at", { ascending: false });

//     if (!removals || removals.length === 0) {
//       setRemovedStaffList([]);
//       setLoadingRemoved(false);
//       return;
//     }

//     // Best-effort: resolve "removed_by" to a display name via profiles.
//     // Falls back to "—" if that admin's profile can't be found (e.g. their
//     // account was also later removed).
//     const removerIds = [...new Set(removals.map((r) => r.removed_by).filter(Boolean))] as string[];
//     const { data: removerProfiles } = removerIds.length
//       ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", removerIds)
//       : { data: [] as { user_id: string; full_name: string | null; email: string | null }[] };

//     const list: RemovedStaffMember[] = removals.map((r) => {
//       const remover = removerProfiles?.find((p) => p.user_id === r.removed_by);
//       return {
//         user_id: r.user_id,
//         full_name: r.full_name,
//         email: r.email,
//         modules_snapshot: r.modules_snapshot || [],
//         removed_at: r.removed_at,
//         removed_by: r.removed_by,
//         removed_by_name: remover?.full_name || remover?.email || null,
//       };
//     });

//     setRemovedStaffList(list);
//     setLoadingRemoved(false);
//   };

//   useEffect(() => {
//     loadStaffList();
//     loadRemovedStaffList();
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

//     if (error || !data) {
//       setSearching(false);
//       toast.error("No user found with this email. They must sign up first at /auth.");
//       return;
//     }

//     // Permanently-removed staff are excluded from search results — they can
//     // only be re-added if a database administrator deletes their row from
//     // staff_removals directly (no UI action can undo this).
//     const { data: removal } = await supabase
//       .from("staff_removals")
//       .select("user_id")
//       .eq("user_id", data.user_id)
//       .maybeSingle();

//     setSearching(false);

//     if (removal) {
//       toast.error("No user found with this email. They must sign up first at /auth.");
//       return;
//     }

//     setFoundUser(data);
//     setSelectedModules([]);
//     setPresetKey(null);
//   };

//   const toggleModule = (moduleKey: string) => {
//     setSelectedModules((prev) => toggleInList(prev, moduleKey));
//     setPresetKey(null); // manual edit breaks any preset match
//   };

//   const applyPreset = (preset: RolePreset) => {
//     setSelectedModules(preset.modules);
//     setPresetKey(preset.key);
//   };

//   const toggleEditModule = (moduleKey: string) => {
//     setEditModules((prev) => toggleInList(prev, moduleKey));
//     setEditPresetKey(null);
//   };

//   const applyEditPreset = (preset: RolePreset) => {
//     setEditModules(preset.modules);
//     setEditPresetKey(preset.key);
//   };

//   const openEditPermissions = (staff: StaffMember) => {
//     setEditingStaff(staff);
//     setEditModules(staff.modules);
//     setEditPresetKey(matchPreset(staff.modules));
//   };

//   // Step 1 (Add flow): validate, then ask for confirmation.
//   const requestAssignStaff = () => {
//     if (!foundUser) return;
//     if (selectedModules.length === 0) {
//       toast.error("Select at least one module for this staff member");
//       return;
//     }
//     setPendingSave({
//       mode: "add",
//       userId: foundUser.user_id,
//       label: foundUser.email || "This user",
//       modules: selectedModules,
//     });
//   };

//   // Step 1 (Edit flow): validate, then ask for confirmation.
//   const requestEditPermissions = () => {
//     if (!editingStaff) return;
//     if (editModules.length === 0) {
//       toast.error("Select at least one module for this staff member");
//       return;
//     }
//     setPendingSave({
//       mode: "edit",
//       userId: editingStaff.user_id,
//       label: editingStaff.email || "This user",
//       modules: editModules,
//     });
//   };

//   // Step 2: the actual write — same two supabase calls as the original
//   // handleAssignStaff, now shared by both Add and Edit since the
//   // operation (set role to staff, replace module permissions) is
//   // identical either way.
//   const performSaveModules = async () => {
//     if (!pendingSave) return;
//     const { userId, modules, mode, label } = pendingSave;
//     setSaving(true);

//     // Defense-in-depth: even though a removed user can no longer be found
//     // via search, block the write here too in case foundUser was already
//     // in state before the removal happened.
//     if (mode === "add") {
//       const { data: removal } = await supabase
//         .from("staff_removals")
//         .select("user_id")
//         .eq("user_id", userId)
//         .maybeSingle();

//       if (removal) {
//         setSaving(false);
//         setPendingSave(null);
//         setFoundUser(null);
//         setSearchEmail("");
//         toast.error("This user was previously removed and can't be re-added.");
//         return;
//       }
//     }

//     const { data: existingRole } = await supabase
//       .from("user_roles")
//       .select("id")
//       .eq("user_id", userId)
//       .maybeSingle();

//     if (existingRole) {
//       await supabase.from("user_roles").update({ role: "staff" }).eq("user_id", userId);
//     } else {
//       await supabase.from("user_roles").insert({ user_id: userId, role: "staff" });
//     }

//     await supabase.from("admin_module_permissions").delete().eq("user_id", userId);

//     const rows = modules.map((module) => ({
//       user_id: userId,
//       module,
//       can_view: true,
//       can_edit: true,
//     }));
//     const { error } = await supabase.from("admin_module_permissions").insert(rows);

//     setSaving(false);
//     setPendingSave(null);

//     if (error) {
//       toast.error(error.message);
//       return;
//     }
//     await logAudit(
//   mode === "add" ? "team_member_added" : "permissions_changed",
//   userId,
//   label
// );

//     if (mode === "add") {
//       toast.success(`${label} is now a staff member with limited access`);
//       setFoundUser(null);
//       setSearchEmail("");
//       setSelectedModules([]);
//       setPresetKey(null);
//     } else {
//       toast.success(`${label}'s permissions were updated`);
//       setEditingStaff(null);
//       setEditModules([]);
//       setEditPresetKey(null);
//     }
//     loadStaffList();
//   };

//   // Removal now: (1) captures a permanent snapshot of who they were and
//   // what they could access — BEFORE anything is deleted, (2) revokes
//   // current access, and (3) records the snapshot + who removed them + when.
//   // This is what makes "who used to have access to GST Maintenance, and
//   // when did that access end" answerable later, even after the live
//   // permissions/role rows are gone.
//   const performRemoveStaff = async () => {
//     if (!removeTarget) return;
//     setRemoving(true);

//     const snapshot = {
//       user_id: removeTarget.user_id,
//       full_name: removeTarget.full_name,
//       email: removeTarget.email,
//       modules_snapshot: removeTarget.modules,
//       removed_at: new Date().toISOString(),
//       removed_by: currentUser?.id ?? null,
//     };

//     await supabase.from("admin_module_permissions").delete().eq("user_id", removeTarget.user_id);
//     await supabase.from("user_roles").delete().eq("user_id", removeTarget.user_id).eq("role", "staff");
//     await supabase.from("staff_removals").upsert(snapshot);
//     await logAudit("team_member_removed", removeTarget.user_id, removeTarget.full_name);

//     setRemoving(false);
//     toast.success("Staff access removed");
//     setRemoveTarget(null);
//     loadStaffList();
//     loadRemovedStaffList();
//   };

//   const renderPresetRow = (activePresetKey: string | null, onApply: (preset: RolePreset) => void) => (
//     <div className="flex flex-wrap gap-2">
//       {ROLE_PRESETS.map((preset) => (
//         <Button
//           key={preset.key}
//           type="button"
//           size="sm"
//           variant={activePresetKey === preset.key ? "default" : "outline"}
//           onClick={() => onApply(preset)}
//           title={preset.description}
//         >
//           <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
//           {preset.label}
//         </Button>
//       ))}
//     </div>
//   );

//   const renderModuleGrid = (modules: string[], onToggle: (key: string) => void) => (
//     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//       {ADMIN_MODULES.map((mod) => (
//         <label key={mod.key} className="flex items-center gap-2 text-sm cursor-pointer">
//           <Checkbox checked={modules.includes(mod.key)} onCheckedChange={() => onToggle(mod.key)} />
//           {mod.label}
//         </label>
//       ))}
//     </div>
//   );

//   const renderModuleBadges = (modules: string[]) =>
//     modules.length === 0 ? (
//       <Badge variant="secondary">No modules recorded</Badge>
//     ) : (
//       modules.map((m) => (
//         <Badge key={m} variant="outline" className="text-xs">
//           {ADMIN_MODULES.find((am) => am.key === m)?.label || m}
//         </Badge>
//       ))
//     );

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <UserCog className="w-5 h-5 text-primary" />
//             Add Team Member
//           </CardTitle>
//           <CardDescription>
//             Search a registered user by email, then choose a role preset or hand-pick which sections
//             they can access. The user must have signed up already at /auth.
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

//               <div className="space-y-2">
//                 <Label className="block">Role preset</Label>
//                 {renderPresetRow(presetKey, applyPreset)}
//                 {presetKey === null && selectedModules.length > 0 && (
//                   <p className="text-xs text-muted-foreground">Custom module selection</p>
//                 )}
//               </div>

//               <div>
//                 <Label className="mb-2 block">Select allowed sections</Label>
//                 {renderModuleGrid(selectedModules, toggleModule)}
//               </div>

//               <Button onClick={requestAssignStaff} disabled={saving}>
//                 {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                 Make Staff with Selected Access
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Team Members</CardTitle>
//           <CardDescription>
//             Active staff with admin panel access, and a permanent record of former staff for audit purposes.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Tabs defaultValue="active">
//             <TabsList className="grid w-full grid-cols-2 max-w-md">
//               <TabsTrigger value="active">
//                 <Users className="w-4 h-4 mr-2" />
//                 Active ({staffList.length})
//               </TabsTrigger>
//               <TabsTrigger value="removed">
//                 <History className="w-4 h-4 mr-2" />
//                 Removed ({removedStaffList.length})
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="active" className="mt-4">
//               {loadingStaff ? (
//                 <Loader2 className="w-6 h-6 animate-spin text-primary" />
//               ) : staffList.length === 0 ? (
//                 <p className="text-sm text-muted-foreground py-4 text-center">No staff members yet.</p>
//               ) : (
//                 <div className="space-y-3">
//                   {staffList.map((s) => (
//                     <div key={s.user_id} className="border border-border rounded-lg p-4 flex items-start justify-between gap-4 flex-wrap">
//                       <div>
//                         <p className="font-semibold">{s.full_name || "No name set"}</p>
//                         <p className="text-sm text-muted-foreground mb-2">{s.email}</p>
//                         <div className="flex flex-wrap gap-1">
//                           {s.modules.length === 0 ? (
//                             <Badge variant="secondary">No modules assigned</Badge>
//                           ) : (
//                             renderModuleBadges(s.modules)
//                           )}
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Button variant="outline" size="sm" onClick={() => openEditPermissions(s)}>
//                           <Pencil className="w-4 h-4 mr-1" />
//                           Manage Access
//                         </Button>
//                         <Button variant="outline" size="sm" onClick={() => setRemoveTarget(s)}>
//                           <Trash2 className="w-4 h-4 mr-1 text-destructive" />
//                           Remove
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="removed" className="mt-4">
//               {loadingRemoved ? (
//                 <Loader2 className="w-6 h-6 animate-spin text-primary" />
//               ) : removedStaffList.length === 0 ? (
//                 <p className="text-sm text-muted-foreground py-4 text-center">
//                   No former staff on record.
//                 </p>
//               ) : (
//                 <div className="space-y-3">
//                   {removedStaffList.map((r) => (
//                     <div
//                       key={`${r.user_id}-${r.removed_at}`}
//                       className="border border-border rounded-lg p-4 flex items-start justify-between gap-4 flex-wrap bg-muted/30"
//                     >
//                       <div>
//                         <p className="font-semibold text-muted-foreground">{r.full_name || "No name set"}</p>
//                         <p className="text-sm text-muted-foreground mb-2">{r.email}</p>
//                         <p className="text-xs text-muted-foreground mb-2">
//                           Access ended {formatDateTime(r.removed_at)}
//                           {r.removed_by_name ? ` · removed by ${r.removed_by_name}` : ""}
//                         </p>
//                         <div className="flex flex-wrap gap-1">
//                           {renderModuleBadges(r.modules_snapshot)}
//                         </div>
//                       </div>
//                       <Badge variant="secondary" className="shrink-0">Removed</Badge>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>

//       {/* Edit Permissions dialog — reuses the existing Dialog component and
//           the same preset/checklist UI as the Add flow. */}
//       <Dialog
//         open={!!editingStaff}
//         onOpenChange={(o) => {
//           if (!o) {
//             setEditingStaff(null);
//             setEditModules([]);
//             setEditPresetKey(null);
//           }
//         }}
//       >
//         <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Manage Access</DialogTitle>
//             <DialogDescription>
//               {editingStaff?.full_name || editingStaff?.email || "This team member"}'s module permissions.
//             </DialogDescription>
//           </DialogHeader>
//           {editingStaff && (
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label className="block">Role preset</Label>
//                 {renderPresetRow(editPresetKey, applyEditPreset)}
//                 {editPresetKey === null && editModules.length > 0 && (
//                   <p className="text-xs text-muted-foreground">Custom module selection</p>
//                 )}
//               </div>
//               <div>
//                 <Label className="mb-2 block">Select allowed sections</Label>
//                 {renderModuleGrid(editModules, toggleEditModule)}
//               </div>
//               <DialogFooter>
//                 <Button onClick={requestEditPermissions} disabled={saving}>
//                   {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//                   Save Changes
//                 </Button>
//               </DialogFooter>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Permission-change confirmation — shared by Add + Edit. Nothing is
//           written until "Save Changes" is clicked here. */}
//       <AlertDialog open={!!pendingSave} onOpenChange={(o) => !saving && !o && setPendingSave(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Confirm Permission Changes</AlertDialogTitle>
//             <AlertDialogDescription>
//               These permission changes will affect this team member immediately.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel type="button" disabled={saving}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               type="button"
//               disabled={saving}
//               onClick={(e) => {
//                 e.preventDefault();
//                 performSaveModules();
//               }}
//             >
//               {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//               Save Changes
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* Remove Team Member confirmation — replaces the previous window.confirm(). */}
//       <AlertDialog open={!!removeTarget} onOpenChange={(o) => !removing && !o && setRemoveTarget(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This user will immediately lose access to the admin panel. A record of their access
//               (name, email, and the modules they could view) will be kept under the "Removed" tab
//               for audit purposes.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel type="button" disabled={removing}>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               type="button"
//               disabled={removing}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//               onClick={(e) => {
//                 e.preventDefault();
//                 performRemoveStaff();
//               }}
//             >
//               {removing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
//               Remove
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };

// export default TeamManagementModule;

// export default TeamManagementModule;

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Loader2, Search, UserCog, Trash2, Pencil, ShieldCheck, History, Users } from "lucide-react";
import { ADMIN_MODULES } from "@/lib/admin-modules";

// Writes one row to audit_logs. Fire-and-forget from the caller's point of
// view is NOT used here on purpose — callers `await` this so the write is
// attempted before the success toast fires, but a failure here must never
// block or throw into the calling action (add/edit/remove already
// succeeded by the time this runs).
async function logAudit(actionType: string, targetUserId: string, targetName: string) {
  try {
    const { data } = await supabase.auth.getUser();
    const actor = data.user;
    const { error } = await supabase.from("audit_logs").insert({
      user_id: actor?.id ?? null,
      user_name: actor?.user_metadata?.full_name || actor?.email || null,
      user_email: actor?.email ?? null,
      action_type: actionType,
      module: "team-management",
      record_id: targetUserId,
      record_name: targetName,
    });
    if (error) {
      console.warn("[audit-log] failed to write team-management entry:", error.message);
    }
  } catch (err) {
    console.warn("[audit-log] unexpected error writing team-management entry:", err);
  }
}

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

// A former staff member — captured as a permanent snapshot at the moment
// they were removed, so the record survives even if their profile row or
// permissions are later deleted or changed.
interface RemovedStaffMember {
  user_id: string;
  full_name: string | null;
  email: string | null;
  modules_snapshot: string[];
  removed_at: string;
  removed_by: string | null;
  removed_by_name: string | null;
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

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const { user: currentUser } = useAuth();

  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [presetKey, setPresetKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Former staff — audit trail. Kept separate from staffList so the two
  // tabs (Active / Removed) never mix live and historical data.
  const [removedStaffList, setRemovedStaffList] = useState<RemovedStaffMember[]>([]);
  const [loadingRemoved, setLoadingRemoved] = useState(true);

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

  // Loads the audit trail of former staff, most-recently-removed first.
  // Names/emails/modules come straight from the snapshot columns — never
  // re-joined against profiles/permissions — because those live rows may
  // have already changed or been deleted since the removal happened.
  const loadRemovedStaffList = async () => {
    setLoadingRemoved(true);
    const { data: removals } = await supabase
      .from("staff_removals")
      .select("user_id, full_name, email, modules_snapshot, removed_at, removed_by")
      .order("removed_at", { ascending: false });

    if (!removals || removals.length === 0) {
      setRemovedStaffList([]);
      setLoadingRemoved(false);
      return;
    }

    // Best-effort: resolve "removed_by" to a display name via profiles.
    // Falls back to "—" if that admin's profile can't be found (e.g. their
    // account was also later removed).
    const removerIds = [...new Set(removals.map((r) => r.removed_by).filter(Boolean))] as string[];
    const { data: removerProfiles } = removerIds.length
      ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", removerIds)
      : { data: [] as { user_id: string; full_name: string | null; email: string | null }[] };

    const list: RemovedStaffMember[] = removals.map((r) => {
      const remover = removerProfiles?.find((p) => p.user_id === r.removed_by);
      return {
        user_id: r.user_id,
        full_name: r.full_name,
        email: r.email,
        modules_snapshot: r.modules_snapshot || [],
        removed_at: r.removed_at,
        removed_by: r.removed_by,
        removed_by_name: remover?.full_name || remover?.email || null,
      };
    });

    setRemovedStaffList(list);
    setLoadingRemoved(false);
  };

  useEffect(() => {
    loadStaffList();
    loadRemovedStaffList();
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

    if (error || !data) {
      setSearching(false);
      toast.error("No user found with this email. They must sign up first at /auth.");
      return;
    }

    // Permanently-removed staff are excluded from search results — they can
    // only be re-added if a database administrator deletes their row from
    // staff_removals directly (no UI action can undo this).
    const { data: removal } = await supabase
      .from("staff_removals")
      .select("user_id")
      .eq("user_id", data.user_id)
      .maybeSingle();

    setSearching(false);

    if (removal) {
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

    // Defense-in-depth: even though a removed user can no longer be found
    // via search, block the write here too in case foundUser was already
    // in state before the removal happened.
    if (mode === "add") {
      const { data: removal } = await supabase
        .from("staff_removals")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (removal) {
        setSaving(false);
        setPendingSave(null);
        setFoundUser(null);
        setSearchEmail("");
        toast.error("This user was previously removed and can't be re-added.");
        return;
      }
    }

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

    await logAudit(
      mode === "add" ? "team_member_added" : "permissions_changed",
      userId,
      label,
    );

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

  // Removal now: (1) captures a permanent snapshot of who they were and
  // what they could access — BEFORE anything is deleted, (2) revokes
  // current access, and (3) records the snapshot + who removed them + when.
  // This is what makes "who used to have access to GST Maintenance, and
  // when did that access end" answerable later, even after the live
  // permissions/role rows are gone.
  const performRemoveStaff = async () => {
    if (!removeTarget) return;
    setRemoving(true);

    const snapshot = {
      user_id: removeTarget.user_id,
      full_name: removeTarget.full_name,
      email: removeTarget.email,
      modules_snapshot: removeTarget.modules,
      removed_at: new Date().toISOString(),
      removed_by: currentUser?.id ?? null,
    };

    await supabase.from("admin_module_permissions").delete().eq("user_id", removeTarget.user_id);
    await supabase.from("user_roles").delete().eq("user_id", removeTarget.user_id).eq("role", "staff");
    await supabase.from("staff_removals").upsert(snapshot);

    await logAudit(
      "team_member_removed",
      removeTarget.user_id,
      removeTarget.full_name || removeTarget.email || "Unknown",
    );

    setRemoving(false);
    toast.success("Staff access removed");
    setRemoveTarget(null);
    loadStaffList();
    loadRemovedStaffList();
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

  const renderModuleBadges = (modules: string[]) =>
    modules.length === 0 ? (
      <Badge variant="secondary">No modules recorded</Badge>
    ) : (
      modules.map((m) => (
        <Badge key={m} variant="outline" className="text-xs">
          {ADMIN_MODULES.find((am) => am.key === m)?.label || m}
        </Badge>
      ))
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
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Active staff with admin panel access, and a permanent record of former staff for audit purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="active">
                <Users className="w-4 h-4 mr-2" />
                Active ({staffList.length})
              </TabsTrigger>
              <TabsTrigger value="removed">
                <History className="w-4 h-4 mr-2" />
                Removed ({removedStaffList.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
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
                            renderModuleBadges(s.modules)
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
            </TabsContent>

            <TabsContent value="removed" className="mt-4">
              {loadingRemoved ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : removedStaffList.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No former staff on record.
                </p>
              ) : (
                <div className="space-y-3">
                  {removedStaffList.map((r) => (
                    <div
                      key={`${r.user_id}-${r.removed_at}`}
                      className="border border-border rounded-lg p-4 flex items-start justify-between gap-4 flex-wrap bg-muted/30"
                    >
                      <div>
                        <p className="font-semibold text-muted-foreground">{r.full_name || "No name set"}</p>
                        <p className="text-sm text-muted-foreground mb-2">{r.email}</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Access ended {formatDateTime(r.removed_at)}
                          {r.removed_by_name ? ` · removed by ${r.removed_by_name}` : ""}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {renderModuleBadges(r.modules_snapshot)}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">Removed</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
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
              This user will immediately lose access to the admin panel. A record of their access
              (name, email, and the modules they could view) will be kept under the "Removed" tab
              for audit purposes.
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
