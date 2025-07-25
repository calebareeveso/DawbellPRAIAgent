"use client";

import Link from "next/link";

export default function MainPage() {
  return (
    <section className="flex justify-center items-center h-screen">
      <Link
        href="/agent"
        className="bg-primary text-white px-4 py-2 rounded-sm"
      >
        Start Agent
      </Link>
    </section>
  );
}
