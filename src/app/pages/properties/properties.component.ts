import { Component, OnInit } from '@angular/core';
import { Property } from '../../models/property.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { PropertyListComponent } from '../../components/property-list/property-list.component';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [ReactiveFormsModule, PropertyListComponent],
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css']
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  filterForm: FormGroup;

  constructor(
    private propertyService: PropertyService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      location: [''],
      price: [''],
      type: ['']
    });
  }

  ngOnInit(): void {
    this.properties = this.propertyService.getProperties();
  }

  filterProperties(): void {
    const { location, price, type } = this.filterForm.value;
    this.properties = this.propertyService.getFilteredProperties(location, price, type);
  }
}
