
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useHistory } from '@/context/HistoryProvider';
import { Star, Pencil, FileText } from 'lucide-react';
import { ProductRecommendations } from '@/components/products/ProductRecommendations';
import { Separator } from '@/components/ui/separator';
import type { Product, Variant } from '@/lib/types';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import Link from 'next/link';
import { QuoteRequestDialog } from '@/components/products/QuoteRequestDialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FormItem } from '@/components/ui/form';
import { Button } from '../ui/button';

function VariantSelector({ variant, selectedOptions, onOptionSelect }: { variant: Variant, selectedOptions: Record<string, string>, onOptionSelect: (type: string, value: string) => void }) {
    return (
        <div className="space-y-3">
            <Label className="font-semibold">{variant.type}</Label>
            <RadioGroup
                value={selectedOptions[variant.type]}
                onValueChange={(value) => onOptionSelect(variant.type, value)}
                className="flex flex-wrap items-center gap-2"
            >
                {variant.options.map((option) => (
                     <FormItem key={option.value} className="flex items-center space-x-0 space-y-0">
                        <RadioGroupItem value={option.value} id={`${variant.type}-${option.value}`} className="sr-only" />
                        <Label
                            htmlFor={`${variant.type}-${option.value}`}
                            className={cn(
                                "cursor-pointer rounded-md border-2 border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground",
                                selectedOptions[variant.type] === option.value && "border-primary bg-primary/10 text-primary"
                            )}
                        >
                            {option.value}
                        </Label>
                    </FormItem>
                ))}
            </RadioGroup>
        </div>
    )
}

export function ProductClientPage({ product }: { product: Product }) {
  const { addToHistory } = useHistory();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      addToHistory(product.id);
      const initialSelections: Record<string, string> = {};
      product.variants.forEach(v => {
          if(v.options.length > 0) {
              initialSelections[v.type] = v.options[0].value;
          }
      });
      setSelectedOptions(initialSelections);
    }
  }, [product, addToHistory]);

  const handleOptionSelect = (type: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [type]: value }));
  };

  const selectedVariantCombination = useMemo(() => {
      if (!product || product.variants.length === 0) return null;
      const idParts = product.variants.map(v => selectedOptions[v.type]).filter(Boolean);
      if (idParts.length !== product.variants.length) return null;
      return idParts.join('-');
  }, [product, selectedOptions]);

  const selectedInventoryItem = useMemo(() => {
      if (!product || !selectedVariantCombination) return null;
      return product.inventory.find(item => item.id === selectedVariantCombination);
  }, [product, selectedVariantCombination]);

  const displayPrice = selectedInventoryItem?.price ?? product?.price ?? 0;

  const displayImage = useMemo(() => {
    if (!product) return '';
    
    const colorVariant = product.variants.find(v => v.type.toLowerCase().includes('color'));
    
    if (colorVariant) {
      const selectedColorValue = selectedOptions[colorVariant.type];
      const colorOption = colorVariant.options.find(opt => opt.value === selectedColorValue);
      if (colorOption?.image) {
        return colorOption.image;
      }
    }
    
    return product.images[0];
  }, [product, selectedOptions]);

  return (
    <>
      <QuoteRequestDialog 
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        productName={product.name}
      />
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <ProductImageGallery images={product.images || []} mainImage={displayImage} />
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-sm font-medium text-primary bg-primary/10 py-1 px-3 rounded-full">
                {product.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2 mb-4">
              <div className="flex text-accent">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-muted stroke-accent" />
              </div>
              <span className="text-sm text-muted-foreground">(123 reviews)</span>
            </div>
            <p className="text-3xl font-bold text-primary mb-6">${displayPrice.toFixed(2)}</p>
            
            <div className="space-y-6 mb-6">
                {product.variants.map((variant) => (
                    <VariantSelector 
                        key={variant.type} 
                        variant={variant}
                        selectedOptions={selectedOptions}
                        onOptionSelect={handleOptionSelect}
                    />
                ))}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
            
            <div className="mt-auto pt-6 space-y-4">
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link href={`/design?productId=${product.id}`}>
                      <Pencil className="mr-2" />
                      Design Your Own
                  </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => setIsQuoteModalOpen(true)}>
                  <FileText className="mr-2" />
                  Request a Quote
              </Button>
            </div>
          </div>
        </div>
        <Separator className="my-12" />
        <ProductRecommendations currentProductId={product.id} />
      </div>
    </>
  );
}
