"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { get, putForm, postForm } from "@/lib/api";
import { needsCompletion } from "@/lib/auth";
import { toPublicUrl } from "@/lib/url";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Camera,
  User2,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
} from "lucide-react";

const COUNTRIES = [
  "Nepal", "India", "Bangladesh", "Pakistan", "Sri Lanka", "Bhutan", "Maldives",
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan",
];

const STEPS = [
  { id: 1, title: "Basic info", icon: User2 },
  { id: 2, title: "Contact", icon: Phone },
  { id: 3, title: "Address", icon: MapPin },
  { id: 4, title: "Identity", icon: ShieldCheck },
];

export default function ProfileSetupWizard() {
  const { token, refreshUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [postalCode, setPostal] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const [kycFront, setKycFront] = useState<File | null>(null);
  const [kycFrontPreview, setKycFrontPreview] = useState<string>("");
  const [kycBack, setKycBack] = useState<File | null>(null);
  const [kycBackPreview, setKycBackPreview] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        setLoading(true);
        const me = await get<{ user: any }>("/auth/me", token);
        const u = me?.user;
        setName(String(u?.name ?? ""));
        setDob(u?.dob ? String(u.dob).slice(0, 10) : "");
        setCountry(String(u?.country ?? ""));
        setPhone(String(u?.phone ?? ""));
        setStreet(String(u?.street ?? ""));
        setCity(String(u?.city ?? ""));
        setStateVal(String(u?.state ?? ""));
        setPostal(String(u?.postalCode ?? ""));
        setAvatarPreview(toPublicUrl(String(u?.avatarUrl ?? "")) ?? "");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const completion = useMemo(() => {
    const req = [name, country, phone, street, city, stateVal, postalCode];
    const filled = req.filter((v) => v && v.trim().length > 0).length;
    return Math.round((filled / req.length) * 100);
  }, [name, country, phone, street, city, stateVal, postalCode]);

  const step1Valid = useMemo(() => name.trim().length > 0, [name]);
  const step2Valid = useMemo(() => country && phone.trim().length > 0, [country, phone]);
  const step3Valid = useMemo(
    () => street.trim().length > 0 && city.trim().length > 0 && stateVal.trim().length > 0 && postalCode.trim().length > 0,
    [street, city, stateVal, postalCode]
  );
  const step4Valid = useMemo(() => !!kycFront && !!kycBack, [kycFront, kycBack]);

  const canProceed = step === 1 ? step1Valid : step === 2 ? step2Valid : step === 3 ? step3Valid : step4Valid;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAvatar(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : "");
  }

  async function onSubmit() {
    setError(null);
    setSaving(true);
    try {
      const fd = new FormData();
      if (avatar) fd.append("avatar", avatar);
      fd.append("name", name);
      if (dob) fd.append("dob", dob);
      fd.append("country", country);
      fd.append("phone", phone);
      fd.append("street", street);
      fd.append("city", city);
      fd.append("state", stateVal);
      fd.append("postalCode", postalCode);

      await putForm("/profile", fd);

      // Submit KYC if files are selected
      if (kycFront && kycBack) {
        const kycFd = new FormData();
        kycFd.append("front", kycFront);
        kycFd.append("back", kycBack);
        await postForm("/profile/verify-identity", kycFd);
      }

      const updated = await refreshUser();
      if (updated && !needsCompletion(updated)) {
        router.replace("/profile");
      } else {
        router.replace("/profile/setup");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function onSkip() {
    router.replace("/");
  }

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Profile completion</span>
          <span className="font-medium text-foreground">{completion}%</span>
        </div>
        <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 text-sm ${
                step >= s.id ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step > s.id ? "bg-primary text-white" : step === s.id ? "bg-primary text-white" : "bg-[#E2E8F0]"
                }`}
              >
                {step > s.id ? <Check className="w-3 h-3" /> : s.id}
              </div>
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Let&apos;s start with the basics
              </h2>
              <p className="text-sm text-muted-foreground">
                Your name and photo help others recognize you.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Profile photo
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center ring-2 ring-[#E2E8F0]">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User2 className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm font-medium text-foreground cursor-pointer hover:bg-[#F1F5F9] transition-colors">
                    <Camera size={18} />
                    Upload photo
                    <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">JPG or PNG, max 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Full name <span className="text-destructive">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we call you?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date of birth
              </label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                How can we reach you?
              </h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ll use this for account verification and important updates.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Country <span className="text-destructive">*</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Phone <span className="text-destructive">*</span>
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                required
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Include country code for international calls
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Address */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Where are you based?
              </h2>
              <p className="text-sm text-muted-foreground">
                This helps with contracts and payment verification.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Street address <span className="text-destructive">*</span>
              </label>
              <Input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Main Street"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  City <span className="text-destructive">*</span>
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  State / Province <span className="text-destructive">*</span>
                </label>
                <Input
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  placeholder="State"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  ZIP / Postal <span className="text-destructive">*</span>
                </label>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostal(e.target.value)}
                  placeholder="12345"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Identity Verification */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Identity Verification (KYC)
              </h2>
              <p className="text-sm text-muted-foreground">
                Please upload clear photos of your citizenship (Front & Back). This helps us verify your identity and maintain a secure platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Front Image */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Citizenship Front <span className="text-destructive">*</span>
                </label>
                <div 
                  className={`relative aspect-[3/2] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-colors ${
                    kycFrontPreview ? "border-primary/50 bg-primary/5" : "border-[#E2E8F0] hover:border-primary/30 hover:bg-[#F8FAFC]"
                  }`}
                >
                  {kycFrontPreview ? (
                    <img src={kycFrontPreview} alt="Front" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-center text-muted-foreground">Click to upload front image</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setKycFront(file);
                        setKycFrontPreview(URL.createObjectURL(file));
                      }
                    }} 
                  />
                </div>
              </div>

              {/* Back Image */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Citizenship Back <span className="text-destructive">*</span>
                </label>
                <div 
                  className={`relative aspect-[3/2] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-colors ${
                    kycBackPreview ? "border-primary/50 bg-primary/5" : "border-[#E2E8F0] hover:border-primary/30 hover:bg-[#F8FAFC]"
                  }`}
                >
                  {kycBackPreview ? (
                    <img src={kycBackPreview} alt="Back" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-center text-muted-foreground">Click to upload back image</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setKycBack(file);
                        setKycBackPreview(URL.createObjectURL(file));
                      }
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
              <div className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-xs text-blue-700 leading-relaxed">
                    <strong>Why is this required?</strong> To ensure the safety of our marketplace, we verify the identity of our members. Your documents are stored securely and used only for verification purposes.
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between">
          <div className="flex gap-3">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} />
                Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
            )}
          </div>
          <div>
            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed}
              >
                Continue
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={onSubmit} disabled={!canProceed || saving}>
                {saving ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Complete Profile
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
