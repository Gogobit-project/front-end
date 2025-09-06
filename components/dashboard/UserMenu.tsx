"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, LogOut, Settings } from "lucide-react";
import { copyToClipboard } from "@/lib/utils"; // Menggunakan utilitas yang sudah dibuat
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

interface UserMenuProps {
  account: string | null;
  disconnect: () => void;
}

export function UserMenu({ account, disconnect }: UserMenuProps) {
  if (!account) return null;

  const handleCopyAddress = () => {
    copyToClipboard(account);
    // Anda bisa menambahkan notifikasi "Copied!" di sini
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-indigo-300/30 text-indigo-200 hover:bg-indigo-400/10 bg-transparent">
          <Avatar className="w-6 h-6 mr-2">
            <AvatarImage src="/generic-user-avatar.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          {account.slice(0, 6)}...{account.slice(-4)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
