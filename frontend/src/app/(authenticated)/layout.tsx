import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token');

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Cookie: `access_token=${token.value}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[-10%] top-[-20%] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-5%] top-[10%] h-[260px] w-[260px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[20%] h-[260px] w-[260px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <Navbar user={user} />
      <main className="container mx-auto max-w-6xl px-4 pb-6 pt-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
