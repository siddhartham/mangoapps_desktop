import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedBodyComponent } from './feed-body.component';

describe('FeedBodyComponent', () => {
  let component: FeedBodyComponent;
  let fixture: ComponentFixture<FeedBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
