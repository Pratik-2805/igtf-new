export interface Franchise {
  id: string;
  name: string;
  categories: string[];
  investmentRange: {
    min: number;
    max: number;
  };
  description: string;
  shortDescription: string;
  roi: string | number;
  yearsInBusiness: number;
  unitsOperating: number;
  supportLevel: string;
  image: string;
  logo?: string;
  website?: string;
  highlights: string[];
  verified?: boolean;
  email_address?: string;
  contact_number?: string;
}

export interface Exhibition {
  id: string;
  name: string;
  date: Date;
  location: string;
  description: string;
  image: string;
  featured: boolean;
  attendees?: number;
  booths?: number;
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  businessType?: string;
  investmentCapacity?: string;
  message: string;
}

export interface Investor {
  id: string;
  name: string;
  location: string;
  investmentCapacity: string;
  preferredIndustries: string[];
  experience: string;
  description: string;
  image: string;
  verified: boolean;
  firmName?: string;
  email?: string;
  phone_number?: string;
}
