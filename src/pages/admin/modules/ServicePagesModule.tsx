import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminTable } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Globe, FileText, Package } from "lucide-react";
import { formatINR } from "@/config/pricing";

type ServicePage = {
  id: string;
  slug: string;
  route: string;
  page_type: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  seo_title: string | null;
  seo_description: string | null;
  hero_image_url: string | null;
  content: Record<string, unknown>;
  form_type: string;
  status: "draft" | "published";
  sort_order: number;
  published_at: string | null;
};

type ServicePackage = {
  id: string;
  page_id: string;
  name: string;
  tag: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  gst_rate: number;
  features: string[];
  excluded: string[];
  form_type: string | null;
  payment_service_title: string | null;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
};

const blankPage = {
  slug: "",
  route: "",
  page_type: "service",
  title: "",
  subtitle: "",
  description: "",
  category: "",
  seo_title: "",
  seo_description: "",
  hero_image_url: "",
  content: { features: [] as string[], faqs: [] as { q: string; a: string }[] },
  form_type: "default",
  status: "draft" as const,
  sort_order: 0,
};

const blankPackage = {
  page_id: "",
  name: "",
  tag: "",
  description: "",
  price: 0,
  original_price: 0,
  gst_rate: 18,
  features: [] as string[],
  excluded: [] as string[],
  form_type: "",
  payment_service_title: "",
  is_popular: false,
  is_active: true,
  sort_order: 0,
};

