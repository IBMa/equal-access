export class FilterController {
    private filters: Array<{ id: string; text: string; checked: boolean }> = [
      { id: '0', text: 'Violations', checked: true },
      { id: '1', text: 'Needs review', checked: true },
      { id: '2', text: 'Recommendations', checked: true },
      { id: '3', text: 'Hidden', checked: false }, 
    ];
  
    getFilters() {
      return this.filters;
    }
  
    setFilters(updatedFilters: Array<{ id: string; text: string; checked: boolean }>) {
      this.filters = updatedFilters;
    }
  }
  
  export const filterController = new FilterController();
  