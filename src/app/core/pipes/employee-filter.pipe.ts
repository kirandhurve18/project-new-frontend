import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'employeeFilter'
})
export class EmployeeFilterPipe implements PipeTransform {
  transform(employees: any[], searchText: string): any[] {
    if (!employees) return [];
    if (!searchText) return employees;
    searchText = searchText.toLowerCase();
    return employees.filter(emp =>
      emp.full_name.toLowerCase().includes(searchText)
    );
  }
}
