import { Component, DoCheck, OnInit } from '@angular/core';
import { faAdd, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { DialogRef } from '@ui/ui/dialog';
import { WebSocketService } from '../../services/websockets/web-socket.service';

type RuleType = 'Image name' | 'Image caption' | 'Image date' | 'File type';
type Comparison = 'string' | 'date' | 'number';

interface Test {
  ruleType: RuleType;
  ruleTypes: string[];
  ruleComparison: string;
  ruleComparisons: string[];
  ruleValue: string;
  ruleValueType: 'text' | 'date';
}

@Component({
  templateUrl: './add-smart-collection.component.html',
  styleUrls: ['./add-smart-collection.component.scss']
})
export class AddSmartCollectionComponent implements OnInit, DoCheck {

  readonly ruleTypes: RuleType[] = ['Image name', 'Image caption', 'Image date', 'File type'];
  readonly comparisonDates = ['is', 'is not', 'before', 'after', 'between'];
  readonly comparisonStrings = ['contains', 'does not contain', 'is', 'is not', 'starts with', 'ends with'];
  readonly comparisonNumbers = ['is', 'is not', 'less than', 'greater than'];

  ruleName = '';
  faAdd = faAdd;
  faDelete = faTrashCan;
  match: 'all' | 'any' = 'all';
  defaultTest: Test = {
    ruleValueType: 'text',
    ruleType: 'Image name',
    ruleTypes: this.ruleTypes,
    ruleComparison: 'contains',
    ruleComparisons: this.comparisonStrings,
    ruleValue: ''
  };
  tests: Test[] = [];
  invalid = true;

  constructor(
    private readonly dialogRef: DialogRef,
    private readonly socketService: WebSocketService
  ) { }

  ngOnInit() {
    if (this.tests.length === 0) {
      this.addTest();
    }
  }

  ngDoCheck() {
    console.log(this.ruleName);
    this.tests.forEach(test => console.log(test.ruleValue));
    this.invalid = this.tests.some(test => test.ruleValue.trim() === '');
  }

  addTest() {
    this.tests.push(Object.assign({}, this.defaultTest));
  }

  removeTest(test: Test) {
    this.tests = this.tests.filter(i => i !== test);
  }

  setComparisons(value: RuleType, test: Test) {
    test.ruleComparison = 'contains';
    test.ruleValueType = 'text';
    test.ruleValue = '';
    switch (value) {
      case 'File type':
        test.ruleComparisons = this.comparisonStrings;
        break;
      case 'Image caption':
        test.ruleComparisons = this.comparisonStrings;
        break;
      case 'Image date':
        test.ruleComparisons = this.comparisonDates;
        test.ruleComparison = 'is';
        test.ruleValueType = 'date';
        break;
      case 'Image name':
        test.ruleComparisons = this.comparisonStrings;
        break;
      case 'File type':
        test.ruleComparisons = this.comparisonStrings;
        break;
    }
  }

  addCollection() {
    const collection: SmartCollection = {
      label: this.ruleName,
      type: 'smart',
      info: {
        match: this.match,
        rules: this.tests.map(t => {
          return {
            type: t.ruleType,
            comparer: t.ruleComparison,
            value: t.ruleValue
          };
        }).filter(i => i.value.trim().length > 0)
      }
    };
    this.socketService.send<SmartCollection, CollectionAddResponse>('manage/collections/create', collection).subscribe(({ data }) => {
      if (data.status === true) {
        // this.dialogRef.close(sendData);
      }
      // this.folderExists = data.message === 'folder exists';
    });
  }

}
