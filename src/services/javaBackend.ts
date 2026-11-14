// TypeScript service connecting the HTML/CSS/TypeScript/JS frontend
// directly to the Java Backend Server (AgriTourismServer on port 8080),
// with automatic offline queueing & auto-sync on reconnect.

const OFFLINE_QUEUE_KEY = 'agritourism_offline_sync_queue_v1';

interface OfflineMutation {
  id: string;
  path: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

const resolveApiBase = (): string => {
  if (typeof window !== 'undefined' && window.location.port === '8080') {
    return '';
  }
  return 'http://localhost:8080';
};

function readQueue(): OfflineMutation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineMutation[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineMutation[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore quota errors cleanly
  }
}

function enqueueMutation(path: string, payload: Record<string, unknown>) {
  const queue = readQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    path,
    payload,
    createdAt: new Date().toISOString(),
  });
  writeQueue(queue);
}

export async function flushOfflineQueue(): Promise<number> {
  if (typeof window === 'undefined' || !navigator.onLine) return 0;
  const queue = readQueue();
  if (queue.length === 0) return 0;

  const base = resolveApiBase();
  const remaining: OfflineMutation[] = [];
  let synced = 0;

  for (const item of queue) {
    try {
      const res = await fetch(`${base}${item.path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });
      if (res.ok) {
        synced += 1;
      } else {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }

  writeQueue(remaining);
  return synced;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void flushOfflineQueue();
  });
  if (navigator.onLine) {
    void flushOfflineQueue();
  }
}

async function postJson<T>(path: string, payload: Record<string, unknown>): Promise<T | null> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    enqueueMutation(path, payload);
    return null;
  }
  try {
    const base = resolveApiBase();
    const res = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      enqueueMutation(path, payload);
      return null;
    }
    return (await res.json()) as T;
  } catch {
    // Save mutation to offline queue so it syncs automatically once backend/internet is reachable
    enqueueMutation(path, payload);
    return null;
  }
}

async function getJson<T>(path: string): Promise<T | null> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null;
  }
  try {
    const base = resolveApiBase();
    const res = await fetch(`${base}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const javaBackend = {
  checkHealth: () => getJson<{ status: string; backend: string; jdbcConnected: boolean }>('/api/health'),
  flushOfflineQueue,
  getPendingSyncCount: () => readQueue().length,

  login: (email: string, role: string) =>
    postJson<{ ok: boolean; email: string; fullName: string; role: string }>('/api/auth/login', {
      email,
      role,
    }),

  signup: (fullName: string, email: string, phone: string, role: string) =>
    postJson<{ ok: boolean; fullName: string; email: string; role: string }>('/api/auth/signup', {
      fullName,
      email,
      phone,
      role,
    }),

  createBooking: (booking: {
    id: number;
    bookingCode: string;
    customerName: string;
    farmName: string;
    activity: string;
    tourDate: string;
    participants: number;
    totalAmount: number;
    status: string;
  }) => postJson<{ ok: boolean; id: number }>('/api/bookings', booking),

  updateBookingStatus: (id: number, status: string) =>
    postJson<{ ok: boolean }>('/api/bookings', { action: 'updateStatus', id, status }),

  createProduct: (product: {
    id: number;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit: string;
  }) => postJson<{ ok: boolean; id: number }>('/api/products', product),

  decrementProductStock: (productId: number, quantity: number) =>
    postJson<{ ok: boolean }>('/api/products', {
      action: 'decrementStock',
      productId,
      quantity,
    }),

  createOrder: (order: {
    id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    paymentMethod: string;
  }) => postJson<{ ok: boolean; id: string }>('/api/orders', order),

  updateOrderTracking: (orderId: string, fulfillmentStatus: string, currentLocation: string) =>
    postJson<{ ok: boolean }>('/api/orders', {
      action: 'updateTracking',
      orderId,
      fulfillmentStatus,
      currentLocation,
    }),
};
