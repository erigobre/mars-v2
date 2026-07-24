import { useEffect, useState } from "react";
import { MdPalette, MdSave } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import { useThemeQuery, useUpdateThemeMutation } from "../services/themeServices";
import type { ThemeMap } from "../api/themeAPI";

type FieldDef = {
  key: string;
  label: string;
  type: "color" | "text" | "url";
  placeholder?: string;
};

const FIELDS: FieldDef[] = [
  { key: "app_name",             label: "Nombre de la app",         type: "text",  placeholder: "Gana con Mars" },
  { key: "primary_color",        label: "Color primario",           type: "color" },
  { key: "secondary_color",      label: "Color secundario",         type: "color" },
  { key: "accent_color",         label: "Color acento",             type: "color" },
  { key: "seller_card_bg",       label: "Fondo tarjeta vendedor",   type: "color" },
  { key: "logo_url",             label: "URL del logo",             type: "url",   placeholder: "https://..." },
  { key: "background_image_url", label: "URL imagen de fondo login",type: "url",   placeholder: "https://..." },
  { key: "favicon_url",          label: "URL del favicon",          type: "url",   placeholder: "https://..." },
];

export default function ThemeSettingsView() {
  usePageBreadcrumbs([{ label: "Configuración" }, { label: "Tema" }]);

  const { data: theme, isLoading } = useThemeQuery();
  const { mutate: save, isPending } = useUpdateThemeMutation();
  const [form, setForm] = useState<ThemeMap>({});

  useEffect(() => {
    if (theme) setForm(theme);
  }, [theme]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    save(form);
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Tema y Apariencia" subtitle="Personaliza colores, logo e imágenes del sistema." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          {FIELDS.map((f) => (
            <div key={f.key} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Tema y Apariencia" subtitle="Personaliza colores, logo e imágenes del sistema.">
        <Button
          variant="primary"
          leftIcon={<MdSave className="text-xl" />}
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">{field.label}</label>
            {field.type === "color" ? (
              <div className="flex items-center gap-3 h-11 px-3 rounded-xl border border-gray-200 bg-gray-50">
                <input
                  type="color"
                  value={form[field.key] || "#ffffff"}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-sm font-mono text-gray-600">{form[field.key] || ""}</span>
              </div>
            ) : (
              <input
                type={field.type === "url" ? "url" : "text"}
                value={form[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            )}
          </div>
        ))}
      </div>

      {/* Vista previa de colores */}
      <div className="mt-8 max-w-2xl">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Vista previa</h3>
        <div className="flex gap-3 flex-wrap">
          {["primary_color", "secondary_color", "accent_color", "seller_card_bg"].map((key) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg shadow-sm border border-black/10"
                style={{ backgroundColor: form[key] || "#ccc" }}
              />
              <span className="text-xs text-gray-500">{key.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
