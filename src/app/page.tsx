import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (role === "ADMIN") redirect("/admin");
  if (role === "YAYASAN") redirect("/yayasan");
  if (role === "ORANG_TUA") redirect("/ortu");
  redirect("/guru");
}
