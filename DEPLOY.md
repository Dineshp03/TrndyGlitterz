# 🚀 Deployment Guide: Trendy Glitterz

Your code is ready for production. Follow these steps to deploy:

## 1. Connect to Vercel
- Log in to [Vercel](https://vercel.com) with GitHub.
- Import the `TrndyGlitterz` repository.

## 2. Setting Environment Variables
You must add these variables in Vercel Project Settings -> Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Refer to your local `.env.local` for the actual values.

## 3. Database Migration
If you are setting up a fresh Supabase instance, run all `.sql` files in this repository in the Supabase SQL Editor.
