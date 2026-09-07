import { createClient } from '@supabase/supabase-js';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  console.log('Fetching items from Supabase...');
  const { data: items, error: itemsError } = await supabase.from('items').select('*');
  if (itemsError) {
    console.error('Error fetching items from Supabase:', itemsError);
    return;
  }
  console.log(`Found ${items?.length || 0} items in Supabase.`);

  if (items && items.length > 0) {
    for (const item of items) {
      console.log(`Migrating item: ${item.name} (${item.id})...`);
      await setDoc(doc(db, 'items', item.id), {
        name: item.name,
        description: item.description || '',
        category: item.category || 'ทั่วไป',
        image_url: item.image_url || null,
        total_quantity: Number(item.total_quantity || 0),
        available_quantity: Number(item.available_quantity || 0),
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
      }, { merge: true });
    }
    console.log('Items migration completed successfully!');
  }

  console.log('Fetching borrow requests from Supabase...');
  const { data: requests, error: reqError } = await supabase
    .from('borrow_requests')
    .select('*, borrow_items(id, item_id, requested_qty, approved_qty, item:items(name, image_url, available_quantity))');

  if (reqError) {
    console.error('Error fetching requests from Supabase:', reqError);
  } else if (requests && requests.length > 0) {
    console.log(`Found ${requests.length} borrow requests in Supabase.`);
    for (const req of requests) {
      console.log(`Migrating request: #${req.id.substring(0, 8)} (${req.borrower_name})...`);
      const itemsList = (req.borrow_items || []).map((bi) => ({
        id: bi.id,
        item_id: bi.item_id,
        requested_qty: bi.requested_qty,
        approved_qty: bi.approved_qty ?? null,
        item: bi.item ? {
          name: bi.item.name,
          image_url: bi.item.image_url || null,
          available_quantity: bi.item.available_quantity,
        } : null,
      }));

      await setDoc(doc(db, 'borrow_requests', req.id), {
        borrower_name: req.borrower_name,
        borrower_email: req.borrower_email,
        phone: req.phone,
        user_group: req.user_group,
        department_or_unit: req.department_or_unit || '',
        purpose: req.purpose || '',
        use_date: req.use_date,
        return_date: req.return_date,
        pickup_time: req.pickup_time || null,
        admin_note: req.admin_note || null,
        status: req.status || 'pending',
        user_id: req.user_id || null,
        created_at: req.created_at || new Date().toISOString(),
        updated_at: req.updated_at || new Date().toISOString(),
        borrow_items: itemsList,
      }, { merge: true });
    }
    console.log('Borrow requests migration completed successfully!');
  }

  console.log('=== All migrations finished! ===');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
