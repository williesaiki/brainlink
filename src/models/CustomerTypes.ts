// Customer Database Type Definitions

// Customer status options
export type CustomerStatus = 'active' | 'inactive' | 'lead' | 'prospect' | 'archived';

// Customer category/segment
export type CustomerCategory = 'individual' | 'business' | 'investor' | 'developer' | 'other';

// Purchase status
export type PurchaseStatus = 'initiated' | 'in_progress' | 'completed' | 'cancelled';

// Communication type
export type CommunicationType = 'email' | 'phone' | 'meeting' | 'note' | 'other';

// Communication record
export interface Communication {
  id: string;
  type: CommunicationType;
  date: string; // ISO format
  content: string;
  user_id: string; // User who created the record
  created_at: string;
}

// Purchase/transaction record
export interface Purchase {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO format
  status: PurchaseStatus;
  reference_id?: string; // Optional reference to external system
  property_id?: string; // Optional reference to property
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Address structure
export interface Address {
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_primary?: boolean;
}

// Company information
export interface CompanyDetails {
  name: string;
  tax_id?: string;
  industry?: string;
  website?: string;
  size?: string; // e.g., "1-10", "11-50", etc.
  founded_year?: number;
}

// Customer preferences
export interface CustomerPreferences {
  preferred_contact_method?: 'email' | 'phone' | 'sms';
  preferred_contact_time?: 'morning' | 'afternoon' | 'evening';
  email_subscribed?: boolean;
  marketing_consent?: boolean;
  notification_settings?: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
  };
  property_preferences?: {
    locations: string[];
    price_min?: number;
    price_max?: number;
    property_types?: string[];
    min_area?: number;
    max_area?: number;
    bedrooms?: number;
    bathrooms?: number;
  };
}

// Main Customer type
export interface Customer {
  id: string;
  // Core information
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  additional_phone?: string;
  
  // Additional information
  date_of_birth?: string;
  nationality?: string;
  language?: string;
  address?: Address;
  additional_addresses?: Address[];
  photo_url?: string;
  
  // Company information (if applicable)
  company?: CompanyDetails;
  job_title?: string;
  
  // Classification
  status: CustomerStatus;
  category: CustomerCategory;
  assigned_agent_id?: string;
  assigned_agent_name?: string;
  
  // Metadata
  tags: string[];
  notes: string | null;
  custom_fields?: Record<string, any>;
  
  // Preferences
  preferences: CustomerPreferences;
  
  // Relations
  related_customers?: string[]; // IDs of related customers (e.g., family members)
  
  // System fields
  user_id: string; // Owner of this customer record
  created_at: string;
  updated_at: string;
  last_contact_date?: string;
}