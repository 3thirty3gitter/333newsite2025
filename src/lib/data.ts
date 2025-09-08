import { db } from './firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Product, Category } from './types';

function toProduct(doc: any): Product {
    const data = doc.data();
    let images: string[] = [];
    if (data.images && Array.isArray(data.images)) {
        images = data.images;
    } else if (data.image) {
        images = [data.image];
    }

    return {
        id: doc.id,
        ...data,
        images: images,
    } as Product;
}

export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(toProduct);
  return productList;
}

export async function getProductById(id: string): Promise<Product | null> {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return toProduct(docSnap);
  } else {
    return null;
  }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const productsCol = collection(db, 'products');
  const newProduct = { ...product };
  if (!newProduct.images || newProduct.images.length === 0) {
      newProduct.images = [`https://picsum.photos/600/600?random=${Math.floor(Math.random() * 1000)}`];
  }
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

export async function updateCategory(id: string, newName: string): Promise<void> {
    const docRef = doc(db, 'categories', id);
    const oldCategorySnap = await getDoc(docRef);
    if (!oldCategorySnap.exists()) {
        throw new Error("Category not found");
    }
    const oldName = oldCategorySnap.data().name;

    // Update category name
    await updateDoc(docRef, { name: newName });

    // Update products that use this category
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where("category", "==", oldName));
    const querySnapshot = await getDocs(q);
    
    const batch = [];
    querySnapshot.forEach((productDoc) => {
        const productRef = doc(db, 'products', productDoc.id);
        batch.push(updateDoc(productRef, { category: newName }));
    });

    await Promise.all(batch);
}

export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, 'categories', id);
  await deleteDoc(docRef);
}
