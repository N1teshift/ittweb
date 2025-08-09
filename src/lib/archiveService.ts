import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';

// Check if we're on the client side
const isClient = typeof window !== 'undefined';
import { ArchiveEntry, CreateArchiveEntry, DateInfo } from '@/types/archive';

const ARCHIVE_COLLECTION = 'archives';

// Image compression constants
const COMPRESSION_THRESHOLD = 2 * 1024 * 1024; // 2MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Replay upload constants
const MAX_REPLAY_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_REPLAY_EXTENSIONS = ['.w3g'];

// Compress image if needed
const compressImage = async (file: File): Promise<File> => {
  if (file.size <= COMPRESSION_THRESHOLD) {
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1920px width)
      const maxWidth = 1920;
      const ratio = Math.min(maxWidth / img.width, 1);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Upload image to Firebase Storage
export const uploadImage = async (file: File): Promise<string> => {
  if (!isClient) {
    throw new Error('Upload is only available on the client side');
  }
  
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }

  const compressedFile = await compressImage(file);
  const timestamp = Date.now();
  const fileName = `archives/${timestamp}_${file.name}`;
  const storageRef = ref(storage, fileName);
  
  await uploadBytes(storageRef, compressedFile);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
};

// Upload multiple images
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const uploads = files.map((f) => uploadImage(f));
  return Promise.all(uploads);
};

// Upload replay to Firebase Storage
export const uploadReplay = async (file: File): Promise<string> => {
  if (!isClient) {
    throw new Error('Upload is only available on the client side');
  }

  if (file.size > MAX_REPLAY_SIZE) {
    throw new Error('Replay file too large. Maximum size is 50MB.');
  }

  const fileNameLower = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_REPLAY_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
  if (!hasAllowedExtension) {
    throw new Error('Invalid replay file type. Please upload a .w3g file.');
  }

  const timestamp = Date.now();
  const fileName = `archives/replays/${timestamp}_${file.name}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};

// Extract YouTube video ID from URL
export const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  
  // Additional validation to ensure it's a valid YouTube video ID
  if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return videoId;
  }
  
  return null;
};

// Create archive entry
export const createArchiveEntry = async (entry: CreateArchiveEntry): Promise<string> => {
  if (!isClient) {
    throw new Error('Creating entries is only available on the client side');
  }
  
  const docRef = await addDoc(collection(db, ARCHIVE_COLLECTION), {
    ...entry,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  return docRef.id;
};

// Get all archive entries
export const getArchiveEntries = async (): Promise<ArchiveEntry[]> => {
  if (!isClient) {
    throw new Error('Fetching entries is only available on the client side');
  }
  
  const q = query(
    collection(db, ARCHIVE_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const entries: ArchiveEntry[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    entries.push({
      id: doc.id,
      title: data.title,
      content: data.content,
      author: data.author,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      images: data.images,
      videoUrl: data.videoUrl,
      replayUrl: data.replayUrl,
      sectionOrder: data.sectionOrder,
      dateInfo: data.dateInfo,
      createdAt: data.createdAt.toDate().toISOString(),
      updatedAt: data.updatedAt.toDate().toISOString()
    });
  });
  
  return entries;
};

// Update archive entry
export const updateArchiveEntry = async (id: string, updates: Partial<CreateArchiveEntry>): Promise<void> => {
  if (!isClient) {
    throw new Error('Updating entries is only available on the client side');
  }
  
  const docRef = doc(db, ARCHIVE_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

// Delete archive entry
export const deleteArchiveEntry = async (id: string): Promise<void> => {
  if (!isClient) {
    throw new Error('Deleting entries is only available on the client side');
  }
  
  const docRef = doc(db, ARCHIVE_COLLECTION, id);
  await deleteDoc(docRef);
};

// Sort entries by date (dated entries first, then undated)
export const sortArchiveEntries = (entries: ArchiveEntry[], order: 'newest' | 'oldest' = 'newest'): ArchiveEntry[] => {
  return entries.sort((a, b) => {
    // If both are undated, sort by creation date
    if (a.dateInfo.type === 'undated' && b.dateInfo.type === 'undated') {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return order === 'newest' ? timeB - timeA : timeA - timeB;
    }
    
    // Undated entries go to the end
    if (a.dateInfo.type === 'undated') return 1;
    if (b.dateInfo.type === 'undated') return -1;
    
    // For dated entries, sort by date
    const dateA = a.dateInfo.singleDate || a.dateInfo.startDate || '';
    const dateB = b.dateInfo.singleDate || b.dateInfo.startDate || '';
    
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    const timeA = new Date(dateA).getTime();
    const timeB = new Date(dateB).getTime();
    return order === 'newest' ? timeB - timeA : timeA - timeB;
  });
};
