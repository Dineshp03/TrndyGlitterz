import { SignIn } from "@clerk/nextjs";

export function generateStaticParams() {
  return [{ login: [""] }];
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] pt-28 pb-12">
      <SignIn routing="path" path="/login" />
    </div>
  );
}
