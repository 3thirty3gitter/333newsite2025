
import { getProductBySlug, getProductById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { ProductClientPage } from '@/components/products/ProductClientPage';

type ProductPageProps = {
    params: {
        slug: string;
    };
};

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = params;
    
    let product = await getProductBySlug(slug);
    
    if (!product) {
        product = await getProductById(slug);
    }

    if (!product || product.status !== 'active') {
        notFound();
    }

    return <ProductClientPage product={product} />;
}
