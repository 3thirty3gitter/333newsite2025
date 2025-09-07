import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function OrderConfirmationPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 md:py-24">
      <Card className="text-center">
        <CardHeader className="items-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <CardTitle className="text-3xl font-headline">Thank You for Your Order!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Your order has been placed successfully. A confirmation email has been sent to you (simulated).
          </p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
