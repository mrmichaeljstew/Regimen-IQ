"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "🏠" },
    { name: "Patients", href: "/dashboard/patients", icon: "👤" },
    { name: "Interactions", href: "/dashboard/interactions", icon: "⚠️" },
    { name: "Research", href: "/dashboard/research", icon: "🔬" },
    { name: "Appointments", href: "/dashboard/appointments", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/dashboard">
                  <h1 className="text-xl font-bold text-gray-900">
                    RegimenIQ
                  </h1>
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center border-b-2 px-3 pt-1 text-sm font-medium ${
                        isActive
                          ? "border-blue-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Global Search */}
            <div className="flex flex-1 items-center justify-center px-2 lg:ml-6 lg:justify-end">
              <div className="w-full max-w-lg lg:max-w-xs">
                <form onSubmit={handleSearch} className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-400">🔍</span>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Search patients, meds, research..."
                  />
                </form>
              </div>
            </div>

            <div className="flex items-center">
              <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                <span className="mr-4 text-sm text-gray-700">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign out
                </button>
              </div>
              <div className="flex items-center sm:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? "✕" : "☰"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                      isActive
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 pt-4">
                <div className="px-4 pb-2 text-sm text-gray-500">
                  {user?.name || user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Medical Disclaimer Banner */}
      <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-2">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-xs text-yellow-800">
            ⚠️ <strong>Medical Disclaimer:</strong> This application is for
            informational purposes only. Always consult qualified healthcare
            professionals before making any medical decisions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-24 sm:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white sm:hidden">
        <div className="flex h-16 items-center justify-around">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center px-2 py-1 ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            RegimenIQ © {new Date().getFullYear()} · Not a substitute for
            professional medical advice
          </p>
        </div>
      </footer>
    </div>
  );
}
