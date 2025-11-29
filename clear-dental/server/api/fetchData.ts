import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readBody, createError } from "h3";

interface FetchBody {
  table: string; // e.g. "entries"
}

// Main handler
export default defineEventHandler(async (event) => {
  const body = await readBody<FetchBody>(event);

  if (!body?.table) {
    throw createError({
      statusCode: 400,
      statusMessage: "Table name is required",
    });
  }

  const client = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);

  // Require auth
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    });
  }

  // Load profile to check role / banned
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role, banned")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to load profile",
    });
  }

  if (profile.banned) {
    throw createError({
      statusCode: 403,
      statusMessage: "User is banned",
    });
  }

  const isAdmin = profile.role === "admin";

  // Use a helper to fetch table data, with role-aware filtering
  const { data, error } = await getTableData(client, body.table, user.id, isAdmin);

  if (error && error.message) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }

  return data;
});

// Role-aware query
async function getTableData(
  client: SupabaseClient,
  tableName: string,
  userId: string,
  isAdmin: boolean
) {
  let query = client.from(tableName).select("*").order("created_at", { ascending: false });

  // For this OA we assume your main table has a user_id column (entries table)
  // Admins see everything, basic users only see their own rows
  if (!isAdmin) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  return { data, error };
}

// Keeping this here if you later use storage
async function getStorageUrl(client: SupabaseClient, body: any) {
  const { data } = await client.storage
    .from(body.bucket)
    .getPublicUrl(body.fileName);

  return data;
}
