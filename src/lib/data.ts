

import { db, storage } from './firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product, Collection, Customer } from './types';
import { generateFilename } from '@/ai/flows/generate-filename';

function toProduct(doc: any): Product {
    const data = doc.data();
    // Ensure images is an array and has at least one image.
    const images = data.images && Array.isArray(data.images) && data.images.length > 0 
        ? data.images 
        : [`https://picsum.photos/600/600?random=${Math.floor(Math.random() * 1000)}`];

    return {
        id: doc.id,
        ...data,
        images,
    } as Product;
}

export async function uploadImageAndGetURL(dataUrl: string, folder: string, fileNameContext?: string): Promise<string> {
    
    let fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
    
    if (fileNameContext) {
        try {
            const result = await generateFilename({ context: fileNameContext });
            if (result.filename) {
                fileName = `${folder}/${result.filename}`;
            }
        } catch(e) {
            console.error("Failed to generate filename, falling back to random.", e);
        }
    }
    
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadString(storageRef, dataUrl, 'data_url', {
        contentType: 'image/jpeg'
    });

    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
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

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where("handle", "==", slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return toProduct(docSnap);
    }
    return null;
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const productsCol = collection(db, 'products');
  
  const newProduct: Partial<Product> = { ...product };

  if (newProduct.compareAtPrice === undefined) {
    newProduct.compareAtPrice = null;
  }
  if (newProduct.costPerItem === undefined) {
    newProduct.costPerItem = null;
  }

  if (!newProduct.images || newProduct.images.length === 0) {
      newProduct.images = [`https://picsum.photos/600/600?random=${Math.floor(Math.random() * 1000)}`];
  }
  
  const docRef = await addDoc(productsCol, newProduct);
  return docRef.id;
}

export async function importProducts(products: Product[]): Promise<void> {
    const batch = writeBatch(db);
    const productsCol = collection(db, 'products');
    
    products.forEach(product => {
        const docRef = doc(productsCol);
        const newProduct: any = { ...product };
        if (!newProduct.images || newProduct.images.length === 0) {
          newProduct.images = [`https://picsum.photos/600/600?random=${Math.floor(Math.random() * 1000)}`];
        }
        batch.set(docRef, newProduct);
    });

    await batch.commit();
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  const docRef = doc(db, 'products', id);
  const updateData = { ...productData };

  // Ensure images array is not empty before updating.
  if (updateData.images && Array.isArray(updateData.images) && updateData.images.length === 0) {
      updateData.images = [`https://picsum.photos/600/600?random=${Math.floor(Math.random() * 1000)}`];
  }
  
  await updateDoc(docRef, updateData);
}

export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
}

export async function getCollections(): Promise<Collection[]> {
    const collectionsCol = collection(db, 'collections');
    const collectionSnapshot = await getDocs(collectionsCol);
    const collectionList = collectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
    return collectionList.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const docRef = doc(db, 'collections', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Collection;
  } else {
    return null;
  }
}

export async function addCollection(collectionData: Omit<Collection, 'id'>): Promise<string> {
    const collectionsCol = collection(db, 'collections');
    const docRef = await addDoc(collectionsCol, collectionData);
    return docRef.id;
}

export async function updateCollection(id: string, collectionData: Partial<Omit<Collection, 'id'>>): Promise<void> {
    const collectionRef = doc(db, 'collections', id);
    const oldCollectionSnap = await getDoc(collectionRef);
    
    if (!oldCollectionSnap.exists()) {
        throw new Error("Collection not found");
    }

    const oldName = oldCollectionSnap.data().name;
    const newName = collectionData.name;

    const batch = writeBatch(db);

    // Update collection document
    batch.update(collectionRef, collectionData);

    // If the name changed, update products that use this category
    if (newName && oldName !== newName) {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where("category", "==", oldName));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((productDoc) => {
            const productRef = doc(db, 'products', productDoc.id);
            batch.update(productRef, { category: newName });
        });
    }

    await batch.commit();
}


export async function deleteCollection(id: string): Promise<void> {
  const docRef = doc(db, 'collections', id);
  await deleteDoc(docRef);
}


export async function getCustomers(): Promise<Customer[]> {
  const customersCol = collection(db, 'customers');
  const customerSnapshot = await getDocs(customersCol);
  const customerList = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
  return customerList;
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const docRef = doc(db, 'customers', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Customer;
  } else {
    return null;
  }
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<string> {
    const customersCol = collection(db, 'customers');
    const docRef = await addDoc(customersCol, customer);
    return docRef.id;
}

export async function updateCustomer(id: string, customerData: Partial<Omit<Customer, 'id'>>): Promise<void> {
    const docRef = doc(db, 'customers', id);
    await updateDoc(docRef, customerData);
}

export async function deleteCustomer(id: string): Promise<void> {
    const docRef = doc(db, 'customers', id);
    await deleteDoc(docRef);
}

export async function importCustomers(customers: Omit<Customer, 'id'>[]): Promise<void> {
    const batch = writeBatch(db);
    const customersCol = collection(db, 'customers');
    
    customers.forEach(customer => {
        const docRef = doc(customersCol);
        batch.set(docRef, customer);
    });

    await batch.commit();
}

    