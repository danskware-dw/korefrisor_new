import { redirect } from "next/navigation";

type Params = { token: string };

export default async function AflysRedirectPage({ params }: { params: Promise<Params> }) {
  const { token } = await params;
  redirect(`/aftale/${token}`);
}
