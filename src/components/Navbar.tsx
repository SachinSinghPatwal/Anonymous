"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import { Button } from "./ui/button";

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user as User;
  return (
    <nav className="p-4 md:p-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <a className="text-lg font-semibold" href="#">
          Mystery Message
        </a>
        {session ? (
          <>
            <span className="mr-4">Welcome, {user?.name || user?.email}</span>{" "}
            <Button className="w-full md:w-auto" onClick={() => signOut()}>
              Sign Out
            </Button>
          </>
        ) : (
          <Link href="/signIn">
            <Button>Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
