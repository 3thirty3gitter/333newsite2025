
import { QuoteRequestDialog } from "@/components/products/QuoteRequestDialog";

export default function RequestAQuotePage() {
  return (
    <div className="container mx-auto py-12">
        <div className="max-w-xl mx-auto">
            <QuoteRequestDialog isOpen={true} onClose={() => {}} productName="" isPage={true} />
        </div>
    </div>
  );
}
