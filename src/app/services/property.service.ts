import { Injectable } from '@angular/core';
import { Property } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  private properties: Property[] = [
    {
      id: 1,
      title: 'Beautiful Family House',
      description: 'A beautiful and spacious family house with a large garden.',
      price: 300000,
      location: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      type: 'House'
    },
    {
      id: 2,
      title: 'Modern Apartment in the City',
      description: 'A modern apartment in the heart of the city, close to all amenities.',
      price: 200000,
      location: 'London, UK',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      type: 'Apartment'
    },
    {
      id: 3,
      title: 'Cozy Condo with a View',
      description: 'A cozy condo with a stunning view of the mountains.',
      price: 150000,
      location: 'Vancouver, Canada',
      image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      type: 'Condo'
    },
    {
      id: 4,
      title: 'Luxury Villa with Private Pool',
      description: 'A luxurious villa with a private pool and breathtaking ocean views.',
      price: 1200000,
      location: 'Malibu, USA',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      type: 'House'
    },
    {
      id: 5,
      title: 'Charming Downtown Apartment',
      description: 'A charming apartment located in the historic downtown area.',
      price: 250000,
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2580&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      type: 'Apartment'
    },
    {
      id: 6,
      title: 'Mountain View Condo',
      description: 'A modern condo with panoramic mountain views.',
      price: 180000,
      location: 'Aspen, USA',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      type: 'Condo'
    }
  ];

  constructor() { }

  getProperties(): Property[] {
    return this.properties;
  }

  getFilteredProperties(location: string, price: string, type: string): Property[] {
    return this.properties.filter(p => 
      (location ? p.location.toLowerCase().includes(location.toLowerCase()) : true) &&
      (type ? p.type.toLowerCase() === type.toLowerCase() : true)
    );
  }
}