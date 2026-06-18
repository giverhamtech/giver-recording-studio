import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection as firestoreCollection,
  doc as firestoreDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  onSnapshot,
  increment as firestoreIncrement
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  getDownloadURL,
  uploadBytesResumable
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBG0IzRUN831nw8j273zRbDmJC0Ysa7Buk',
  authDomain: 'giver-recording-studio.firebaseapp.com',
  projectId: 'giver-recording-studio',
  storageBucket: 'giver-recording-studio.firebasestorage.app',
  messagingSenderId: '365116469350',
  appId: '1:365116469350:web:f579fd70fea7e80693fda7'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const authListeners = new Set();
let currentAuthModel = null;

const buildAuthModel = async (user) => {
  if (!user) return null;

  let role = null;
  try {
    const tokenResult = await user.getIdTokenResult();
    role = tokenResult?.claims?.role || null;
  } catch {
    // Fallback to authenticated user only
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: role || 'admin',
    providerData: user.providerData
  };
};

onAuthStateChanged(auth, async (user) => {
  currentAuthModel = await buildAuthModel(user);
  authListeners.forEach((listener) => listener(currentAuthModel));
});

export const authStore = {
  get isValid() {
    return !!currentAuthModel;
  },
  get model() {
    return currentAuthModel;
  },
  onChange(callback) {
    authListeners.add(callback);
    return () => authListeners.delete(callback);
  }
};

const normalizeValue = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (!Number.isNaN(Number(trimmed)) && trimmed !== '') {
    return Number(trimmed);
  }
  return value;
};

const getCollectionRef = (collectionName) => firestoreCollection(db, collectionName);

const storageBucket = firebaseConfig.storageBucket;

const generateStoragePath = (collectionName, fieldName, filename) => {
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${collectionName}/${fieldName}/${Date.now()}-${cleanName}`;
};

const getPublicStorageUrl = (filePath) => {
  if (!filePath) return null;
  if (/^https?:\/\//.test(filePath)) return filePath;
  const normalized = filePath.replace(/^\/+/, '');
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(normalized)}?alt=media`;
};

const resolveFilePath = (fileField) => {
  if (!fileField) return null;
  if (typeof fileField === 'string') return fileField;
  if (Array.isArray(fileField) && fileField.length > 0) return resolveFilePath(fileField[0]);
  if (typeof fileField === 'object') {
    if (fileField.path) return fileField.path;
    if (fileField.downloadURL) return fileField.downloadURL;
    if (fileField.url) return fileField.url;
    if (fileField.file) return resolveFilePath(fileField.file);
  }
  return null;
};

const parseFilterClause = (clause) => {
  const normalized = clause.trim();
  const regex = /^([^!=~\s]+)\s*(==|!=|=|~)\s*(.*)$/;
  const match = normalized.match(regex);
  if (!match) return null;
  const [, field, operator, rawValue] = match;
  let value = rawValue.trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  value = normalizeValue(value);

  if (operator === '=' || operator === '==') {
    return where(field, '==', value);
  }

  if (operator === '!=') {
    return where(field, '!=', value);
  }

  if (operator === '~') {
    const start = String(value);
    const end = `${start}\uf8ff`;
    return [where(field, '>=', start), where(field, '<=', end)];
  }

  return null;
};

const parseFilter = (filter) => {
  if (!filter) return [];
  const clauses = filter.split('&&').map((item) => item.trim()).filter(Boolean);
  const filters = [];
  for (const clause of clauses) {
    const parsed = parseFilterClause(clause);
    if (parsed) {
      if (Array.isArray(parsed)) {
        filters.push(...parsed);
      } else {
        filters.push(parsed);
      }
    }
  }
  return filters;
};

const parseSort = (sort) => {
  if (!sort) return null;
  const direction = sort.startsWith('-') ? 'desc' : 'asc';
  const field = sort.replace(/^-/, '');
  return firestoreOrderBy(field, direction);
};

const getRelationCollectionName = (fieldName) => {
  if (fieldName === 'category') return 'categories';
  if (fieldName === 'artist') return 'artists';
  if (fieldName === 'service') return 'services';
  if (fieldName.endsWith('Id')) return `${fieldName.slice(0, -2)}s`;
  if (fieldName.endsWith('Image')) return `${fieldName}s`;
  if (fieldName.endsWith('file')) return `${fieldName}s`;
  return `${fieldName}s`;
};

const expandRecord = async (record, expandOption) => {
  if (!expandOption || typeof expandOption !== 'string') return record;
  const expandFields = expandOption.split(',').map((field) => field.trim()).filter(Boolean);
  const expanded = {};

  for (const field of expandFields) {
    const relatedId = record[field];
    if (!relatedId || typeof relatedId !== 'string') continue;

    const relationCollection = getRelationCollectionName(field);
    try {
      const relatedDoc = await getDoc(firestoreDoc(db, relationCollection, relatedId));
      if (relatedDoc.exists()) {
        expanded[field] = {
          id: relatedDoc.id,
          ...relatedDoc.data()
        };
      }
    } catch {
      // Ignore missing relation documents
    }
  }

  if (Object.keys(expanded).length === 0) return record;
  return {
    ...record,
    expand: {
      ...record.expand,
      ...expanded
    }
  };
};

