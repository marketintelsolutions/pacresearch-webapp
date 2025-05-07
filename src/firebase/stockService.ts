import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Stock } from "../types";

const COLLECTION_NAME = "stocks";
const stocksCollection = collection(db, COLLECTION_NAME);

export const getStocks = async (): Promise<Stock[]> => {
  const snapshot = await getDocs(stocksCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Stock));
};

export const getTopGainers = async (count: number = 5): Promise<Stock[]> => {
  const q = query(stocksCollection, orderBy("change", "desc"), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Stock));
};

export const getTopLosers = async (count: number = 5): Promise<Stock[]> => {
  const q = query(stocksCollection, orderBy("change", "asc"), limit(count));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Stock));
};

export const addStock = async (stock: Omit<Stock, "id">): Promise<string> => {
  const docRef = await addDoc(stocksCollection, stock);
  return docRef.id;
};

export const updateStock = async (
  id: string,
  stock: Partial<Omit<Stock, "id">>
): Promise<void> => {
  const stockRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(stockRef, stock);
};

export const deleteStock = async (id: string): Promise<void> => {
  const stockRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(stockRef);
};
