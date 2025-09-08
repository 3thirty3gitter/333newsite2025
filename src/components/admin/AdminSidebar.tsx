
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Settings, Home, ShoppingBag, Folder, Palette, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/collections', label: 'Collections', icon: Folder },
  { href: '/admin/website-builder', label: 'Website Editor', icon: Palette },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
        <aside className={cn("flex-shrink-0 border-r bg-background transition-all duration-300 ease-in-out", isCollapsed ? 'w-16' : 'w-64')}>
        <div className="flex h-full flex-col">
            <div className={cn("flex items-center h-16 border-b", isCollapsed ? 'justify-center px-2' : 'px-6')}>
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className={cn("transition-opacity", isCollapsed ? 'opacity-0 w-0' : 'opacity-100')}>CommerceCraft</span>
            </Link>
            </div>
            <nav className="flex-1 p-2 space-y-2">
            <ul className="space-y-2">
                {navItems.map((item) => (
                <li key={item.href}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted',
                                (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) && 'bg-muted text-primary',
                                isCollapsed && 'justify-center'
                            )}
                            >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span className={cn("transition-opacity", isCollapsed ? 'sr-only' : 'opacity-100')}>{item.label}</span>
                            </Link>
                        </TooltipTrigger>
                        {isCollapsed && (
                            <TooltipContent side="right">
                                {item.label}
                            </TooltipContent>
                        )}
                    </Tooltip>
                </li>
                ))}
            </ul>
            </nav>
            <div className="mt-auto border-t p-2">
                <Button variant="ghost" className="w-full flex items-center gap-3 justify-center" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
                    <span className={cn(isCollapsed ? 'sr-only' : '')}>Collapse</span>
                </Button>
            </div>
        </div>
        </aside>
    </TooltipProvider>
  );
}
