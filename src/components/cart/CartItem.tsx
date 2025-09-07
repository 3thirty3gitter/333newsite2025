'use client';

import Image from 'next/image';
import { X, Plus, Minus } from 'lucide-react';
import type { CartItem as CartItemType } from '@/lib/types';
import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.product.id, newQuantity);
  };

  return (
    <div className="flex items-start gap-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex-1">
        <Link href={`/products/${item.product.id}`} className="font-semibold hover:underline">
          {item.product.name}
        </Link>
        <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)}</p>
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
            className="h-8 w-14 text-center"
            min="1"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={() => removeFromCart(item.product.id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove item</span>
      </Button>
    </div>
  );
}
