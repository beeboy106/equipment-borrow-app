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

export interface BorrowItemDetail {
  id: string;
  quantity: number;
  item: {
    name: string;
    image_url: string | null;
  } | null;
}

export interface BorrowRecord {
  id: string;
  borrower_name: string;
  borrower_email: string;
  borrower_phone: string;
  purpose: string;
  borrow_date: string;
  expected_return_date: string;
  actual_return_date: string | null;
  status: 'borrowed' | 'returned' | 'cancelled';
  created_at?: string;
  borrow_items?: BorrowItemDetail[];
}

export interface BorrowFormData {
  borrower_name: string;
  borrower_email: string;
  borrower_phone: string;
  purpose: string;
  expected_return_date: string;
}

export interface StatsSummary {
  totalItems: number;
  availableItems: number;
  activeBorrows: number;
  returnedBorrows: number;
  categoriesCount: number;
}