const FORM_TYPES = [
  "default",
  "kundali",
  "kundali-multi",
  "consultation",
  "name-correction",
  "name-correction-couple",
  "name-check",
  "couple",
  "pyaar-shastra",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ServicePagesModule() {
  const { rows: pages, loading: pagesLoading, reload: reloadPages } = useAdminTable<ServicePage>(
    "service_pages",
    "sort_order",
    true,
  );
  const { rows: packages, loading: packagesLoading, reload: reloadPackages } = useAdminTable<ServicePackage>(
    "service_packages",
    "sort_order",
    true,
  );

  const [pageOpen, setPageOpen] = useState(false);
  const [pkgOpen, setPkgOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<ServicePage | null>(null);
  const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);
  const [pageForm, setPageForm] = useState(blankPage);
  const [pkgForm, setPkgForm] = useState(blankPackage);
  const [featuresText, setFeaturesText] = useState("");
  const [faqsText, setFaqsText] = useState("");
  const [pkgFeaturesText, setPkgFeaturesText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pages.length && !pkgForm.page_id) {
      setPkgForm((prev) => ({ ...prev, page_id: pages[0].id }));
    }
  }, [pages, pkgForm.page_id]);

  const packagesByPage = useMemo(() => {
    const map = new Map<string, ServicePackage[]>();
    for (const pkg of packages) {
      const list = map.get(pkg.page_id) || [];
      list.push(pkg);
      map.set(pkg.page_id, list);
    }
    return map;
  }, [packages]);

  const openEditPage = (page: ServicePage) => {
    setEditingPage(page);
    const content = page.content || {};
    setPageForm({
      slug: page.slug,
      route: page.route,
      page_type: page.page_type,
      title: page.title,
      subtitle: page.subtitle || "",
      description: page.description || "",
      category: page.category || "",
      seo_title: page.seo_title || "",
      seo_description: page.seo_description || "",
      hero_image_url: page.hero_image_url || "",
      content,
      form_type: page.form_type,
      status: page.status,
      sort_order: page.sort_order,
    });
    setFeaturesText(Array.isArray(content.features) ? (content.features as string[]).join("\n") : "");
    setFaqsText(
      Array.isArray(content.faqs)
        ? (content.faqs as { q: string; a: string }[]).map((f) => `${f.q}|||${f.a}`).join("\n")
        : "",
    );
    setPageOpen(true);
  };

  const savePage = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slug = pageForm.slug || slugify(pageForm.title);
    const route =
      pageForm.route ||
      (pageForm.page_type === "report" ? `/reports/${slug}` : `/services/${slug}`);

    const faqs = faqsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [q, a] = line.split("|||");
        return { q: (q || "").trim(), a: (a || "").trim() };
      })
      .filter((f) => f.q);

    const payload = {
      slug,
      route,
      page_type: pageForm.page_type,
      title: pageForm.title,
      subtitle: pageForm.subtitle || null,
      description: pageForm.description || null,
      category: pageForm.category || null,
      seo_title: pageForm.seo_title || pageForm.title,
      seo_description: pageForm.seo_description || pageForm.description,
      hero_image_url: pageForm.hero_image_url || null,
      content: {
        ...pageForm.content,
        features: featuresText.split("\n").map((l) => l.trim()).filter(Boolean),
        faqs,
      },
      form_type: pageForm.form_type,
      status: pageForm.status,
      sort_order: Number(pageForm.sort_order) || 0,
      published_at: pageForm.status === "published" ? new Date().toISOString() : null,
    };

    const { error } = editingPage
      ? await supabase.from("service_pages").update(payload).eq("id", editingPage.id)
      : await supabase.from("service_pages").insert(payload);

    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(editingPage ? "Page updated" : "Page created");
      setPageOpen(false);
      reloadPages();
    }
  };

  const savePackage = async (e: FormEvent) => {
    e.preventDefault();
    if (!pkgForm.page_id) {
      toast.error("Select a page for this package");
      return;
    }
    setSaving(true);

    const payload = {
      page_id: pkgForm.page_id,
      name: pkgForm.name,
      tag: pkgForm.tag || null,
      description: pkgForm.description || null,
      price: Number(pkgForm.price),
      original_price: pkgForm.original_price ? Number(pkgForm.original_price) : null,
      gst_rate: Number(pkgForm.gst_rate) || 18,
      features: pkgFeaturesText.split("\n").map((l) => l.trim()).filter(Boolean),
      excluded: [],
      form_type: pkgForm.form_type || null,
      payment_service_title: pkgForm.payment_service_title || pkgForm.name,
      is_popular: pkgForm.is_popular,
      is_active: pkgForm.is_active,
      sort_order: Number(pkgForm.sort_order) || 0,
    };

    const { error } = editingPkg
      ? await supabase.from("service_packages").update(payload).eq("id", editingPkg.id)
      : await supabase.from("service_packages").insert(payload);

    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(editingPkg ? "Package updated" : "Package created");
      setPkgOpen(false);
      reloadPackages();
    }
  };

  const togglePublish = async (page: ServicePage) => {
    const nextStatus = page.status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("service_pages")
      .update({
        status: nextStatus,
        published_at: nextStatus === "published" ? new Date().toISOString() : null,
      })
      .eq("id", page.id);

    if (error) toast.error(error.message);
    else {
      toast.success(nextStatus === "published" ? "Page published" : "Page unpublished");
      reloadPages();
    }
  };

  return (
    <AdminPage
      title="Services & Packages"
      description="Create service pages, manage pricing packages, checkout forms, and publish to the live site."
      loading={pagesLoading || packagesLoading}
      empty={!pages.length}
      emptyMessage='No service pages yet. Create your first page to get started.'
      actions={
        <div className="flex gap-2">
          <Dialog
            open={pageOpen}
            onOpenChange={(open) => {
              setPageOpen(open);
              if (!open) setEditingPage(null);
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingPage(null);
                  setPageForm(blankPage);
                  setFeaturesText("");
                  setFaqsText("");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPage ? "Edit" : "New"} Service Page</DialogTitle>
              </DialogHeader>
              <form onSubmit={savePage} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={pageForm.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setPageForm({
                          ...pageForm,
                          title,
                          slug: editingPage ? pageForm.slug : slugify(title),
                          route: editingPage
                            ? pageForm.route
                            : pageForm.page_type === "report"
                              ? `/reports/${slugify(title)}`
                              : `/services/${slugify(title)}`,
                        });
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={pageForm.category}
                      onChange={(e) => setPageForm({ ...pageForm, category: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={pageForm.slug}
                      onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Route</Label>
                    <Input
                      value={pageForm.route}
                      onChange={(e) => setPageForm({ ...pageForm, route: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={pageForm.subtitle}
                    onChange={(e) => setPageForm({ ...pageForm, subtitle: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={pageForm.description}
                    onChange={(e) => setPageForm({ ...pageForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Page Type</Label>
                    <Select
                      value={pageForm.page_type}
                      onValueChange={(v) => setPageForm({ ...pageForm, page_type: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Checkout Form</Label>
                    <Select
                      value={pageForm.form_type}
                      onValueChange={(v) => setPageForm({ ...pageForm, form_type: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FORM_TYPES.map((ft) => (
                          <SelectItem key={ft} value={ft}>{ft}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Features (one per line)</Label>
                  <Textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={4} />
                </div>
                <div>
                  <Label>FAQs (format: Question|||Answer, one per line)</Label>
                  <Textarea value={faqsText} onChange={(e) => setFaqsText(e.target.value)} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>SEO Title</Label>
                    <Input
                      value={pageForm.seo_title}
                      onChange={(e) => setPageForm({ ...pageForm, seo_title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={pageForm.sort_order}
                      onChange={(e) => setPageForm({ ...pageForm, sort_order: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={pageForm.status === "published"}
                    onCheckedChange={(checked) =>
                      setPageForm({ ...pageForm, status: checked ? "published" : "draft" })
                    }
                  />
                  <Label>Publish immediately</Label>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Page
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={pkgOpen}
            onOpenChange={(open) => {
              setPkgOpen(open);
              if (!open) setEditingPkg(null);
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={!pages.length}
                onClick={() => {
                  setEditingPkg(null);
                  setPkgForm({ ...blankPackage, page_id: pages[0]?.id || "" });
                  setPkgFeaturesText("");
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPkg ? "Edit" : "New"} Package</DialogTitle>
              </DialogHeader>
              <form onSubmit={savePackage} className="space-y-3">
                <div>
                  <Label>Service Page</Label>
                  <Select value={pkgForm.page_id} onValueChange={(v) => setPkgForm({ ...pkgForm, page_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select page" /></SelectTrigger>
                    <SelectContent>
                      {pages.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Package Name</Label>
                  <Input
                    value={pkgForm.name}
                    onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Tag / Badge</Label>
                  <Input value={pkgForm.tag} onChange={(e) => setPkgForm({ ...pkgForm, tag: e.target.value })} />
                </div>
                <div>
                  <Label>Payment Service Title</Label>
                  <Input
                    value={pkgForm.payment_service_title}
                    onChange={(e) => setPkgForm({ ...pkgForm, payment_service_title: e.target.value })}
                    placeholder="Exact title sent to checkout"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={pkgForm.price}
                      onChange={(e) => setPkgForm({ ...pkgForm, price: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Original Price</Label>
                    <Input
                      type="number"
                      value={pkgForm.original_price}
                      onChange={(e) => setPkgForm({ ...pkgForm, original_price: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Checkout Form Override</Label>
                  <Select
                    value={pkgForm.form_type || pageForm.form_type}
                    onValueChange={(v) => setPkgForm({ ...pkgForm, form_type: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Use page default" /></SelectTrigger>
                    <SelectContent>
                      {FORM_TYPES.map((ft) => (
                        <SelectItem key={ft} value={ft}>{ft}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Features (one per line)</Label>
                  <Textarea
                    value={pkgFeaturesText}
                    onChange={(e) => setPkgFeaturesText(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pkgForm.is_popular}
                      onCheckedChange={(v) => setPkgForm({ ...pkgForm, is_popular: v })}
                    />
                    <Label>Popular</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={pkgForm.is_active}
                      onCheckedChange={(v) => setPkgForm({ ...pkgForm, is_active: v })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Package
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <Tabs defaultValue="pages">
        <TabsList>
          <TabsTrigger value="pages"><FileText className="w-4 h-4 mr-2" />Pages</TabsTrigger>
          <TabsTrigger value="packages"><Package className="w-4 h-4 mr-2" />Packages</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-3 mt-4">
          {pages.map((page) => (
            <div key={page.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold">{page.title}</p>
                  <Badge variant={page.status === "published" ? "default" : "secondary"}>
                    {page.status}
                  </Badge>
                  <Badge variant="outline">{page.page_type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {page.route} · {page.category || "Uncategorized"} · Form: {page.form_type}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(packagesByPage.get(page.id) || []).length} package(s)
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => togglePublish(page)}>
                  <Globe className="w-4 h-4 mr-1" />
                  {page.status === "published" ? "Unpublish" : "Publish"}
                </Button>
                <Button size="icon" variant="outline" onClick={() => openEditPage(page)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={async () => {
                    if (!confirm("Delete this page and all its packages?")) return;
                    await supabase.from("service_pages").delete().eq("id", page.id);
                    reloadPages();
                    reloadPackages();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="packages" className="space-y-3 mt-4">
          {packages.map((pkg) => {
            const page = pages.find((p) => p.id === pkg.page_id);
            return (
              <div key={pkg.id} className="border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{pkg.name}</p>
                    {pkg.is_popular && <Badge>Popular</Badge>}
                    {!pkg.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {page?.title || "Unknown page"} · {formatINR(Number(pkg.price))}
                    {pkg.original_price ? ` (was ${formatINR(Number(pkg.original_price))})` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setEditingPkg(pkg);
                      setPkgForm({
                        page_id: pkg.page_id,
                        name: pkg.name,
                        tag: pkg.tag || "",
                        description: pkg.description || "",
                        price: Number(pkg.price),
                        original_price: Number(pkg.original_price || 0),
                        gst_rate: Number(pkg.gst_rate),
                        features: pkg.features || [],
                        excluded: pkg.excluded || [],
                        form_type: pkg.form_type || "",
                        payment_service_title: pkg.payment_service_title || "",
                        is_popular: pkg.is_popular,
                        is_active: pkg.is_active,
                        sort_order: pkg.sort_order,
                      });
                      setPkgFeaturesText((pkg.features || []).join("\n"));
                      setPkgOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={async () => {
                      if (!confirm("Delete package?")) return;
                      await supabase.from("service_packages").delete().eq("id", pkg.id);
                      reloadPackages();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}
