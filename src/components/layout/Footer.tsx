import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} CommerceCraft. All rights reserved.
          </p>
        </div>
        {/* Social links or other footer content can go here */}
      </div>
    </footer>
  );
}
