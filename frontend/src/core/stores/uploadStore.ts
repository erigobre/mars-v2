import { create } from "zustand";
import { persist } from "zustand/middleware";

type UploadState = {
  activeUpload: {
    jobId: string;
    batchUuid: string;
  } | null;
};

type UploadActions = {
  setActiveUpload: (jobId: string, batchUuid: string) => void;
  clearActiveUpload: () => void;
};

export const useUploadStore = create<UploadState & UploadActions>()(
  persist(
    (set) => ({
      activeUpload: null,

      setActiveUpload: (jobId, batchUuid) =>
        set({ activeUpload: { jobId, batchUuid } }),

      clearActiveUpload: () => set({ activeUpload: null }),
    }),
    { name: "upload-storage" }
  )
);
