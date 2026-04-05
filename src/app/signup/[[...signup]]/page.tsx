import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] pt-28 pb-12">
      <SignUp routing="path" path="/signup" />
    </div>
  );
}
