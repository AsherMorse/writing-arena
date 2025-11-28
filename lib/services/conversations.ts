/**
 * Conversations Service
 * Handles CRUD operations for improve conversations
 */

import { db } from '../config/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export interface ImproveConversation {
  id?: string;
  userId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function saveImproveConversation(
  uid: string,
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }>
): Promise<string> {
  const conversationsRef = collection(db, 'improveConversations');
  const conversationRef = doc(conversationsRef);
  
  const conversationData = {
    userId: uid,
    messages: messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: Timestamp.fromDate(msg.timestamp),
    })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(conversationRef, conversationData);
  return conversationRef.id;
}

export async function updateImproveConversation(
  conversationId: string,
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }>
): Promise<void> {
  const conversationRef = doc(db, 'improveConversations', conversationId);
  
  await updateDoc(conversationRef, {
    messages: messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: Timestamp.fromDate(msg.timestamp),
    })),
    updatedAt: serverTimestamp(),
  });
}

export async function getImproveConversations(uid: string, limitCount = 10): Promise<ImproveConversation[]> {
  const { query, where, orderBy, getDocs, limit } = await import('firebase/firestore');
  const conversationsRef = collection(db, 'improveConversations');
  
  const q = query(
    conversationsRef,
    where('userId', '==', uid),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    messages: doc.data().messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
    })),
  } as ImproveConversation));
}

export async function getImproveConversation(conversationId: string): Promise<ImproveConversation | null> {
  const conversationRef = doc(db, 'improveConversations', conversationId);
  const snapshot = await getDoc(conversationRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    messages: data.messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp?.toDate?.() || new Date(msg.timestamp),
    })),
  } as ImproveConversation;
}

