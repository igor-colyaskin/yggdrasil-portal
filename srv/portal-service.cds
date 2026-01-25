using {com.epic.yggdrasil as db} from '../db/schema';

// HR Сервис (OData v4) - Наш "Overview"
service HRService @(path: '/odata/v4/hr') {
    entity Staff as projection on db.Employees;
    entity Departments as projection on db.Departments; // Даем доступ к справочнику
}

// Финансовый сервис (Будем имитировать OData v2)
service FinanceService @(path: '/finance') {
    entity Payrolls as projection on db.Payrolls;
    entity Assets   as projection on db.TechnicalAssets;
}

// Производственный сервис (Для карточек проектов)
service ProjectService @(path: '/odata/v4/projects') {
    entity Assignments as projection on db.ProjectAssignments;
}
