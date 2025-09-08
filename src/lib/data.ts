
import { db, storage } from './firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product, Collection } from './types';

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

export async function uploadImageAndGetURL(dataUrl: string, folder: string): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
    const storageRef = ref(storage, fileName);
    
    // Upload the data URL string
    const snapshot = await uploadString(storageRef, dataUrl, 'data_url', {
        contentType: 'image/jpeg'
    });

    // Get the download URL
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
