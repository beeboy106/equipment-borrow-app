export type UserGroup = 'อาจารย์' | 'นักศึกษา' | 'บุคลากรภายใน';

export type BorrowStatus = 'pending' | 'approved' | 'rejected' | 'returned' | 'cancelled';

export interface Item {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
  total_quantity: number;
  available_quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface BorrowRequestItem {
  id: string;
  request_id?: string;
  item_id: string;
  requested_qty: number;
  approved_qty?: number | null;
  item?: {
    id: string;
    name: string;
    image_url: string | null;
    available_quantity?: number;
    total_quantity?: number;
  } | null;
}

export interface BorrowRequest {
  id: string;
  user_id?: string | null;
  borrower_name: string;
  borrower_email: string;
  phone: string;
  user_group: UserGroup;
  purpose: string;
  use_date: string;
  return_date: string;
  pickup_time?: string | null;
  admin_note?: string | null;
  status: BorrowStatus;
  created_at?: string;
  updated_at?: string;
  borrow_items?: BorrowRequestItem[];
}

export interface AdvanceBorrowFormData {
  borrower_name: string;
  borrower_email: string;
  phone: string;
  user_group: UserGroup;
  purpose: string;
  use_date: string;
  return_date: string;
}

export interface StatsSummary {
  totalItems: number;
  availableItems: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  returnedRequests: number;
  totalRequests: number;
}
