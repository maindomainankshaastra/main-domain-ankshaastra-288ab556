"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ServicesModule;
var react_1 = require("react");
var client_1 = require("@/integrations/supabase/client");
var AdminPage_1 = require("@/components/admin/AdminPage");
var useAdminData_1 = require("@/hooks/useAdminData");
var servicePages_1 = require("@/data/servicePages");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var blank = { title: "", description: "", category: "", price: 0, gst_rate: 18, hsn_sac_code: "", is_active: true };
function ServicesModule() {
    var _this = this;
    var _a = (0, useAdminData_1.useAdminTable)("services"), services = _a.rows, loading = _a.loading, reload = _a.reload;
    var _b = (0, react_1.useState)(false), open = _b[0], setOpen = _b[1];
    var _c = (0, react_1.useState)(null), editing = _c[0], setEditing = _c[1];
    var _d = (0, react_1.useState)(blank), form = _d[0], setForm = _d[1];
    var _e = (0, react_1.useState)(false), saving = _e[0], setSaving = _e[1];
    var missingPageServices = servicePages_1.existingServicePages.filter(function (page) { return !services.some(function (service) { return service.title === page.title; }); });
    var save = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var payload, error, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    e.preventDefault();
                    setSaving(true);
                    payload = __assign(__assign({}, form), { price: Number(form.price), gst_rate: Number(form.gst_rate) });
                    if (!editing) return [3 /*break*/, 2];
                    return [4 /*yield*/, client_1.supabase.from("services").update(payload).eq("id", editing.id)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, client_1.supabase.from("services").insert(payload)];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    error = (_a).error;
                    setSaving(false);
                    if (error)
                        sonner_1.toast.error(error.message);
                    else {
                        sonner_1.toast.success("Saved");
                        setOpen(false);
                        reload();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var addPageService = function (page) { return __awaiter(_this, void 0, void 0, function () {
        var payload, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    payload = {
                        title: page.title,
                        description: page.description,
                        category: page.category,
                        price: page.price,
                        gst_rate: page.gst_rate,
                        hsn_sac_code: null,
                        is_active: true,
                    };
                    return [4 /*yield*/, client_1.supabase.from("services").insert(payload)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        sonner_1.toast.error(error.message);
                    }
                    else {
                        sonner_1.toast.success("Added ".concat(page.title));
                        reload();
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    return (<AdminPage_1.AdminPage title="Service Catalog" description="Manage the live site services currently available to customers." loading={loading} empty={!services.length && !missingPageServices.length} emptyMessage='No services. Click "New Service" to add.' actions={<dialog_1.Dialog open={open} onOpenChange={setOpen}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button onClick={function () { setEditing(null); setForm(blank); }}><lucide_react_1.Plus className="w-4 h-4 mr-2"/>New</button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent>
            <dialog_1.DialogHeader><dialog_1.DialogTitle>{editing ? "Edit" : "New"} Service</dialog_1.DialogTitle></dialog_1.DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <div><label_1.Label>Title</label_1.Label><input_1.Input value={form.title} onChange={function (e) { return setForm(__assign(__assign({}, form), { title: e.target.value })); }} required/></div>
              <div><label_1.Label>Description</label_1.Label><textarea_1.Textarea value={form.description} onChange={function (e) { return setForm(__assign(__assign({}, form), { description: e.target.value })); }}/></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label_1.Label>Price</label_1.Label><input_1.Input type="number" value={form.price} onChange={function (e) { return setForm(__assign(__assign({}, form), { price: Number(e.target.value) })); }}/></div>
                <div><label_1.Label>GST %</label_1.Label><input_1.Input type="number" value={form.gst_rate} onChange={function (e) { return setForm(__assign(__assign({}, form), { gst_rate: Number(e.target.value) })); }}/></div>
              </div>
              <dialog_1.DialogFooter><button_1.Button type="submit" disabled={saving}>Save</button_1.Button></dialog_1.DialogFooter>
            </form>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>}>
      {missingPageServices.length > 0 && (<div className="border border-border rounded-2xl p-4 mb-4 bg-muted/70">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Detected existing service pages</p>
              <p className="text-sm text-muted-foreground">These pages already exist in the app but are not yet in the live service catalog.</p>
            </div>
          </div>
          <div className="grid gap-3">
            {missingPageServices.map(function (page) { return (<div key={page.route} className="rounded-xl border border-border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-semibold">{page.title}</p>
                  <p className="text-sm text-muted-foreground">{page.category} · ₹{page.price.toLocaleString()} · {page.gst_rate}% GST</p>
                </div>
                <button_1.Button size="sm" onClick={function () { return addPageService(page); }}>Add to Catalog</button_1.Button>
              </div>); })}
          </div>
        </div>)}

      <div className="space-y-2">
        {services.map(function (s) { return (<div key={s.id} className="border border-border rounded-lg p-4 flex justify-between gap-3">
            <div>
              <p className="font-semibold">{s.title} {!s.is_active && <badge_1.Badge variant="secondary">Off</badge_1.Badge>}</p>
              <p className="text-sm text-muted-foreground">{s.category} · GST {s.gst_rate}%</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">₹{Number(s.price).toLocaleString()}</span>
              <button_1.Button size="icon" variant="outline" onClick={function () { setEditing(s); setForm(__assign(__assign({}, s), { description: s.description || "", category: s.category || "", hsn_sac_code: s.hsn_sac_code || "" })); setOpen(true); }}><lucide_react_1.Pencil className="w-4 h-4"/></button_1.Button>
              <button_1.Button size="icon" variant="outline" onClick={function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Delete?")) return [3 /*break*/, 2];
                    return [4 /*yield*/, client_1.supabase.from("services").delete().eq("id", s.id)];
                case 1:
                    _a.sent();
                    reload();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        }); }); }}><lucide_react_1.Trash2 className="w-4 h-4"/></button_1.Button>
            </div>
          </div>); })}
      </div>
    </AdminPage_1.AdminPage>);
}
