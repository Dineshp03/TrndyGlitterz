"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { useUserStore } from "@/store/useUserStore";

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The jewellery is stunning and delivery was super fast.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/64.jpg",
    name: "Priya Sharma",
    handle: "@priyastyles",
    text: "My go-to for gifting. Every piece is beautifully packaged and feels luxurious.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/32.jpg",
    name: "Ananya Rao",
    handle: "@ananyacreates",
    text: "I've ordered 5 times already! The quality is unmatched and the styles are so on-trend.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUserStore();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    if (!email || !password) {
      alert("Please fill in your email and password.");
      return;
    }

    const result = login(email, password);
    if (result.success) {
      const state = useUserStore.getState();
      router.push(state.isAdmin ? "/admin" : "/profile");
    } else {
      alert(result.error || "Login failed. Please check your credentials.");
    }
  };

  const handleGoogleSignIn = () => {
    alert("Google Sign-In is not configured yet.");
  };

  const handleResetPassword = () => {
    alert("A password reset link would be sent to your email.");
  };

  const handleCreateAccount = () => {
    router.push("/signup");
  };

  return (
    <SignInPage
      title={
        <>
          Welcome back to{" "}
          <span className="font-serif italic text-dustyrose">TRENDY GLITTERZ</span>
        </>
      }
      description="Sign in to access your curated profile, order history, and exclusive member benefits."
      heroImageSrc="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1400&q=80"
      testimonials={sampleTestimonials}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
}
