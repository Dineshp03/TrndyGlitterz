import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key so uploads bypass RLS policies
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Generate a unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Convert File to ArrayBuffer then Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return NextResponse.json(
        { error: error.message || "Upload failed" },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl }, { status: 200 });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
