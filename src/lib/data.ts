import { db } from './firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Product, Category } from './types';

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

export async function updateProduct(id: string, product: Partial<Omit<Product, 'id'>>): Promise<void> {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, product);
}

export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
}

export async function getCategories(): Promise<Category[]> {
    const categoriesCol = collection(db, 'categories');
    const categorySnapshot = await getDocs(categoriesCol);
    const categoryList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    return categoryList.sort((a, b) => a.name.localeCompare(b.name));
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<string> {
    const categoriesCol = collection(db, 'categories');
    const docRef = await addDoc(categoriesCol, category);
    return docRef.id;
}
