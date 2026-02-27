"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { LogIn, LogOut, Loader2 } from "lucide-react"

export function AuthButton() {
  const { user, initialLoading, signIn, signOut, isAuthenticated, signingIn, signingOut } = useAuth()

  if (initialLoading) {
    // Blocking script in layout.tsx sets .nb-authed on <html> before hydration.
    // CSS shows the right skeleton instantly — no flash.
    return (
      <div className="flex items-center ml-auto">
        {/* Authed skeleton: avatar shape */}
        <div className="hidden [.nb-authed_&]:flex items-center gap-1.5 animate-pulse">
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-sm bg-gray-800" />
        </div>
        {/* Unauthed: empty space */}
        <div className="flex [.nb-authed_&]:hidden items-center h-8 min-w-[56px]" />
      </div>
    )
  }

  // During signout, keep showing the authed skeleton until page reloads
  if (signingOut) {
    return (
      <div className="flex items-center gap-1.5 ml-auto animate-pulse">
        <div className="h-7 w-7 md:h-8 md:w-8 rounded-sm bg-gray-800" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2 ml-auto">
        <Button onClick={signIn} variant="outline" size="sm" className="h-8 bg-transparent" disabled={signingIn}>
          {signingIn ? (
            <Loader2 className="h-4 w-4 animate-spin md:mr-2" />
          ) : (
            <LogIn className="h-4 w-4 md:mr-2" />
          )}
          <span className="hidden md:inline">{signingIn ? "Signing in..." : "Sign in"}</span>
        </Button>
      </div>
    )
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    user?.preferred_username?.[0]?.toUpperCase() ||
    "U"

  return (
    <div className="flex items-center gap-1.5 ml-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-0 cursor-pointer focus:outline-none">
            <Avatar className="h-7 w-7 md:h-8 md:w-8 rounded-sm">
              {user?.picture && (
                <Image
                  src={user.picture}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="aspect-square size-full rounded-sm"
                />
              )}
              <AvatarFallback className="rounded-sm text-xs">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium leading-none">{user?.name || user?.preferred_username || "User"}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="cursor-pointer" disabled={signingOut}>
            {signingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
