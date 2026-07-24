import type { Profile } from "@/feature/profile/schemas/profileSchema";
import { MdBadge } from "react-icons/md";

type ProfileHeaderProps = {
  profile?: Profile;
};

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="bg-theme-secondary p-6 md:p-10 flex flex-col md:flex-row items-center gap-5 md:gap-8 border-b border-white/10 rounded-t-2xl md:rounded-t-3xl shadow-sm">
      {/* Avatar Container */}
      <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white/30 overflow-hidden shadow-lg shadow-black/10 bg-white shrink-0 transition-transform hover:scale-105 duration-300">
        <img
          src={
            profile?.avatarUrl ||
            `https://ui-avatars.com/api/?name=${
              profile?.username || "Usuario"
            }&background=random`
          }
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Container */}
      <div className="text-center md:text-left flex-1">
        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
          {profile?.username}
        </h2>

        <div className="flex flex-wrap justify-center md:justify-start gap-3">
          {profile?.employeeCode && (
            <div className="bg-white px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-2 border border-white/20 backdrop-blur-md shadow-sm">
              <MdBadge className="text-theme-text-dark text-lg md:text-xl" />
              <span className="text-theme-text-dark text-sm md:text-base font-semibold tracking-wide">
                {profile.employeeCode}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
