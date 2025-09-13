
'use client';

import Link from 'next/link';
import { ShoppingBag, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartIcon } from '../cart/CartIcon';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { MenuItem, ThemeSettings } from '@/lib/types';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '../ui/navigation-menu';
import React from 'react';


const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";


const Logo = ({ logoUrl, logoWidth }: { logoUrl?: string, logoWidth?: number }) => (
    <Link href="/" className="flex items-center space-x-2">
      {logoUrl ? (
        <Image src={logoUrl} alt="CommerceCraft Logo" width={logoWidth || 140} height={40} style={{ objectFit: 'contain', width: `${logoWidth || 140}px`, height: 'auto' }} />
      ) : (
        <>
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline inline-block">CommerceCraft</span>
        </>
      )}
    </Link>
);

const HeaderActions = () => (
     <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/admin">
          <Crown className="h-5 w-5" />
          <span className="sr-only">Admin Dashboard</span>
        </Link>
      </Button>
      <CartIcon />
    </div>
);


export function Header({ settings }: { settings: ThemeSettings }) {
    const { logoUrl, logoWidth, menuItems = [] } = settings;

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex items-center justify-between py-2">
                <div className="mr-6">
                    <Logo logoUrl={logoUrl} logoWidth={logoWidth} />
                </div>

                <NavigationMenu>
                    <NavigationMenuList>
                        {menuItems.map((item: MenuItem, index: number) => (
                            <NavigationMenuItem key={index}>
                                {item.menuType === 'simple' && item.children && item.children.length > 0 ? (
                                    <>
                                    <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                            {item.children.map((child) => (
                                                <ListItem key={child.label} href={child.href} title={child.label}>
                                                    {child.description}
                                                </ListItem>
                                            ))}
                                        </ul>
                                    </NavigationMenuContent>
                                    </>
                                ) : item.menuType === 'mega' && item.megaMenu && item.megaMenu.length > 0 ? (
                                    <>
                                    <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="grid w-[600px] gap-3 p-4 md:w-[700px] md:grid-cols-4 lg:w-[800px]">
                                            {item.megaMenu.map((column) => (
                                                <div key={column.title} className="flex flex-col">
                                                    <h3 className="font-medium text-lg text-foreground px-3 py-2">{column.title}</h3>
                                                    <ul>
                                                        {column.children.map((child) => (
                                                            <ListItem key={child.label} href={child.href} title={child.label}>
                                                              {child.description}
                                                            </ListItem>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </NavigationMenuContent>
                                    </>
                                ) : (
                                    <NavigationMenuLink asChild>
                                        <Link href={item.href} className={navigationMenuTriggerStyle()}>
                                            {item.label}
                                        </Link>
                                    </NavigationMenuLink>
                                )}
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="flex-1" />
                <HeaderActions />
            </div>
        </header>
    )
}
