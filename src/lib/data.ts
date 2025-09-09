
import { db, storage } from './firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import type { Product, Collection, Customer } from './types';
import { generateFilename } from '@/ai/flows/generate-filename';

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

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const productsCol = collection(db, 'products');
  const newProduct = { ...product };
  if (!newProduct.images || newProduct.images.length === 0) {
      newProduct.images = [`https://picsum.photos/600/600?random=${Math.floor(Math.random() * 1000)}`];
  }
  const docRef = await addDoc(productsCol, newProduct);
  return docRef.id;
}

export async function importProducts(products: Omit<Product, 'id'>[]): Promise<void> {
    const batch = writeBatch(db);
    const productsCol = collection(db, 'products');
    
    products.forEach(product => {
        const docRef = doc(productsCol);
        const newProduct = { ...product };
        if (!newProduct.images || newProduct.images.length === 0) {
          newProduct.images = [`https://picsum.photos/600/600?random=${Math.floor(Math.random() * 1000)}`];
        }
        batch.set(docRef, newProduct);
    });

    await batch.commit();
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

// MOCK CUSTOMER DATA - replace with real firestore calls
const mockCustomers: Customer[] = [
    {
        id: '1',
        clientType: 'ORGANIZATION',
        company: 'Piedmont Corp',
        contacts: [{ name: 'John Doe', email: 'john@piedmont.com', phone: '555-1234', role: 'Primary' }],
        billingStreet: '123 Main St',
        billingCity: 'Anytown',
        billingState: 'CA',
        billingZip: '12345',
        shippingStreet: '123 Main St',
        shippingCity: 'Anytown',
        shippingState: 'CA',
        shippingZip: '12345',
        taxExempt: true,
        taxExemptionNumber: 'TX-123456',
        gstNumber: ''
    },
    {
        id: '2',
        clientType: 'INDIVIDUAL',
        company: '',
        contacts: [{ name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678', role: 'Primary' }],
        billingStreet: '456 Side St',
        billingCity: 'Otherville',
        billingState: 'NY',
        billingZip: '54321',
        shippingStreet: '456 Side St',
        shippingCity: 'Otherville',
        shippingState: 'NY',
        shippingZip: '54321',
        taxExempt: false,
    }
];

export async function getCustomers(): Promise<Customer[]> {
  // In a real app, this would fetch from Firestore
  return Promise.resolve(mockCustomers);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  // In a real app, this would fetch from Firestore
  const customer = mockCustomers.find(c => c.id === id);
  return Promise.resolve(customer || null);
}

export async function addCustomer(customer: Omit<Customer, 'id'>): Promise<string> {
    console.log("Adding customer", customer);
    // In a real app, this would use addDoc to add to Firestore
    const newId = (mockCustomers.length + 1).toString();
    mockCustomers.push({id: newId, ...customer});
    return Promise.resolve(newId);
}

export async function updateCustomer(id: string, customerData: Partial<Omit<Customer, 'id'>>): Promise<void> {
    console.log("Updating customer", id, customerData);
    // In a real app, this would use updateDoc
    const index = mockCustomers.findIndex(c => c.id === id);
    if(index > -1) {
        mockCustomers[index] = { ...mockCustomers[index], ...customerData };
    }
    return Promise.resolve();
}

export async function deleteCustomer(id: string): Promise<void> {
    console.log("Deleting customer", id);
    // In a real app, this would use deleteDoc
    const index = mockCustomers.findIndex(c => c.id === id);
    if(index > -1) {
        mockCustomers.splice(index, 1);
    }
    return Promise.resolve();
}
