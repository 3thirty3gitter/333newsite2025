import { db } from './firebase';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import type { Product } from './types';

export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  return productList;
}

export async function getProductById(id: string): Promise<Product | null> {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  } else {
    return null;
  }
}

export async function addProduct(product: Omit<Product, 'id' | 'image'> & { image?: string }): Promise<string> {
  const productsCol = collection(db, 'products');
  const newProduct = {
    ...product,
    image: product.image || `https://picsum.photos/600/600?random=${Math.floor(Math.random() * 1000)}`,
  };
  const docRef = await addDoc(productsCol, newProduct);
  return docRef.id;
}
