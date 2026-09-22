import { useEffect, useMemo, useState } from "react";
import { Camera, Lock, Mail, Phone, Save, UserRound } from "lucide-react";
import Button from "../../components/Button";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { changePassword, getProfile, updateProfile } from "../../store/slice/authSlice";

interface ProfileFormState {
  name: string;
  email: string;
  mobile: string;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialProfileForm = (): ProfileFormState => ({
  name: "",
  email: "",
  mobile: "",
});

const initialPasswordForm = (): PasswordFormState => ({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, updateProfileLoading, isLoading } = useAppSelector((state) => state.auth);

  const [profileForm, setProfileForm] = useState<ProfileFormState>(initialProfileForm);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(initialPasswordForm);
  const [profilePhoto, setProfilePhoto] = useState<string>(user?.profilePhoto || "");

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
      });
      setProfilePhoto(user.profilePhoto || "");
    }
  }, [user]);

  const fullName = useMemo(() => {
    return profileForm.name || user?.name || "Admin User";
  }, [profileForm.name, user?.name]);

  const handleProfileChange = (field: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await dispatch(
      updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        mobile: profileForm.mobile,
        profilePhoto,
      }),
    );
    dispatch(getProfile());
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    await dispatch(
      changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      }),
    );

    setPasswordForm(initialPasswordForm());
  };

  const updatePhotoFromUrl = () => {
    const url = window.prompt("Paste a profile image URL", profilePhoto || "");
    if (url) {
      setProfilePhoto(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}`}
              alt={fullName}
              className="h-20 w-20 rounded-full object-cover border border-slate-200"
            />
            <button
              type="button"
              onClick={updatePhotoFromUrl}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-[#3A29AA] text-white shadow-md"
              aria-label="Update profile photo"
            >
              <Camera size={14} />
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">Profile</p>
            <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
            <p className="text-sm text-slate-500">{user?.role || "admin"}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <div className="font-medium text-slate-800">Contact</div>
          <div>{user?.email || "admin@example.com"}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <UserRound size={18} className="text-[#3A29AA]" />
            <h2 className="text-lg font-semibold text-slate-900">Account details</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
              <input
                value={profileForm.name}
                onChange={(e) => handleProfileChange("name", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-[#3A29AA] focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <div className="relative">
                <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#3A29AA] focus:bg-white"
                />
              </div>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Mobile</span>
              <div className="relative">
                <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={profileForm.mobile}
                  onChange={(e) => handleProfileChange("mobile", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#3A29AA] focus:bg-white"
                />
              </div>
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={updateProfileLoading || isLoading} leftIcon={<Save size={16} />}>
              {updateProfileLoading ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Lock size={18} className="text-[#3A29AA]" />
            <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Current password</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3A29AA] focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3A29AA] focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3A29AA] focus:bg-white"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="outline" disabled={isLoading}>
              Update password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
