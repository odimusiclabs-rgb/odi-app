import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "odimusic.office@gmail.com";

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError("Missing authorization header", 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const client = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      return jsonError("Unauthorized", 401);
    }

    const { data: profile } = await client
      .from("profiles")
      .select("email, role")
      .eq("id", userData.user.id)
      .maybeSingle();

    const isAdmin = profile?.email === ADMIN_EMAIL || profile?.role === "admin";
    if (!isAdmin) {
      return jsonError("Forbidden: admin access required", 403);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    if (req.method === "GET") {
      const { data, error } = await serviceClient
        .from("profiles")
        .select("id, name, email, role, created_at")
        .order("created_at", { ascending: true });

      if (error) return jsonError("Failed to fetch users", 500);
      return jsonResponse({ users: data as ProfileRow[] });
    }

    if (req.method === "DELETE") {
      const { userId } = await req.json();
      if (!userId || typeof userId !== "string") {
        return jsonError("Missing userId", 400);
      }
      if (userId === userData.user.id) {
        return jsonError("Cannot delete your own admin account", 400);
      }

      const { error: deleteError } = await serviceClient.auth.admin.deleteUser(userId);
      if (deleteError) return jsonError("Failed to delete user", 500);

      return jsonResponse({ success: true });
    }

    if (req.method === "POST") {
      const { userId } = await req.json();
      if (!userId || typeof userId !== "string") {
        return jsonError("Missing userId", 400);
      }
      if (userId === userData.user.id) {
        return jsonError("Cannot reset your own admin password", 400);
      }

      const { data: targetProfile } = await serviceClient
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .maybeSingle();

      if (!targetProfile?.email) return jsonError("User not found", 404);

      const tempPassword = generateTempPassword();

      const { error: updateError } = await serviceClient.auth.admin.updateUserById(
        userId,
        { password: tempPassword }
      );

      if (updateError) return jsonError("Failed to reset password", 500);

      return jsonResponse({ email: targetProfile.email, tempPassword });
    }

    return jsonError("Method not allowed", 405);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return jsonError(message, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  let password = "";
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  for (let i = 0; i < 16; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}
