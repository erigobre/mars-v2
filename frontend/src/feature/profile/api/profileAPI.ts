import api from "@/core/api/axios";
import type { ApiResponse } from "@/core/types";
import {
  type SellerProfileForm,
  type DistributorProfileForm,
  profileSchema,
  type Profile,
  type AdminProfileForm,
} from "../schemas/profileSchema";
import { safeValidate } from "@/core/utils/zodHelper";

type AnyProfileForm = SellerProfileForm | DistributorProfileForm | AdminProfileForm;

export async function getProfile(): Promise<Profile> {
  const { data } = await api.get<ApiResponse<Profile>>("/profile");
  return safeValidate(profileSchema, data.data);
}

export async function updateProfile(
  formData: AnyProfileForm,
  avatarFile?: File | null,
  role?: string
): Promise<ApiResponse<Profile>> {
  const fd = buildProfileFormData(formData, avatarFile, role);
  const { data } = await api.post<ApiResponse<Profile>>("/profile", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}


function buildProfileFormData(
  formData: AnyProfileForm,
  avatarFile?: File | null,
  role?: string
): FormData {
  const fd = new FormData();
  fd.append("_method", "PUT");

  if (formData.username?.trim()) fd.append("username", formData.username);
  if (formData.email?.trim()) fd.append("email", formData.email);
  if (formData.phone?.trim()) fd.append("phone", formData.phone);

  if (formData.password?.trim()) {
    fd.append("password", formData.password);
    fd.append("password_confirmation", formData.passwordConfirmation ?? "");
  }

  if (avatarFile) fd.append("avatar", avatarFile);

  // Campos exclusivos de seller
  if (role === "seller") {
    const sf = formData as SellerProfileForm;
    const addressFields: Record<string, string | null | undefined> = {
      address_street: sf.addressStreet,
      address_colonia: sf.addressColonia,
      address_city: sf.addressCity,
      address_state: sf.addressState,
      address_zip: sf.addressZip,
      shipping_notes: sf.shippingNotes,
    };
    // Los campos de dirección siempre se envían (pueden ser vacíos para limpiarlos)
    Object.entries(addressFields).forEach(([key, value]) => {
      if (value !== undefined) fd.append(key, value ?? "");
    });
  }

  // Campos exclusivos de distributor
  if (role === "distributor") {
    const df = formData as DistributorProfileForm;
    if (df.companyName?.trim()) fd.append("company_name", df.companyName);
  }

  return fd;
}