const getCollectionRecords = async (collectionName, options = {}) => {
  const collectionRef = getCollectionRef(collectionName);
  const filters = parseFilter(options.filter);
  const sort = parseSort(options.sort || options.order || options.sortBy);
  const q = query(collectionRef, ...filters, ...(sort ? [sort] : []), ...(options.limit ? [firestoreLimit(options.limit)] : []));

  const snapshot = await getDocs(q);
  const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (options.expand) {
    const expandedRecords = await Promise.all(records.map((record) => expandRecord(record, options.expand)));
    return expandedRecords;
  }

  return records;
};

const uploadFileToStorage = async (collectionName, fieldName, file) => {
  const path = generateStoragePath(collectionName, fieldName, file.name);
  const storageReference = storageRef(storage, path);
  await uploadBytesResumable(storageReference, file);
  return getPublicStorageUrl(path);
};

const normalizeData = async (collectionName, data) => {
  const normalized = {};

  if (data instanceof FormData) {
    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        normalized[key] = await uploadFileToStorage(collectionName, key, value);
      } else if (key.endsWith('+')) {
        const cleanKey = key.slice(0, -1);
        normalized[cleanKey] = firestoreIncrement(Number(normalizeValue(value)) || 1);
      } else if (key.endsWith('-')) {
        const cleanKey = key.slice(0, -1);
        normalized[cleanKey] = firestoreIncrement(-(Number(normalizeValue(value)) || 1));
      } else {
        normalized[key] = normalizeValue(value);
      }
    }
    return normalized;
  }

  for (const [key, value] of Object.entries(data || {})) {
    if (value instanceof File) {
      normalized[key] = await uploadFileToStorage(collectionName, key, value);
    } else if (key.endsWith('+')) {
      const cleanKey = key.slice(0, -1);
      normalized[cleanKey] = firestoreIncrement(Number(value) || 1);
    } else if (key.endsWith('-')) {
      const cleanKey = key.slice(0, -1);
      normalized[cleanKey] = firestoreIncrement(-(Number(value) || 1));
    } else {
      normalized[key] = normalizeValue(value);
    }
  }

  return normalized;
};

const pb = {
  auth,
  db,
  storage,
  authStore,
  files: {
    getURL(record, fileField) {
      const resolvedPath = resolveFilePath(fileField);
      return getPublicStorageUrl(resolvedPath);
    }
  },
  collection(collectionName) {
    const wrappedCollectionName = String(collectionName);

    return {
      getFullList: async (options = {}) => {
        return getCollectionRecords(wrappedCollectionName, options);
      },
      getList: async (page = 1, perPage = 50, options = {}) => {
        const allRecords = await getCollectionRecords(wrappedCollectionName, options);
        const totalItems = allRecords.length;
        const start = (page - 1) * perPage;
        const pagedItems = allRecords.slice(start, start + perPage);

        return {
          items: pagedItems,
          page,
          perPage,
          totalItems,
          totalPages: Math.max(1, Math.ceil(totalItems / perPage))
        };
      },
      getOne: async (id, options = {}) => {
        const docRef = firestoreDoc(db, wrappedCollectionName, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          throw new Error(`Record not found in ${wrappedCollectionName} with id ${id}`);
        }
        let record = { id: docSnap.id, ...docSnap.data() };
        if (options.expand) {
          record = await expandRecord(record, options.expand);
        }
        return record;
      },
      getFirstListItem: async (filter, options = {}) => {
        const records = await getCollectionRecords(wrappedCollectionName, { ...options, filter, limit: 1 });
        return records.length > 0 ? records[0] : null;
      },
      create: async (data, options = {}) => {
        const normalized = await normalizeData(wrappedCollectionName, data);
        const docRef = await addDoc(getCollectionRef(wrappedCollectionName), normalized);
        return { id: docRef.id, ...normalized };
      },
      update: async (id, data, options = {}) => {
        const docRef = firestoreDoc(db, wrappedCollectionName, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          throw new Error(`Record not found in ${wrappedCollectionName} with id ${id}`);
        }
        const normalized = await normalizeData(wrappedCollectionName, data);
        await updateDoc(docRef, normalized);
        return { id, ...docSnap.data(), ...normalized };
      },
      delete: async (id, options = {}) => {
        await deleteDoc(firestoreDoc(db, wrappedCollectionName, id));
        return true;
      },
      subscribe: (path, callback) => {
        const subscriptionKey = `${wrappedCollectionName}:${path}`;
        if (!pb._subscriptions) pb._subscriptions = {};
        if (pb._subscriptions[subscriptionKey]) {
          return pb._subscriptions[subscriptionKey];
        }

        const collectionRef = getCollectionRef(wrappedCollectionName);
        const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const record = { id: change.doc.id, ...change.doc.data() };
            callback({ action: change.type, record });
          });
        });

        pb._subscriptions[subscriptionKey] = unsubscribe;
        return unsubscribe;
      },
      unsubscribe: (path) => {
        const subscriptionKey = `${wrappedCollectionName}:${path}`;
        if (pb._subscriptions && pb._subscriptions[subscriptionKey]) {
          pb._subscriptions[subscriptionKey]();
          delete pb._subscriptions[subscriptionKey];
        }
      }
    };
  }
};

export default pb;
